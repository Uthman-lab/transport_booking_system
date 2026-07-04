import type { Trip } from "@/domain/trip/trip.entity";
import type { TripRepository } from "@/domain/trip/trip.repository";

export type ListAllTripsDeps = {
  tripRepository: TripRepository;
};

// Admin listing: every trip regardless of status or departure time.
export async function listAllTrips({
  tripRepository,
}: ListAllTripsDeps): Promise<Trip[]> {
  return tripRepository.listAll();
}
