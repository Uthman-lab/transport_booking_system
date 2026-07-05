export type BookingStatus = "held" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  tripId: string;
  studentId: string;
  seatNumber: number;
  status: BookingStatus;
  holdExpiresAt: Date;
  ticketCode: string;
  // When set, the ticket has been scanned at boarding and is spent — it can't
  // be checked in again (enforced by the check_in_booking RPC).
  checkedInAt: Date | null;
  createdAt: Date;
};

export function isHoldExpired(booking: Booking, now: Date = new Date()): boolean {
  return booking.status === "held" && booking.holdExpiresAt.getTime() <= now.getTime();
}

// A confirmed ticket that's already been boarded — no longer valid for entry.
export function isCheckedIn(booking: Booking): boolean {
  return booking.checkedInAt !== null;
}

// Trip fields a ticket / My Bookings row needs to render, denormalized onto a
// booking so the UI doesn't have to fetch trips separately.
export type TripSummary = {
  origin: string;
  destination: string;
  departureAt: Date;
  priceGhs: number;
};

export type BookingWithTrip = Booking & { trip: TripSummary };
