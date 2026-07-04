import { isSchedulable, type Trip } from "@/domain/trip/trip.entity";
import type { TripRepository, TripUpdate } from "@/domain/trip/trip.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type UpdateTripDeps = {
  tripRepository: TripRepository;
};

export async function updateTrip(
  { tripRepository }: UpdateTripDeps,
  tripId: string,
  changes: TripUpdate,
): Promise<Result<Trip, Error>> {
  if (changes.departureAt !== undefined && !isSchedulable(changes.departureAt)) {
    return err(new Error("Departure time must be in the future."));
  }

  try {
    return ok(await tripRepository.updateTrip(tripId, changes));
  } catch (cause) {
    return err(new Error("Could not update the trip.", { cause }));
  }
}
