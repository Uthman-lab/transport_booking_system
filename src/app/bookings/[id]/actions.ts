"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupabaseBookingRepository } from "@/data/repositories/supabase-booking.repository";
import { createClient } from "@/data/supabase/server";
import { cancelBooking } from "@/use-cases/bookings/cancel-booking";
import { confirmBooking } from "@/use-cases/bookings/confirm-booking";

const bookingIdSchema = z.object({
  bookingId: z.string().uuid(),
});

export type BookingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Simulated mobile-money payment → confirm the held booking. On success the
// path is revalidated so the Server Component re-renders as a confirmed ticket.
export async function confirmBookingAction(
  _prevState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = bookingIdSchema.safeParse({ bookingId: formData.get("bookingId") });
  if (!parsed.success) {
    return { status: "error", message: "Invalid request." };
  }

  const supabase = await createClient();
  const result = await confirmBooking(
    { bookingRepository: new SupabaseBookingRepository(supabase) },
    parsed.data.bookingId,
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath(`/bookings/${parsed.data.bookingId}`);
  return { status: "success", message: "Payment confirmed. Your ticket is ready." };
}

export async function cancelBookingAction(
  _prevState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = bookingIdSchema.safeParse({ bookingId: formData.get("bookingId") });
  if (!parsed.success) {
    return { status: "error", message: "Invalid request." };
  }

  const supabase = await createClient();
  const result = await cancelBooking(
    { bookingRepository: new SupabaseBookingRepository(supabase) },
    parsed.data.bookingId,
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  // Cancelling frees a seat (and may promote a waitlisted student via the RPC),
  // so refresh both the booking detail and the My Bookings list.
  revalidatePath(`/bookings/${parsed.data.bookingId}`);
  revalidatePath("/my-bookings");
  return { status: "success", message: "Booking cancelled." };
}
