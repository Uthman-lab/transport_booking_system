"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseCheckInRepository } from "@/data/repositories/supabase-check-in.repository";
import { createClient } from "@/data/supabase/server";
import { isStaff } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { checkInTicket } from "@/use-cases/check-in/check-in-ticket";

export type BoardState = {
  status: "idle" | "error";
  message?: string;
};

const schema = z.object({
  ticketCode: z.string().trim().min(1),
  tripId: z.string().uuid(),
});

// Manual boarding from the roster. Reuses the same check_in_booking RPC as the
// scanner, then revalidates the roster so the row flips to Boarded.
export async function boardAction(
  _prevState: BoardState,
  formData: FormData,
): Promise<BoardState> {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });
  if (!user || !isStaff(user)) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = schema.safeParse({
    ticketCode: formData.get("ticketCode"),
    tripId: formData.get("tripId"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid request." };
  }

  const result = await checkInTicket(
    { checkInRepository: new SupabaseCheckInRepository(supabase) },
    parsed.data.ticketCode,
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath(`/staff/trips/${parsed.data.tripId}`);
  return { status: "idle" };
}
