"use server";

import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseCheckInRepository } from "@/data/repositories/supabase-check-in.repository";
import { createClient } from "@/data/supabase/server";
import { isStaff } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { checkInTicket } from "@/use-cases/check-in/check-in-ticket";

export type CheckInState = {
  status: "idle" | "success" | "error";
  message?: string;
  // Populated on success. Dates are ISO strings so the state stays serializable.
  result?: {
    ticketCode: string;
    passengerName: string;
    seatNumber: number;
    origin: string;
    destination: string;
    departureAt: string;
    checkedInAt: string;
  };
};

const schema = z.object({ ticketCode: z.string().trim().min(1).max(128) });

export async function checkInAction(
  _prevState: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  // Re-authorize staff even though the proxy guards /staff and the RPC guards
  // the write — defense in depth per the architecture skill.
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });
  if (!user || !isStaff(user)) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = schema.safeParse({ ticketCode: formData.get("ticketCode") });
  if (!parsed.success) {
    return { status: "error", message: "Enter or scan a ticket code." };
  }

  const result = await checkInTicket(
    { checkInRepository: new SupabaseCheckInRepository(supabase) },
    parsed.data.ticketCode,
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  const r = result.value;
  return {
    status: "success",
    message: "Checked in",
    result: {
      ticketCode: r.ticketCode,
      passengerName: r.passengerName,
      seatNumber: r.seatNumber,
      origin: r.origin,
      destination: r.destination,
      departureAt: r.departureAt.toISOString(),
      checkedInAt: r.checkedInAt.toISOString(),
    },
  };
}
