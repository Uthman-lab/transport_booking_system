import type { Booking, BookingStatus } from "@/domain/booking/booking.entity";

// Row shape matching supabase/migrations/20260704141635_init_schema.sql (public.bookings).
export type BookingRow = {
  id: string;
  trip_id: string;
  student_id: string;
  seat_number: number;
  status: string;
  hold_expires_at: string;
  ticket_code: string;
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
    createdAt: new Date(row.created_at),
  };
}
