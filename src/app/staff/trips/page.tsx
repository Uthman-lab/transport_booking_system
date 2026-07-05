import Link from "next/link";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { listAllTrips } from "@/use-cases/trips/list-all-trips";

export default async function StaffTripsPage() {
  const supabase = await createClient();
  const trips = await listAllTrips({
    tripRepository: new SupabaseTripRepository(supabase),
  });

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Trips</h2>
      <p className="mt-1 text-sm text-muted">
        Pick a trip to see its boarding roster and check passengers in.
      </p>

      {trips.length === 0 ? (
        <p className="mt-4 text-muted">No trips yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-card-border rounded-xl border border-card-border bg-card">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/staff/trips/${trip.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-background"
              >
                <div>
                  <p className="font-medium">
                    {trip.origin} → {trip.destination}
                  </p>
                  <p className="text-xs text-muted">
                    {trip.departureAt.toLocaleString()} · {trip.seatsBooked}/{trip.capacity} seats booked
                  </p>
                </div>
                <span className="text-muted" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
