"use client";

import { PendingLink } from "@/components/ui/pending-link";
import type { Trip } from "@/domain/trip/trip.entity";

export function StaffTripLink({ trip }: { trip: Trip }) {
  return (
    <PendingLink
      href={`/staff/trips/${trip.id}`}
      showSpinner={false}
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
    </PendingLink>
  );
}
