import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PaymentPanel } from "@/components/bookings/payment-panel";
import { Ticket } from "@/components/bookings/ticket";
import { SupabaseBookingRepository } from "@/data/repositories/supabase-booking.repository";
import { createClient } from "@/data/supabase/server";
import { getBooking } from "@/use-cases/bookings/get-booking";

// Composition root: read the booking, then branch on its lifecycle status.
// QR generation happens here (server-side), not inside a component.
export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const booking = await getBooking(
    { bookingRepository: new SupabaseBookingRepository(supabase) },
    id,
  );

  if (!booking) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/my-bookings" className="text-sm text-link hover:underline">
        ← My bookings
      </Link>

      {booking.status === "held" ? (
        <PaymentPanel
          bookingId={booking.id}
          tripId={booking.tripId}
          amountGhs={booking.trip.priceGhs}
          holdExpiresAt={booking.holdExpiresAt}
        />
      ) : booking.status === "confirmed" ? (
        <Ticket booking={booking} qrDataUrl={await QRCode.toDataURL(booking.ticketCode)} />
      ) : (
        <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
          <h2 className="text-lg font-semibold">Booking cancelled</h2>
          <p className="mt-1 text-sm text-muted">
            This booking for {booking.trip.origin} → {booking.trip.destination} was cancelled.
          </p>
          <Link
            href={`/trips/${booking.tripId}`}
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Rebook
          </Link>
        </div>
      )}
    </main>
  );
}
