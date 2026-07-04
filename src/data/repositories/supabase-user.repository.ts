import type { SupabaseClient } from "@supabase/supabase-js";
import { toManagedUser, type ProfileRow } from "@/data/mappers/managed-user.mapper";
import type { ManagedUser, UserDetailsInput } from "@/domain/user/user.entity";
import type {
  UpdateRoleInput,
  UserRepository,
} from "@/domain/user/user.repository";

const PROFILE_SELECT = "id, full_name, student_id, phone, role, invited_by, created_at";

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

  async updateRole(userId: string, input: UpdateRoleInput): Promise<ManagedUser> {
    // Authorized at the DB by "profiles are updatable by owner or manager"; the
    // prevent_role_self_escalation trigger permits the change only for an admin
    // caller. invited_by is written when a caller promotes someone to admin.
    const patch: { role: string; invited_by?: string | null } = { role: input.role };
    if (input.invitedBy !== undefined) patch.invited_by = input.invitedBy;

    const { data, error } = await this.supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select(PROFILE_SELECT)
      .single<ProfileRow>();

    if (error) throw error;
    return toManagedUser(data);
  }

  async updateDetails(
    userId: string,
    details: UserDetailsInput,
  ): Promise<ManagedUser> {
    // RLS "profiles are updatable by owner or manager" enforces the hierarchy:
    // editing an admin outside the caller's subtree matches no row and surfaces
    // as PGRST116 (no rows), which the use case maps to a not-authorized error.
    const { data, error } = await this.supabase
      .from("profiles")
      .update({
        full_name: details.fullName,
        student_id: details.studentId,
        phone: details.phone,
      })
      .eq("id", userId)
      .select(PROFILE_SELECT)
      .single<ProfileRow>();

    if (error) throw error;
    return toManagedUser(data);
  }

  async delete(userId: string): Promise<void> {
    // Hard delete via the SECURITY DEFINER RPC, which authorizes with
    // internal.can_manage_user and cascades the user's profile/bookings.
    const { error } = await this.supabase.rpc("delete_user", { target: userId });
    if (error) throw error;
  }
}
