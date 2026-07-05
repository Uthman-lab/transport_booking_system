import type { SupabaseClient } from "@supabase/supabase-js";
import { toRosterEntry, type RosterRow } from "@/data/mappers/roster.mapper";
import type { RosterEntry } from "@/domain/roster/roster.entity";
import type { RosterRepository } from "@/domain/roster/roster.repository";

export class SupabaseRosterRepository implements RosterRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listForTrip(tripId: string): Promise<RosterEntry[]> {
    // get_trip_roster does the booking↔passenger join in SQL and is gated to
    // staff/admin (a non-staff caller gets an empty array).
    const { data, error } = await this.supabase.rpc("get_trip_roster", {
      p_trip_id: tripId,
    });

    if (error) throw error;
    return ((data ?? []) as RosterRow[]).map(toRosterEntry);
  }
}
