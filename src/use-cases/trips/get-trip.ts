import type { Trip } from "@/domain/trip/trip.entity";
import type { TripRepository } from "@/domain/trip/trip.repository";

export type GetTripDeps = {
  tripRepository: TripRepository;
};

export async function getTrip(
  { tripRepository }: GetTripDeps,
  tripId: string,
): Promise<Trip | null> {
  return tripRepository.findById(tripId);
}
