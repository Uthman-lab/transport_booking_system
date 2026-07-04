import type { UserRole } from "@/domain/auth/auth-user.entity";
import type { ManagedUser, UserDetailsInput } from "./user.entity";

export type UpdateRoleInput = {
  role: UserRole;
  // When set, also writes profiles.invited_by (used to record the promoter as
  // the inviter when elevating a user to admin). Omit to leave invited_by as-is.
  invitedBy?: string | null;
};

// Port implemented by the data layer for admin user management. The domain and
// use-cases layers depend only on this interface, never on @supabase/*.
export interface UserRepository {
  listAll(): Promise<ManagedUser[]>;
  updateRole(userId: string, input: UpdateRoleInput): Promise<ManagedUser>;
  updateDetails(userId: string, details: UserDetailsInput): Promise<ManagedUser>;
  delete(userId: string): Promise<void>;
}
