import { isBookable, type Trip } from "@/domain/trip/trip.entity";
import type { TripRepository } from "@/domain/trip/trip.repository";

export type ListAvailableTripsDeps = {
  tripRepository: TripRepository;
};

export async function listAvailableTrips({
  tripRepository,
}: ListAvailableTripsDeps): Promise<Trip[]> {
  const trips = await tripRepository.listUpcoming();
  return trips.filter((trip) => isBookable(trip));
}
