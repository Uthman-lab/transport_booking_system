import Link from "next/link";
import { notFound } from "next/navigation";
import { SeatMap } from "@/components/trips/seat-map";
import { WaitlistPanel } from "@/components/trips/waitlist-panel";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { availableSeats } from "@/domain/trip/trip.entity";
import { getTripSeatMap } from "@/use-cases/trips/get-trip-seat-map";

// Server Component composition root: wire the repository into the use case,
// then hand domain data to presentational/client components. Dynamic route
// params are async in this Next version, so await them.
export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const result = await getTripSeatMap(
    { tripRepository: new SupabaseTripRepository(supabase) },
    id,
  );

  if (!result) notFound();

  const { trip, seats } = result;
  const seatsLeft = availableSeats(trip);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/trips" className="text-sm text-link hover:underline">
        ← Back to trips
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-semibold">
          {trip.origin} → {trip.destination}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {trip.departureAt.toLocaleString()} · GHS {trip.priceGhs.toFixed(2)} ·{" "}
          {seatsLeft} of {trip.capacity} seats left
        </p>
      </header>

      {seatsLeft > 0 ? (
        <SeatMap tripId={trip.id} seats={seats} priceGhs={trip.priceGhs} />
      ) : (
        <WaitlistPanel tripId={trip.id} />
      )}
    </main>
  );
}
