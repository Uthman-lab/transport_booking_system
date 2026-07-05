import type { AdminDashboard } from "@/domain/dashboard/dashboard.entity";
import type { DashboardRepository } from "@/domain/dashboard/dashboard.repository";

export type GetAdminDashboardDeps = {
  dashboardRepository: DashboardRepository;
};

// Admin analytics: demand, occupancy, and revenue. Authorization lives in the
// get_admin_dashboard RPC (non-admins receive an empty dashboard).
export async function getAdminDashboard({
  dashboardRepository,
}: GetAdminDashboardDeps): Promise<AdminDashboard> {
  return dashboardRepository.getAdminDashboard();
}
