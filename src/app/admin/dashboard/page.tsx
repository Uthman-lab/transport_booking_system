import { DashboardView } from "@/components/admin/dashboard-view";
import { SupabaseDashboardRepository } from "@/data/repositories/supabase-dashboard.repository";
import { createClient } from "@/data/supabase/server";
import { getAdminDashboard } from "@/use-cases/dashboard/get-admin-dashboard";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const dashboard = await getAdminDashboard({
    dashboardRepository: new SupabaseDashboardRepository(supabase),
  });

  return (
    <section>
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <p className="mt-1 text-sm text-muted">
        Demand, occupancy, and revenue across all routes.
      </p>
      <DashboardView dashboard={dashboard} />
    </section>
  );
}
