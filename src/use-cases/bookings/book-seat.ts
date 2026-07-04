import type { Booking } from "@/domain/booking/booking.entity";
import { SeatUnavailableError, TripNotBookableError } from "@/domain/booking/booking.errors";
import type { BookingRepository } from "@/domain/booking/booking.repository";
import { isBookable } from "@/domain/trip/trip.entity";
import type { TripRepository } from "@/domain/trip/trip.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type BookSeatDeps = {
  tripRepository: TripRepository;
  bookingRepository: BookingRepository;
};

export type BookSeatInput = {
  tripId: string;
  seatNumber: number;
};

export type BookSeatError = TripNotBookableError | SeatUnavailableError;

export async function bookSeat(
  { tripRepository, bookingRepository }: BookSeatDeps,
  input: BookSeatInput,
): Promise<Result<Booking, BookSeatError>> {
  const trip = await tripRepository.findById(input.tripId);

  if (!trip || !isBookable(trip)) {
    return err(new TripNotBookableError(input.tripId));
  }

  try {
    const booking = await bookingRepository.createHold(input);
    return ok(booking);
  } catch (cause) {
    return err(new SeatUnavailableError(input.seatNumber, { cause }));
  }
}
