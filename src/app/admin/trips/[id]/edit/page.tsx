import { notFound } from "next/navigation";
import { updateTripAction } from "@/app/admin/trips/actions";
import { TripForm } from "@/components/admin/trip-form";
import { SupabaseRouteRepository } from "@/data/repositories/supabase-route.repository";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { listRoutes } from "@/use-cases/routes/list-routes";
import { getTrip } from "@/use-cases/trips/get-trip";

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [trip, routes] = await Promise.all([
    getTrip({ tripRepository: new SupabaseTripRepository(supabase) }, id),
    listRoutes({ routeRepository: new SupabaseRouteRepository(supabase) }),
  ]);

  if (!trip) notFound();

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Edit trip</h2>
      <TripForm action={updateTripAction} routes={routes} trip={trip} submitLabel="Save changes" />
    </section>
  );
}
