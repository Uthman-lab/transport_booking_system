import Link from "next/link";
import { AdminTripList } from "@/components/admin/admin-trip-list";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { listAllTrips } from "@/use-cases/trips/list-all-trips";

export default async function AdminTripsPage() {
  const supabase = await createClient();
  const trips = await listAllTrips({
    tripRepository: new SupabaseTripRepository(supabase),
  });

  return (
    <section>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Trips</h2>
        <Link
          href="/admin/trips/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          New trip
        </Link>
      </div>
      <AdminTripList trips={trips} />
    </section>
  );
}
