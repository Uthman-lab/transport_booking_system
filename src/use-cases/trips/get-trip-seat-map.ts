import { buildSeatMap, type Seat } from "@/domain/trip/seat-map";
import type { Trip } from "@/domain/trip/trip.entity";
import type { TripRepository } from "@/domain/trip/trip.repository";

export type GetTripSeatMapDeps = {
  tripRepository: TripRepository;
};

export type TripSeatMap = {
  trip: Trip;
  seats: Seat[];
};

export async function getTripSeatMap(
  { tripRepository }: GetTripSeatMapDeps,
  tripId: string,
): Promise<TripSeatMap | null> {
  const trip = await tripRepository.findById(tripId);
  if (!trip) return null;

  const occupied = await tripRepository.listOccupiedSeats(tripId);
  return { trip, seats: buildSeatMap(trip.capacity, occupied) };
}
