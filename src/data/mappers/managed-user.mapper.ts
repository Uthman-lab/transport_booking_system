import type { UserRole } from "@/domain/auth/auth-user.entity";
import type { ManagedUser } from "@/domain/user/user.entity";

// Row shape matching public.profiles (see init schema + admin_user_management
// migrations). Admins read every row via the "profiles are viewable by owner or
// staff" RLS policy. The ONLY place the snake_case DB shape meets the camelCase
// domain shape for the user-management feature.
export type ProfileRow = {
  id: string;
  full_name: string;
  student_id: string | null;
  phone: string | null;
  role: string;
  invited_by: string | null;
  created_at: string;
};

export function toManagedUser(row: ProfileRow): ManagedUser {
  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id,
    phone: row.phone,
    role: row.role as UserRole,
    invitedBy: row.invited_by,
    createdAt: new Date(row.created_at),
    // Defaults; the page overlays these from the service-role invite states.
    email: null,
    invitePending: false,
  };
}
