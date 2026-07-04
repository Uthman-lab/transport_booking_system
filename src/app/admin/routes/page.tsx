import { RouteForm } from "@/components/admin/route-form";
import { SupabaseRouteRepository } from "@/data/repositories/supabase-route.repository";
import { createClient } from "@/data/supabase/server";
import { listRoutes } from "@/use-cases/routes/list-routes";

export default async function AdminRoutesPage() {
  const supabase = await createClient();
  const routes = await listRoutes({
    routeRepository: new SupabaseRouteRepository(supabase),
  });

  return (
    <section>
      <h2 className="text-lg font-semibold">Routes</h2>

      {routes.length === 0 ? (
        <p className="mt-4 text-muted">No routes yet. Add one below.</p>
      ) : (
        <ul className="mt-4 divide-y divide-card-border rounded-card border border-card-border bg-card">
          {routes.map((route) => (
            <li key={route.id} className="px-4 py-3 font-medium">
              {route.origin} → {route.destination}
            </li>
          ))}
        </ul>
      )}

      <RouteForm />
    </section>
  );
}
