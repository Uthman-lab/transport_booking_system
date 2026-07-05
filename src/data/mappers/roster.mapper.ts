import type { RosterEntry } from "@/domain/roster/roster.entity";

// Shape of each element in the jsonb array returned by get_trip_roster. Keys are
// camelCase (built by jsonb_build_object); checkedInAt is an ISO string or null.
export type RosterRow = {
  bookingId: string;
  ticketCode: string;
  seatNumber: number;
  passengerName: string;
  checkedInAt: string | null;
};

export function toRosterEntry(row: RosterRow): RosterEntry {
  return {
    bookingId: row.bookingId,
    ticketCode: row.ticketCode,
    seatNumber: row.seatNumber,
    passengerName: row.passengerName,
    checkedInAt: row.checkedInAt ? new Date(row.checkedInAt) : null,
  };
}
