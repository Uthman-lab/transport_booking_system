import type { Trip, TripStatus } from "./trip.entity";

// Input for creating/updating a trip from the admin area. Uses domain types
// (Date, not ISO strings); the data layer translates to row shape.
export type NewTripInput = {
  routeId: string;
  departureAt: Date;
  capacity: number;
  priceGhs: number;
};

export type TripUpdate = Partial<{
  routeId: string;
  departureAt: Date;
  capacity: number;
  priceGhs: number;
  status: TripStatus;
}>;

// Port implemented by the data layer. The domain and use-cases layers depend
// only on this interface, never on a concrete Supabase/SQL implementation.
export interface TripRepository {
  listUpcoming(): Promise<Trip[]>;
  findById(tripId: string): Promise<Trip | null>;
  // Seat numbers currently held or confirmed on a trip, sourced from a
  // privileged DB function so it never leaks who holds them.
  listOccupiedSeats(tripId: string): Promise<number[]>;

  // Admin management. Writes are authorized at the DB by RLS (admin role) and
  // re-authorized in the use-case/action layer.
  listAll(): Promise<Trip[]>;
  createTrip(input: NewTripInput): Promise<Trip>;
  updateTrip(tripId: string, changes: TripUpdate): Promise<Trip>;
  cancelTrip(tripId: string): Promise<Trip>;
}
