import type { SupabaseClient } from "@supabase/supabase-js";
import type { Booking } from "@/domain/booking/booking.entity";
import type { BookingRepository } from "@/domain/booking/booking.repository";
import { toBookingEntity, type BookingRow } from "@/data/mappers/booking.mapper";

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
}
