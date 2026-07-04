"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SupabaseBookingRepository } from "@/data/repositories/supabase-booking.repository";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { SupabaseWaitlistRepository } from "@/data/repositories/supabase-waitlist.repository";
import { createClient } from "@/data/supabase/server";
import { bookSeat } from "@/use-cases/bookings/book-seat";
import { joinWaitlist } from "@/use-cases/waitlist/join-waitlist";

const bookSeatInputSchema = z.object({
  tripId: z.string().uuid(),
  seatNumber: z.coerce.number().int().positive(),
});

const joinWaitlistInputSchema = z.object({
  tripId: z.string().uuid(),
});

export type BookSeatActionState = {
  status: "idle" | "error";
  message?: string;
};

export type JoinWaitlistActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Server Action = thin adapter: validate untrusted FormData, wire concrete
// repositories into the use case, then redirect to the new hold on success.
// No business rule lives here. redirect() throws, so it sits outside try/catch
// and after the failure check.
export async function bookSeatAction(
  _prevState: BookSeatActionState,
  formData: FormData,
): Promise<BookSeatActionState> {
  const parsed = bookSeatInputSchema.safeParse({
    tripId: formData.get("tripId"),
    seatNumber: formData.get("seatNumber"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid booking request." };
  }

  const supabase = await createClient();
  const result = await bookSeat(
    {
      tripRepository: new SupabaseTripRepository(supabase),
      bookingRepository: new SupabaseBookingRepository(supabase),
    },
    parsed.data,
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath(`/trips/${parsed.data.tripId}`);
  redirect(`/bookings/${result.value.id}`);
}

export async function joinWaitlistAction(
  _prevState: JoinWaitlistActionState,
  formData: FormData,
): Promise<JoinWaitlistActionState> {
  const parsed = joinWaitlistInputSchema.safeParse({
    tripId: formData.get("tripId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid request." };
  }

  const supabase = await createClient();
  const result = await joinWaitlist(
    {
      tripRepository: new SupabaseTripRepository(supabase),
      waitlistRepository: new SupabaseWaitlistRepository(supabase),
    },
    parsed.data.tripId,
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath(`/trips/${parsed.data.tripId}`);
  return {
    status: "success",
    message: "You're on the waitlist. We'll hold a seat for you if one frees up.",
  };
}
