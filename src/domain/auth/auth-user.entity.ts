export type UserRole = "student" | "staff" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  studentId: string | null;
  phone: string | null;
  role: UserRole;
};

// Pure role predicates (parallels trip.entity.ts helpers). Kept here so the
// UI and future admin/staff features branch on domain rules, not raw strings.
export function isAdmin(user: AuthUser): boolean {
  return user.role === "admin";
}

// Staff-level access. Admins are a superset of staff, mirroring the RLS
// policies that grant staff views to `role in ('admin', 'staff')`.
export function isStaff(user: AuthUser): boolean {
  return user.role === "staff" || user.role === "admin";
}
