import type { RosterEntry } from "./roster.entity";

// Port implemented by the data layer. Returns the confirmed passengers on a trip
// with boarding status (staff/admin only — enforced by the get_trip_roster RPC).
export interface RosterRepository {
  listForTrip(tripId: string): Promise<RosterEntry[]>;
}
