import type { SupabaseClient } from "@supabase/supabase-js";
import type { Trip } from "@/domain/trip/trip.entity";
import type {
  NewTripInput,
  TripRepository,
  TripUpdate,
} from "@/domain/trip/trip.repository";
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

  async listOccupiedSeats(tripId: string): Promise<number[]> {
    // public.get_occupied_seats is a SECURITY INVOKER wrapper over a privileged
    // read; it returns only seat numbers, so no booking identity is exposed.
    const { data, error } = await this.supabase.rpc("get_occupied_seats", {
      p_trip_id: tripId,
    });

    if (error) throw error;
    return ((data as number[] | null) ?? []).map(Number);
  }

  async listAll(): Promise<Trip[]> {
    const { data: rows, error } = await this.supabase
      .from("trips")
      .select(TRIP_SELECT)
      .order("created_at", { ascending: false })
      .order("departure_at", { ascending: false })
      .returns<TripRow[]>();

    if (error) throw error;
    if (!rows || rows.length === 0) return [];

    const seatsBookedByTrip = await this.countActiveSeatsByTrip(rows.map((row) => row.id));
    return rows.map((row) => toTripEntity(row, seatsBookedByTrip.get(row.id) ?? 0));
  }

  async createTrip(input: NewTripInput): Promise<Trip> {
    // RLS ("trips are insertable by admin") authorizes this at the DB.
    const { data, error } = await this.supabase
      .from("trips")
      .insert({
        route_id: input.routeId,
        departure_at: input.departureAt.toISOString(),
        capacity: input.capacity,
        price_ghs: input.priceGhs,
      })
      .select(TRIP_SELECT)
      .single<TripRow>();

    if (error) throw error;
    return toTripEntity(data, 0);
  }

  async updateTrip(tripId: string, changes: TripUpdate): Promise<Trip> {
    const patch: Record<string, unknown> = {};
    if (changes.routeId !== undefined) patch.route_id = changes.routeId;
    if (changes.departureAt !== undefined) patch.departure_at = changes.departureAt.toISOString();
    if (changes.capacity !== undefined) patch.capacity = changes.capacity;
    if (changes.priceGhs !== undefined) patch.price_ghs = changes.priceGhs;
    if (changes.status !== undefined) patch.status = changes.status;

    const { data, error } = await this.supabase
      .from("trips")
      .update(patch)
      .eq("id", tripId)
      .select(TRIP_SELECT)
      .single<TripRow>();

    if (error) throw error;

    const seatsBookedByTrip = await this.countActiveSeatsByTrip([tripId]);
    return toTripEntity(data, seatsBookedByTrip.get(tripId) ?? 0);
  }

  async cancelTrip(tripId: string): Promise<Trip> {
    return this.updateTrip(tripId, { status: "cancelled" });
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
