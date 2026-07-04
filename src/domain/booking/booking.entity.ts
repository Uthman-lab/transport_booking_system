export type BookingStatus = "held" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  tripId: string;
  studentId: string;
  seatNumber: number;
  status: BookingStatus;
  holdExpiresAt: Date;
  ticketCode: string;
  createdAt: Date;
};

export function isHoldExpired(booking: Booking, now: Date = new Date()): boolean {
  return booking.status === "held" && booking.holdExpiresAt.getTime() <= now.getTime();
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
