import type { Booking } from "@/domain/booking/booking.entity";
import { HoldExpiredError } from "@/domain/booking/booking.errors";
import type { BookingRepository } from "@/domain/booking/booking.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type ConfirmBookingDeps = {
  bookingRepository: BookingRepository;
};

// Simulated-payment confirmation. The confirm_booking RPC already enforces
// ownership, held status, and an unexpired hold; if it rejects, the most
// likely reason surfaced to the user is an expired hold.
export async function confirmBooking(
  { bookingRepository }: ConfirmBookingDeps,
  bookingId: string,
): Promise<Result<Booking, HoldExpiredError>> {
  try {
    const booking = await bookingRepository.confirm(bookingId);
    return ok(booking);
  } catch (cause) {
    return err(new HoldExpiredError({ cause }));
  }
}
