// A confirmed passenger on a trip, with boarding status — the unit of the
// staff/admin boarding roster.
export type RosterEntry = {
  bookingId: string;
  ticketCode: string;
  seatNumber: number;
  passengerName: string;
  checkedInAt: Date | null;
};

export function isBoarded(entry: RosterEntry): boolean {
  return entry.checkedInAt !== null;
}

export function boardedCount(entries: RosterEntry[]): number {
  return entries.filter(isBoarded).length;
}
