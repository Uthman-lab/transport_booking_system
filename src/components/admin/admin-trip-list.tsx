import Link from "next/link";
import { CancelTripButton } from "@/components/admin/cancel-trip-button";
import { availableSeats, type Trip, type TripStatus } from "@/domain/trip/trip.entity";

const STATUS_STYLES: Record<TripStatus, string> = {
  scheduled: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export function AdminTripList({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) {
    return <p className="mt-6 text-muted">No trips yet. Create one to get started.</p>;
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {trips.map((trip) => (
        <li
          key={trip.id}
          className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {trip.origin} → {trip.destination}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[trip.status]}`}
              >
                {trip.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {trip.departureAt.toLocaleString()} · GHS {trip.priceGhs.toFixed(2)} ·{" "}
              {trip.seatsBooked}/{trip.capacity} booked · {availableSeats(trip)} free
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/trips/${trip.id}/edit`}
              className="rounded-md border border-card-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-card"
            >
              Edit
            </Link>
            {trip.status === "scheduled" ? <CancelTripButton tripId={trip.id} /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
