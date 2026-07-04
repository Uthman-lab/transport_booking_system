import type { Trip, TripStatus } from "@/domain/trip/trip.entity";

// Hand-written row shape matching supabase/migrations/20260704141635_init_schema.sql.
// Replace with generated types (`supabase gen types typescript`) once available,
// but keep this mapper as the single place that translates rows to domain entities.
export type TripRow = {
  id: string;
  route_id: string;
  departure_at: string;
  capacity: number;
  price_ghs: number;
  status: string;
  routes: { origin: string; destination: string } | null;
};

export function toTripEntity(row: TripRow, seatsBooked: number): Trip {
  return {
    id: row.id,
    routeId: row.route_id,
    origin: row.routes?.origin ?? "Unknown",
    destination: row.routes?.destination ?? "Unknown",
    departureAt: new Date(row.departure_at),
    capacity: row.capacity,
    priceGhs: Number(row.price_ghs),
    status: row.status as TripStatus,
    seatsBooked,
  };
}
