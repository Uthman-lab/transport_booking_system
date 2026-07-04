import type { SupabaseClient } from "@supabase/supabase-js";
import type { Trip } from "@/domain/trip/trip.entity";
import type { TripRepository } from "@/domain/trip/trip.repository";
import { toTripEntity, type TripRow } from "@/data/mappers/trip.mapper";

const ACTIVE_BOOKING_STATUSES = ["held", "confirmed"] as const;
const TRIP_SELECT = "id, route_id, departure_at, capacity, price_ghs, status, routes(origin, destination)";

export class SupabaseTripRepository implements TripRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listUpcoming(): Promise<Trip[]> {
    const { data: rows, error } = await this.supabase
      .from("trips")
      .select(TRIP_SELECT)
      .eq("status", "scheduled")
      .gt("departure_at", new Date().toISOString())
      .order("departure_at", { ascending: true })
      .returns<TripRow[]>();

    if (error) throw error;
    if (!rows || rows.length === 0) return [];

    const seatsBookedByTrip = await this.countActiveSeatsByTrip(rows.map((row) => row.id));
    return rows.map((row) => toTripEntity(row, seatsBookedByTrip.get(row.id) ?? 0));
  }

  async findById(tripId: string): Promise<Trip | null> {
    const { data: row, error } = await this.supabase
      .from("trips")
      .select(TRIP_SELECT)
      .eq("id", tripId)
      .maybeSingle<TripRow>();

    if (error) throw error;
    if (!row) return null;

    const seatsBookedByTrip = await this.countActiveSeatsByTrip([tripId]);
    return toTripEntity(row, seatsBookedByTrip.get(tripId) ?? 0);
  }

  private async countActiveSeatsByTrip(tripIds: string[]): Promise<Map<string, number>> {
    const { data: activeBookings, error } = await this.supabase
      .from("bookings")
      .select("trip_id")
      .in("trip_id", tripIds)
      .in("status", ACTIVE_BOOKING_STATUSES);

    if (error) throw error;

    const seatsBookedByTrip = new Map<string, number>();
    for (const booking of activeBookings ?? []) {
      seatsBookedByTrip.set(booking.trip_id, (seatsBookedByTrip.get(booking.trip_id) ?? 0) + 1);
    }
    return seatsBookedByTrip;
  }
}
