import { TripList } from "@/components/trips/trip-list";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { listAvailableTrips } from "@/use-cases/trips/list-available-trips";

// Server Component = the composition root for reads: wire a concrete
// repository into a use case, then hand the resulting domain data to a
// presentational component. No Supabase call happens outside this boundary.
export default async function TripsPage() {
  const supabase = await createClient();
  const tripRepository = new SupabaseTripRepository(supabase);
  const trips = await listAvailableTrips({ tripRepository });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Upcoming trips</h1>
      <TripList trips={trips} />
    </main>
  );
}
