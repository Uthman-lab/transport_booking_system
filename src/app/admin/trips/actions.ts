"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseTripRepository } from "@/data/repositories/supabase-trip.repository";
import { createClient } from "@/data/supabase/server";
import { isAdmin } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { cancelTrip } from "@/use-cases/trips/cancel-trip";
import { createTrip } from "@/use-cases/trips/create-trip";
import { updateTrip } from "@/use-cases/trips/update-trip";

export type TripFormState = {
  status: "idle" | "error";
  message?: string;
};

const tripSchema = z.object({
  routeId: z.string().uuid(),
  departureAt: z.coerce.date(),
  capacity: z.coerce.number().int().positive().max(200),
  priceGhs: z.coerce.number().min(0).max(100000),
});

const cancelSchema = z.object({ tripId: z.string().uuid() });

// Re-authorize admin in the action even though the proxy guards /admin and RLS
// guards the write — defense in depth per the architecture skill.
async function requireAdmin() {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });
  return { supabase, isAdminUser: !!user && isAdmin(user) };
}

export async function createTripAction(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const { supabase, isAdminUser } = await requireAdmin();
  if (!isAdminUser) return { status: "error", message: "Not authorized." };

  const parsed = tripSchema.safeParse({
    routeId: formData.get("routeId"),
    departureAt: formData.get("departureAt"),
    capacity: formData.get("capacity"),
    priceGhs: formData.get("priceGhs"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please fill in all fields with valid values." };
  }

  const result = await createTrip(
    { tripRepository: new SupabaseTripRepository(supabase) },
    parsed.data,
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  redirect("/admin/trips");
}

export async function updateTripAction(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const { supabase, isAdminUser } = await requireAdmin();
  if (!isAdminUser) return { status: "error", message: "Not authorized." };

  const idParsed = cancelSchema.safeParse({ tripId: formData.get("tripId") });
  const parsed = tripSchema.safeParse({
    routeId: formData.get("routeId"),
    departureAt: formData.get("departureAt"),
    capacity: formData.get("capacity"),
    priceGhs: formData.get("priceGhs"),
  });
  if (!idParsed.success || !parsed.success) {
    return { status: "error", message: "Please fill in all fields with valid values." };
  }

  const result = await updateTrip(
    { tripRepository: new SupabaseTripRepository(supabase) },
    idParsed.data.tripId,
    parsed.data,
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  redirect("/admin/trips");
}

export async function cancelTripAction(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const { supabase, isAdminUser } = await requireAdmin();
  if (!isAdminUser) return { status: "error", message: "Not authorized." };

  const parsed = cancelSchema.safeParse({ tripId: formData.get("tripId") });
  if (!parsed.success) {
    return { status: "error", message: "Invalid request." };
  }

  const result = await cancelTrip(
    { tripRepository: new SupabaseTripRepository(supabase) },
    parsed.data.tripId,
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  return { status: "idle" };
}
