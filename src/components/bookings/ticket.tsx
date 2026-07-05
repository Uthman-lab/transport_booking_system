import Image from "next/image";
import { isCheckedIn, type BookingWithTrip } from "@/domain/booking/booking.entity";

// Presentational digital ticket. The QR data URL is generated in the page
// composition root (not here) and passed in as a prop.
export function Ticket({
  booking,
  qrDataUrl,
}: {
  booking: BookingWithTrip;
  qrDataUrl: string;
}) {
  const used = isCheckedIn(booking);

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-card-border bg-card">
      <div
        className={`px-6 py-4 ${used ? "bg-zinc-500 text-white" : "bg-primary text-primary-foreground"}`}
      >
        <p className="text-sm opacity-90">
          {used ? "Ticket used — already boarded" : "Confirmed ticket"}
        </p>
        <p className="text-lg font-semibold">
          {booking.trip.origin} → {booking.trip.destination}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <Image
            src={qrDataUrl}
            alt={`QR code for ticket ${booking.ticketCode}`}
            width={160}
            height={160}
            unoptimized
            className={`rounded-md border border-card-border ${used ? "opacity-30 grayscale" : ""}`}
          />
          {used ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="-rotate-12 rounded border-2 border-red-600 px-3 py-1 text-lg font-bold uppercase tracking-wider text-red-600">
                Used
              </span>
            </span>
          ) : null}
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted">Ticket code</dt>
          <dd className="font-mono font-medium uppercase">{booking.ticketCode}</dd>

          <dt className="text-muted">Seat</dt>
          <dd className="font-medium">{booking.seatNumber}</dd>

          <dt className="text-muted">Departure</dt>
          <dd className="font-medium">{booking.trip.departureAt.toLocaleString()}</dd>

          <dt className="text-muted">Fare paid</dt>
          <dd className="font-medium">GHS {booking.trip.priceGhs.toFixed(2)}</dd>

          {used && booking.checkedInAt ? (
            <>
              <dt className="text-muted">Boarded at</dt>
              <dd className="font-medium">{booking.checkedInAt.toLocaleString()}</dd>
            </>
          ) : null}
        </dl>
      </div>

      {used ? (
        <p className="border-t border-card-border bg-background px-6 py-3 text-sm text-muted">
          This ticket has already been used to board and is no longer valid for
          entry.
        </p>
      ) : null}
    </div>
  );
}
