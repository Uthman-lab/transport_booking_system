import type { User } from "@supabase/supabase-js";
import type { AuthUser, UserRole } from "@/domain/auth/auth-user.entity";

// Row shape matching public.profiles in
// supabase/migrations/20260704141635_init_schema.sql. The ONLY place the
// snake_case DB shape meets the camelCase domain shape for auth.
export type ProfileRow = {
  id: string;
  full_name: string;
  student_id: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export function toAuthUser(
  user: Pick<User, "id" | "email">,
  profileRow: ProfileRow,
): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profileRow.full_name,
    studentId: profileRow.student_id,
    phone: profileRow.phone,
    role: profileRow.role as UserRole,
  };
}
