import Link from "next/link";
import { TripCardLink } from "@/components/trips/trip-card-link";
import type { Trip } from "@/domain/trip/trip.entity";

// Presentational component: renders domain data only. It never imports
// Supabase, calls a use case, or knows how `trips` was fetched.
export function TripList({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
          <li key={trip.id}>
            <TripCardLink trip={trip} />
          </li>
        ))}
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
