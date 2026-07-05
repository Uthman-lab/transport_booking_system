import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  InviteByEmailInput,
  InvitedUser,
  InviteRepository,
  InviteState,
  ResendResult,
} from "@/domain/user/invite.repository";
import { sendInviteEmail } from "@/data/email/mailer";

// Implemented with a SERVICE-ROLE client (see data/supabase/admin.ts). We mint
// invite links with generateLink rather than inviteUserByEmail: generateLink is
// NOT throttled by Supabase's built-in mailer and works for both new and
// existing (unaccepted) users. The returned link uses the token_hash flow that
// /auth/confirm handles, so it works regardless of email-template config — the
// admin copies/shares it (auto-emailing would require custom SMTP).
export class SupabaseInviteRepository implements InviteRepository {
  constructor(
    private readonly admin: SupabaseClient,
    // App base URL, e.g. http://localhost:3000
    private readonly siteUrl: string,
  ) {}

  private redirectTo(): string {
    return `${this.siteUrl}/auth/confirm?next=/reset-password`;
  }

  // Builds the link that lands on our SSR confirm route with a token_hash.
  private buildLink(hashedToken: string): string {
    const params = new URLSearchParams({
      token_hash: hashedToken,
      type: "invite",
      next: "/reset-password",
    });
    return `${this.siteUrl}/auth/confirm?${params.toString()}`;
  }

  async inviteByEmail(input: InviteByEmailInput): Promise<InvitedUser> {
    const { data, error } = await this.admin.auth.admin.generateLink({
      type: "invite",
      email: input.email,
      // full_name is read by the internal.handle_new_user() signup trigger.
      options: { data: { full_name: input.fullName }, redirectTo: this.redirectTo() },
    });
    if (error) throw error;

    const user = data.user;
    const hashedToken = data.properties?.hashed_token;
    if (!user || !hashedToken) throw new Error("Invite link was not generated.");

    // The signup trigger created the profile as a 'student'. Set the chosen role
    // and record the inviter so an invited admin lands in the inviter's subtree.
    // Optional student_id/phone are written when the caller supplies them.
    const patch: {
      role: string;
      invited_by: string;
      student_id?: string | null;
      phone?: string | null;
    } = { role: input.role, invited_by: input.invitedBy };
    if (input.studentId !== undefined) patch.student_id = input.studentId;
    if (input.phone !== undefined) patch.phone = input.phone;

    const { error: updateError } = await this.admin
      .from("profiles")
      .update(patch)
      .eq("id", user.id);
    if (updateError) {
      // The auth user was created by generateLink but we couldn't finish setting
      // it up — remove it so this row leaves nothing behind.
      await this.admin.auth.admin.deleteUser(user.id).catch(() => {});
      throw updateError;
    }

    const actionLink = this.buildLink(hashedToken);
    const email = user.email ?? input.email;

    // Best-effort: email the same link so it also lands in the invitee's inbox.
    // If SMTP isn't configured or the send fails, the admin still has the link.
    let emailed = false;
    try {
      await sendInviteEmail({ to: email, fullName: input.fullName, link: actionLink, role: input.role });
      emailed = true;
    } catch (cause) {
      console.error("invite email send failed", cause);
    }

    return { id: user.id, email, role: input.role, actionLink, emailed };
  }

  async inviteManyAtomic(inputs: InviteByEmailInput[]): Promise<InvitedUser[]> {
    const created: InvitedUser[] = [];
    try {
      for (const input of inputs) {
        created.push(await this.inviteByEmail(input));
      }
      return created;
    } catch (cause) {
      // Roll back the whole batch: delete every account created so far so the
      // upload is all-or-nothing.
      await Promise.all(
        created.map((u) => this.admin.auth.admin.deleteUser(u.id).catch(() => {})),
      );
      throw cause;
    }
  }

  async listInviteStates(): Promise<InviteState[]> {
    const states: InviteState[] = [];
    const perPage = 200;
    for (let page = 1; ; page += 1) {
      const { data, error } = await this.admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data.users ?? [];
      for (const u of users) {
        states.push({
          userId: u.id,
          email: u.email ?? "",
          pending: Boolean(u.invited_at) && !u.email_confirmed_at,
        });
      }
      if (users.length < perPage) break;
    }
    return states;
  }

  async resendInvite(userId: string): Promise<ResendResult> {
    const { data: got, error: getError } = await this.admin.auth.admin.getUserById(userId);
    if (getError) throw getError;

    const user = got.user;
    if (!user?.email) throw new Error("User not found.");

    // Already accepted → nothing to resend. Surface a recognizable code the use
    // case maps to a typed domain error.
    if (user.email_confirmed_at) {
      const err = new Error("Invite already accepted.");
      (err as unknown as { code: string }).code = "invite_already_accepted";
      throw err;
    }

    const { data, error } = await this.admin.auth.admin.generateLink({
      type: "invite",
      email: user.email,
      options: { redirectTo: this.redirectTo() },
    });
    if (error) throw error;

    const hashedToken = data.properties?.hashed_token;
    if (!hashedToken) throw new Error("Invite link was not generated.");

    return { email: user.email, actionLink: this.buildLink(hashedToken) };
  }
}
