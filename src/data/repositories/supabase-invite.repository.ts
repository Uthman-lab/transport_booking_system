import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  InviteAdminInput,
  InvitedAdmin,
  InviteRepository,
} from "@/domain/user/invite.repository";

// Implemented with a SERVICE-ROLE client (see data/supabase/admin.ts). The
// service role is required to create an auth user + send the invite email, and
// it bypasses RLS + the role-escalation trigger so it can stamp the new admin's
// role and inviter.
export class SupabaseInviteRepository implements InviteRepository {
  constructor(
    private readonly admin: SupabaseClient,
    // Where the invite email link lands after verification (an /auth/confirm
    // URL that forwards to a set-password page).
    private readonly redirectTo: string,
  ) {}

  async inviteAdminByEmail(input: InviteAdminInput): Promise<InvitedAdmin> {
    const { data, error } = await this.admin.auth.admin.inviteUserByEmail(
      input.email,
      {
        // full_name is read by the internal.handle_new_user() signup trigger.
        data: { full_name: input.fullName },
        redirectTo: this.redirectTo,
      },
    );
    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error("Invite did not return a user.");

    // The signup trigger created the profile as a 'student'. Elevate it to admin
    // and record the inviter so the new admin lands in the inviter's subtree.
    const { error: updateError } = await this.admin
      .from("profiles")
      .update({ role: "admin", invited_by: input.invitedBy })
      .eq("id", user.id);
    if (updateError) throw updateError;

    return { id: user.id, email: user.email ?? input.email };
  }
}
