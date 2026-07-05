// The outcome of a successful boarding scan — the details staff eyeball at the
// door. Built in the data layer from the check_in_booking RPC's JSON result.
export type CheckInResult = {
  ticketCode: string;
  passengerName: string;
  seatNumber: number;
  origin: string;
  destination: string;
  departureAt: Date;
  checkedInAt: Date;
};
