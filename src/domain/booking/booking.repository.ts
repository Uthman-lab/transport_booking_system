import type { Booking, BookingWithTrip } from "./booking.entity";

export interface BookingRepository {
  createHold(input: { tripId: string; seatNumber: number }): Promise<Booking>;
  confirm(bookingId: string): Promise<Booking>;
  cancel(bookingId: string): Promise<Booking>;
  listForStudent(studentId: string): Promise<Booking[]>;
  findByIdWithTrip(bookingId: string): Promise<BookingWithTrip | null>;
  listForStudentWithTrip(studentId: string): Promise<BookingWithTrip[]>;
}
