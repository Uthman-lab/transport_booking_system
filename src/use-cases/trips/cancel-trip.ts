import type { Trip } from "@/domain/trip/trip.entity";
import type { TripRepository } from "@/domain/trip/trip.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type CancelTripDeps = {
  tripRepository: TripRepository;
};

export async function cancelTrip(
  { tripRepository }: CancelTripDeps,
  tripId: string,
): Promise<Result<Trip, Error>> {
  try {
    return ok(await tripRepository.cancelTrip(tripId));
  } catch (cause) {
    return err(new Error("Could not cancel the trip.", { cause }));
  }
}
