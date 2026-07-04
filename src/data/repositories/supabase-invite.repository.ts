import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  InviteByEmailInput,
  InvitedUser,
  InviteRepository,
  InviteState,
  ResendResult,
} from "@/domain/user/invite.repository";

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
    const { error: updateError } = await this.admin
      .from("profiles")
      .update({ role: input.role, invited_by: input.invitedBy })
      .eq("id", user.id);
    if (updateError) throw updateError;

    return {
      id: user.id,
      email: user.email ?? input.email,
      role: input.role,
      actionLink: this.buildLink(hashedToken),
    };
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
