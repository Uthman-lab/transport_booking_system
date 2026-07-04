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
