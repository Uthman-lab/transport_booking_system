import Link from "next/link";
import { CancelTripButton } from "@/components/admin/cancel-trip-button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { availableSeats, type Trip, type TripStatus } from "@/domain/trip/trip.entity";

const STATUS_TONE: Record<TripStatus, BadgeTone> = {
  scheduled: "green",
  cancelled: "maroon",
  completed: "gold",
};

export function AdminTripList({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) {
    return <p className="mt-6 text-muted">No trips yet. Create one to get started.</p>;
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {trips.map((trip) => (
        <li key={trip.id}>
          <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {trip.origin} → {trip.destination}
                </p>
                <Badge tone={STATUS_TONE[trip.status]} className="capitalize">
                  {trip.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {trip.departureAt.toLocaleString()} · GHS {trip.priceGhs.toFixed(2)} ·{" "}
                {trip.seatsBooked}/{trip.capacity} booked · {availableSeats(trip)} free
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/trips/${trip.id}/edit`}
                className={buttonClasses("outline", "sm")}
              >
                Edit
              </Link>
              {trip.status === "scheduled" ? <CancelTripButton tripId={trip.id} /> : null}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
