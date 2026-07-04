import Link from "next/link";
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import type { BookingStatus, BookingWithTrip } from "@/domain/booking/booking.entity";

const STATUS_STYLES: Record<BookingStatus, string> = {
  held: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  held: "Awaiting payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

// Presentational component: renders domain bookings as props. Mutations are
// delegated to the CancelBookingButton client boundary.
export function BookingList({ bookings }: { bookings: BookingWithTrip[] }) {
  if (bookings.length === 0) {
    return (
      <p className="mt-6 text-muted">
        You have no bookings yet.{" "}
        <Link href="/trips" className="text-link underline">
          Browse trips
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {booking.trip.origin} → {booking.trip.destination}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
              >
                {STATUS_LABELS[booking.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {booking.trip.departureAt.toLocaleString()} · Seat {booking.seatNumber} · GHS{" "}
              {booking.trip.priceGhs.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {booking.status === "held" ? (
              <Link
                href={`/bookings/${booking.id}`}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Pay now
              </Link>
            ) : null}
            {booking.status === "confirmed" ? (
              <Link
                href={`/bookings/${booking.id}`}
                className="rounded-md border border-card-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-card"
              >
                View ticket
              </Link>
            ) : null}
            {booking.status === "cancelled" ? (
              <Link
                href={`/trips/${booking.tripId}`}
                className="rounded-md border border-card-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-card"
              >
                Rebook
              </Link>
            ) : (
              <CancelBookingButton bookingId={booking.id} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
