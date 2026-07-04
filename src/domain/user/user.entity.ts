import type { UserRole } from "@/domain/auth/auth-user.entity";

// A user as seen by an admin managing the directory. Mirrors public.profiles
// minus email — email lives in auth.users, which non-service clients can't read
// for other users, so managed users are identified by name + student ID.
export type ManagedUser = {
  id: string;
  fullName: string;
  studentId: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
};

// The full set of assignable roles, in ascending privilege order. Kept here so
// the UI renders the same options the domain considers valid.
export const USER_ROLES: readonly UserRole[] = ["student", "staff", "admin"];

export function isValidRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

// An admin may change anyone's role except their own. Blocking self-change
// stops an admin from accidentally demoting themselves out of the admin area
// (and, in the limit, every admin locking the whole system out). Reassigning
// your own role is a deliberate action that should go through another admin.
export function canAdminChangeRole(
  actingUserId: string,
  targetUserId: string,
): boolean {
  return actingUserId !== targetUserId;
}
