import type { UserRole } from "@/domain/auth/auth-user.entity";
import type { ManagedUser } from "@/domain/user/user.entity";

// Row shape matching public.profiles (see init schema migration). Admins read
// every row via the "profiles are viewable by owner or staff" RLS policy. The
// ONLY place the snake_case DB shape meets the camelCase domain shape for the
// user-management feature.
export type ProfileRow = {
  id: string;
  full_name: string;
  student_id: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export function toManagedUser(row: ProfileRow): ManagedUser {
  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id,
    phone: row.phone,
    role: row.role as UserRole,
    createdAt: new Date(row.created_at),
  };
}
