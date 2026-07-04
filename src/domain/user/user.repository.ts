import type { UserRole } from "@/domain/auth/auth-user.entity";
import type { ManagedUser } from "./user.entity";

// Port implemented by the data layer for admin user management. The domain and
// use-cases layers depend only on this interface, never on @supabase/*.
export interface UserRepository {
  listAll(): Promise<ManagedUser[]>;
  updateRole(userId: string, role: UserRole): Promise<ManagedUser>;
}
