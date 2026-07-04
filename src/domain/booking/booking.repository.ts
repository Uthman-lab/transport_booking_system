import type { Booking } from "./booking.entity";

export interface BookingRepository {
  createHold(input: { tripId: string; seatNumber: number }): Promise<Booking>;
  confirm(bookingId: string): Promise<Booking>;
  cancel(bookingId: string): Promise<Booking>;
  listForStudent(studentId: string): Promise<Booking[]>;
}
