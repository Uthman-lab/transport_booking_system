import Link from "next/link";
import { DestinationMedia } from "@/components/graphics/destination-media";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { availableSeats, type Trip } from "@/domain/trip/trip.entity";

// Presentational component: renders domain data only. It never imports
// Supabase, calls a use case, or knows how `trips` was fetched.
export function TripList({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => {
        const seats = availableSeats(trip);
        const scarce = seats <= 3;
        return (
          <li key={trip.id}>
            <Link href={`/trips/${trip.id}`} className="block h-full">
              <Card interactive className="flex h-full flex-col overflow-hidden">
                {/* Destination imagery with the route overlaid. */}
                <div className="relative h-36">
                  <DestinationMedia destination={trip.destination} />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                    <p className="text-sm font-semibold text-white drop-shadow">
                      {trip.origin} → {trip.destination}
                    </p>
                    <Badge tone="gold">GHS {trip.priceGhs.toFixed(2)}</Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="text-sm text-muted">
                    {trip.departureAt.toLocaleString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <Badge tone={scarce ? "maroon" : "green"}>
                      {seats} {seats === 1 ? "seat" : "seats"} left
                    </Badge>
                    <span className="text-sm font-medium text-primary">
                      Book now →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-card-border bg-surface px-6 py-16 text-center">
      <svg viewBox="0 0 96 96" className="h-20 w-20" role="img" aria-hidden="true">
        <circle cx="48" cy="48" r="44" fill="var(--surface-2)" />
        <g transform="translate(24 34)">
          <rect x="0" y="0" width="48" height="24" rx="5" fill="var(--brand-green)" />
          <rect x="5" y="5" width="9" height="8" rx="2" fill="#eef1ee" />
          <rect x="19" y="5" width="9" height="8" rx="2" fill="#eef1ee" />
          <rect x="33" y="5" width="9" height="8" rx="2" fill="#eef1ee" />
          <circle cx="12" cy="26" r="4" fill="#171717" />
          <circle cx="36" cy="26" r="4" fill="#171717" />
        </g>
      </svg>
      <p className="mt-4 font-medium">No upcoming trips right now</p>
      <p className="mt-1 text-sm text-muted">
        Check back soon — new trips open for booking ahead of each break.
      </p>
    </div>
  );
}
