"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupabaseBookingRepository } from "@/data/repositories/supabase-booking.repository";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { bookSeat } from "@/use-cases/bookings/book-seat";

const bookSeatInputSchema = z.object({
  tripId: z.string().uuid(),
  seatNumber: z.coerce.number().int().positive(),
});

export type BookSeatActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Server Action = the composition root for this mutation: validate the
// untrusted FormData at the boundary, wire concrete repositories into the
// use case, then translate its Result into UI-facing state. No business
// rule (bookability, seat conflicts) lives in this file.
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

  revalidatePath("/trips");
  return {
    status: "success",
    message: `Seat ${result.value.seatNumber} held. Confirm payment within 15 minutes to keep it.`,
  };
}
