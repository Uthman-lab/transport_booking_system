"use client";

import { PendingLink } from "@/components/ui/pending-link";
import { DestinationMedia } from "@/components/graphics/destination-media";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { availableSeats, type Trip } from "@/domain/trip/trip.entity";

export function TripCardLink({ trip }: { trip: Trip }) {
  const seats = availableSeats(trip);
  const scarce = seats <= 3;

  return (
    <PendingLink href={`/trips/${trip.id}`} className="block h-full">
      <Card interactive className="flex h-full flex-col overflow-hidden">
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
            <span className="text-sm font-medium text-primary">Book now →</span>
          </div>
        </div>
      </Card>
    </PendingLink>
  );
}
