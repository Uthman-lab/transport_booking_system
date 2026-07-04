import type { BookingWithTrip } from "@/domain/booking/booking.entity";
import type { BookingRepository } from "@/domain/booking/booking.repository";

export type ListMyBookingsDeps = {
  bookingRepository: BookingRepository;
};

export async function listMyBookings(
  { bookingRepository }: ListMyBookingsDeps,
  studentId: string,
): Promise<BookingWithTrip[]> {
  return bookingRepository.listForStudentWithTrip(studentId);
}
