import { isSchedulable, type Trip } from "@/domain/trip/trip.entity";
import type { NewTripInput, TripRepository } from "@/domain/trip/trip.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type CreateTripDeps = {
  tripRepository: TripRepository;
};

export async function createTrip(
  { tripRepository }: CreateTripDeps,
  input: NewTripInput,
): Promise<Result<Trip, Error>> {
  // Business rule lives in the domain: a trip must depart in the future.
  if (!isSchedulable(input.departureAt)) {
    return err(new Error("Departure time must be in the future."));
  }

  try {
    return ok(await tripRepository.createTrip(input));
  } catch (cause) {
    return err(new Error("Could not create the trip.", { cause }));
  }
}
