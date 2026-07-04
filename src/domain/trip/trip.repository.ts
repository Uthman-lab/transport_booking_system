import type { Trip } from "./trip.entity";

// Port implemented by the data layer. The domain and use-cases layers depend
// only on this interface, never on a concrete Supabase/SQL implementation.
export interface TripRepository {
  listUpcoming(): Promise<Trip[]>;
  findById(tripId: string): Promise<Trip | null>;
}
