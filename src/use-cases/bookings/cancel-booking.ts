import type { Booking } from "@/domain/booking/booking.entity";
import type { BookingRepository } from "@/domain/booking/booking.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type CancelBookingDeps = {
  bookingRepository: BookingRepository;
};

export async function cancelBooking(
  { bookingRepository }: CancelBookingDeps,
  bookingId: string,
): Promise<Result<Booking, Error>> {
  try {
    const booking = await bookingRepository.cancel(bookingId);
    return ok(booking);
  } catch (cause) {
    return err(new Error("Booking could not be cancelled.", { cause }));
  }
}
