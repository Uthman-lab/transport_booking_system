import Link from "next/link";
import { createTripAction } from "@/app/admin/trips/actions";
import { TripForm } from "@/components/admin/trip-form";
import { SupabaseRouteRepository } from "@/data/repositories/supabase-route.repository";
import { createClient } from "@/data/supabase/server";
import { listRoutes } from "@/use-cases/routes/list-routes";

export default async function NewTripPage() {
  const supabase = await createClient();
  const routes = await listRoutes({
    routeRepository: new SupabaseRouteRepository(supabase),
  });

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">New trip</h2>
      {routes.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          You need a route first.{" "}
          <Link href="/admin/routes" className="text-link underline">
            Add a route
          </Link>
          .
        </p>
      ) : (
        <TripForm action={createTripAction} routes={routes} submitLabel="Create trip" />
      )}
    </section>
  );
}
