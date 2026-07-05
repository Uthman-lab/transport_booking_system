import type { Booking, BookingStatus, BookingWithTrip } from "@/domain/booking/booking.entity";

// Row shape matching supabase/migrations/20260704141635_init_schema.sql (public.bookings).
export type BookingRow = {
  id: string;
  trip_id: string;
  student_id: string;
  seat_number: number;
  status: string;
  hold_expires_at: string;
  ticket_code: string;
  // Added by the check-in migration. Optional here so rows returned by RPCs that
  // don't select it still map cleanly (treated as not-yet-checked-in).
  checked_in_at?: string | null;
  created_at: string;
};

export function toBookingEntity(row: BookingRow): Booking {
  return {
    id: row.id,
    tripId: row.trip_id,
    studentId: row.student_id,
    seatNumber: row.seat_number,
    status: row.status as BookingStatus,
    holdExpiresAt: new Date(row.hold_expires_at),
    ticketCode: row.ticket_code,
    checkedInAt: row.checked_in_at ? new Date(row.checked_in_at) : null,
    createdAt: new Date(row.created_at),
  };
}

// Row shape for a booking joined with its trip + route, used by the ticket and
// My Bookings reads. The nested shape mirrors the PostgREST embed
// `*, trips(departure_at, price_ghs, routes(origin, destination))`.
export type BookingWithTripRow = BookingRow & {
  trips: {
    departure_at: string;
    price_ghs: number;
    routes: { origin: string; destination: string } | null;
  } | null;
};

export function toBookingWithTripEntity(row: BookingWithTripRow): BookingWithTrip {
  return {
    ...toBookingEntity(row),
    trip: {
      origin: row.trips?.routes?.origin ?? "Unknown",
      destination: row.trips?.routes?.destination ?? "Unknown",
      departureAt: new Date(row.trips?.departure_at ?? row.created_at),
      priceGhs: Number(row.trips?.price_ghs ?? 0),
    },
  };
}
