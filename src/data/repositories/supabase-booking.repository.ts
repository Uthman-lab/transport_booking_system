import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRepository } from "@/domain/booking/booking.repository";
import { toBookingEntity, toBookingWithTripEntity, type BookingRow, type BookingWithTripRow } from "@/data/mappers/booking.mapper";
import type { Booking, BookingWithTrip } from "@/domain/booking/booking.entity";

const WITH_TRIP_SELECT = "*, trips(departure_at, price_ghs, routes(origin, destination))";

export class SupabaseBookingRepository implements BookingRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createHold(input: { tripId: string; seatNumber: number }): Promise<Booking> {
    const { data, error } = await this.supabase
      .rpc("create_booking", { p_trip_id: input.tripId, p_seat_number: input.seatNumber })
      .single<BookingRow>();

    if (error) throw error;
    return toBookingEntity(data);
  }

  async confirm(bookingId: string): Promise<Booking> {
    const { data, error } = await this.supabase
      .rpc("confirm_booking", { p_booking_id: bookingId })
      .single<BookingRow>();

    if (error) throw error;
    return toBookingEntity(data);
  }

  async cancel(bookingId: string): Promise<Booking> {
    const { data, error } = await this.supabase
      .rpc("cancel_booking", { p_booking_id: bookingId })
      .single<BookingRow>();

    if (error) throw error;
    return toBookingEntity(data);
  }

  async listForStudent(studentId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .returns<BookingRow[]>();

    if (error) throw error;
    return (data ?? []).map(toBookingEntity);
  }

  async findByIdWithTrip(bookingId: string): Promise<BookingWithTrip | null> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select(WITH_TRIP_SELECT)
      .eq("id", bookingId)
      .maybeSingle<BookingWithTripRow>();

    if (error) throw error;
    if (!data) return null;
    return toBookingWithTripEntity(data);
  }

  async listForStudentWithTrip(studentId: string): Promise<BookingWithTrip[]> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select(WITH_TRIP_SELECT)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .returns<BookingWithTripRow[]>();

    if (error) throw error;
    return (data ?? []).map(toBookingWithTripEntity);
  }
}
