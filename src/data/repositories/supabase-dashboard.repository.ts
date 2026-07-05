import type { SupabaseClient } from "@supabase/supabase-js";
import { toAdminDashboard, type DashboardRow } from "@/data/mappers/dashboard.mapper";
import type { AdminDashboard } from "@/domain/dashboard/dashboard.entity";
import type { DashboardRepository } from "@/domain/dashboard/dashboard.repository";

export class SupabaseDashboardRepository implements DashboardRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAdminDashboard(): Promise<AdminDashboard> {
    // get_admin_dashboard aggregates everything in SQL and is gated to admins
    // (a non-admin caller gets null, mapped to an empty dashboard).
    const { data, error } = await this.supabase.rpc("get_admin_dashboard");

    if (error) throw error;
    return toAdminDashboard((data as DashboardRow | null) ?? null);
  }
}
