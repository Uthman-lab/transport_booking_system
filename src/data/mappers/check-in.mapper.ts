import type { CheckInResult } from "@/domain/check-in/check-in.entity";

// Shape of the jsonb returned by the public.check_in_booking RPC. Keys are
// already camelCase (built by jsonb_build_object); dates arrive as ISO strings.
export type CheckInRow = {
  ticketCode: string;
  passengerName: string;
  seatNumber: number;
  origin: string;
  destination: string;
  departureAt: string;
  checkedInAt: string;
};

export function toCheckInResult(row: CheckInRow): CheckInResult {
  return {
    ticketCode: row.ticketCode,
    passengerName: row.passengerName,
    seatNumber: row.seatNumber,
    origin: row.origin,
    destination: row.destination,
    departureAt: new Date(row.departureAt),
    checkedInAt: new Date(row.checkedInAt),
  };
}
