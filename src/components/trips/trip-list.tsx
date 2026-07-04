import Link from "next/link";
import { availableSeats, type Trip } from "@/domain/trip/trip.entity";

// Presentational component: renders domain data only. It never imports
// Supabase, calls a use case, or knows how `trips` was fetched.
export function TripList({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) {
    return (
      <p className="mt-6 text-muted">
        No upcoming trips are open for booking right now.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-card-border">
      {trips.map((trip) => (
        <li key={trip.id}>
          <Link
            href={`/trips/${trip.id}`}
            className="flex items-center justify-between py-4 transition-colors hover:text-primary"
          >
            <div>
              <p className="font-medium">
                {trip.origin} → {trip.destination}
              </p>
              <p className="text-sm text-muted">
                {trip.departureAt.toLocaleString()} · {availableSeats(trip)} seats left
              </p>
            </div>
            <span className="font-medium">GHS {trip.priceGhs.toFixed(2)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
