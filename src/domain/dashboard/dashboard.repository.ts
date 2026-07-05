import type { AdminDashboard } from "./dashboard.entity";

// Port implemented by the data layer. Returns the aggregated admin analytics
// (admin-only — enforced by the get_admin_dashboard RPC, which yields an empty
// dashboard for non-admin callers).
export interface DashboardRepository {
  getAdminDashboard(): Promise<AdminDashboard>;
}
