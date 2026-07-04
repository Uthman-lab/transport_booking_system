import { UserList } from "@/components/admin/user-list";
import { isAdminClientConfigured } from "@/data/supabase/admin";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseUserRepository } from "@/data/repositories/supabase-user.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { listUsers } from "@/use-cases/users/list-users";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const [currentUser, users] = await Promise.all([
    getCurrentUser({ authRepository: new SupabaseAuthRepository(supabase) }),
    listUsers({ userRepository: new SupabaseUserRepository(supabase) }),
  ]);

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Users</h2>
      <p className="mt-1 text-sm text-muted">
        Manage roles and details for students, staff, and admins. You can delete
        or re-role admins you invited (and their invitees), but not yourself.
      </p>

      <UserList
        users={users}
        currentUserId={currentUser?.id ?? ""}
        inviteConfigured={isAdminClientConfigured()}
      />
    </section>
  );
}
