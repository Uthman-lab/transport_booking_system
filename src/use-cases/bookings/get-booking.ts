import type { BookingWithTrip } from "@/domain/booking/booking.entity";
import type { BookingRepository } from "@/domain/booking/booking.repository";

export type GetBookingDeps = {
  bookingRepository: BookingRepository;
};

export async function getBooking(
  { bookingRepository }: GetBookingDeps,
  bookingId: string,
): Promise<BookingWithTrip | null> {
  return bookingRepository.findByIdWithTrip(bookingId);
}
