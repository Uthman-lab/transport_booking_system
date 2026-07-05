import Link from "next/link";
import { notFound } from "next/navigation";
import { RosterTable } from "@/components/staff/roster-table";
import { SupabaseRosterRepository } from "@/data/repositories/supabase-roster.repository";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { boardedCount } from "@/domain/roster/roster.entity";
import { getTripRoster } from "@/use-cases/roster/get-trip-roster";
import { getTrip } from "@/use-cases/trips/get-trip";

export default async function StaffTripRosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [trip, roster] = await Promise.all([
    getTrip({ tripRepository: new SupabaseTripRepository(supabase) }, id),
    getTripRoster({ rosterRepository: new SupabaseRosterRepository(supabase) }, id),
  ]);

  if (!trip) notFound();

  const boarded = boardedCount(roster);

  return (
    <section className="mt-6">
      <Link href="/staff/trips" className="text-sm text-link hover:underline">
        ← All trips
      </Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {trip.origin} → {trip.destination}
          </h2>
          <p className="text-sm text-muted">{trip.departureAt.toLocaleString()}</p>
        </div>
        <p className="text-sm">
          <span className="text-2xl font-semibold">{boarded}</span>
          <span className="text-muted"> / {roster.length} boarded</span>
        </p>
      </div>

      <RosterTable tripId={trip.id} entries={roster} />
    </section>
  );
}
