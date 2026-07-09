import { UserList } from "@/components/admin/user-list";
import { isMailerConfigured } from "@/data/email/mailer";
import { createAdminClient, isAdminClientConfigured } from "@/data/supabase/admin";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseInviteRepository } from "@/data/repositories/supabase-invite.repository";
import { SupabaseUserRepository } from "@/data/repositories/supabase-user.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { listInviteStates } from "@/use-cases/users/list-invite-states";
import { listUsers } from "@/use-cases/users/list-users";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const inviteConfigured = isAdminClientConfigured();
  const mailerConfigured = isMailerConfigured();

  const [currentUser, users, inviteStates] = await Promise.all([
    getCurrentUser({ authRepository: new SupabaseAuthRepository(supabase) }),
    listUsers({ userRepository: new SupabaseUserRepository(supabase) }),
    inviteConfigured
      ? listInviteStates({
          inviteRepository: new SupabaseInviteRepository(createAdminClient(), siteUrl()),
        })
      : Promise.resolve([]),
  ]);

  // Overlay email + pending status (sourced from auth.users) onto each profile.
  const stateById = new Map(inviteStates.map((s) => [s.userId, s]));
  const enriched = users.map((u) => {
    const state = stateById.get(u.id);
    return {
      ...u,
      email: state?.email ?? null,
      invitePending: state?.pending ?? false,
    };
  });

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Users</h2>
      <p className="mt-1 text-sm text-muted">
        Manage roles and details for students, staff, and admins. You can delete
        or re-role admins you invited (and their invitees), but not yourself.
      </p>

      <UserList
        users={enriched}
        currentUserId={currentUser?.id ?? ""}
        inviteConfigured={inviteConfigured}
        mailerConfigured={mailerConfigured}
      />
    </section>
  );
}
