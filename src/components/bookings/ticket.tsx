import Image from "next/image";
import type { BookingWithTrip } from "@/domain/booking/booking.entity";

// Presentational digital ticket. The QR data URL is generated in the page
// composition root (not here) and passed in as a prop.
export function Ticket({
  booking,
  qrDataUrl,
}: {
  booking: BookingWithTrip;
  qrDataUrl: string;
}) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-card-border bg-card">
      <div className="bg-primary px-6 py-4 text-primary-foreground">
        <p className="text-sm opacity-90">Confirmed ticket</p>
        <p className="text-lg font-semibold">
          {booking.trip.origin} → {booking.trip.destination}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
        <Image
          src={qrDataUrl}
          alt={`QR code for ticket ${booking.ticketCode}`}
          width={160}
          height={160}
          unoptimized
          className="rounded-md border border-card-border"
        />

        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted">Ticket code</dt>
          <dd className="font-mono font-medium uppercase">{booking.ticketCode}</dd>

          <dt className="text-muted">Seat</dt>
          <dd className="font-medium">{booking.seatNumber}</dd>

          <dt className="text-muted">Departure</dt>
          <dd className="font-medium">{booking.trip.departureAt.toLocaleString()}</dd>

          <dt className="text-muted">Fare paid</dt>
          <dd className="font-medium">GHS {booking.trip.priceGhs.toFixed(2)}</dd>
        </dl>
      </div>
    </div>
  );
}
