import type { SupabaseClient } from "@supabase/supabase-js";
import { toManagedUser, type ProfileRow } from "@/data/mappers/managed-user.mapper";
import type { UserRole } from "@/domain/auth/auth-user.entity";
import type { ManagedUser } from "@/domain/user/user.entity";
import type { UserRepository } from "@/domain/user/user.repository";

const PROFILE_SELECT = "id, full_name, student_id, phone, role, created_at";

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listAll(): Promise<ManagedUser[]> {
    // "profiles are viewable by owner or staff" RLS limits this to staff/admins;
    // the admin area is additionally gated by the proxy and admin layout.
    const { data, error } = await this.supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .order("created_at", { ascending: false })
      .returns<ProfileRow[]>();

    if (error) throw error;
    return (data ?? []).map(toManagedUser);
  }

  async updateRole(userId: string, role: UserRole): Promise<ManagedUser> {
    // Authorized at the DB by "profiles are updatable by owner or admin"; the
    // internal.prevent_role_self_escalation() trigger permits the role change
    // only because the caller is an admin (otherwise it silently reverts it).
    const { data, error } = await this.supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select(PROFILE_SELECT)
      .single<ProfileRow>();

    if (error) throw error;
    return toManagedUser(data);
  }
}
