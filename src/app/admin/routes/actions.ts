"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseRouteRepository } from "@/data/repositories/supabase-route.repository";
import { createClient } from "@/data/supabase/server";
import { isAdmin } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { createRoute } from "@/use-cases/routes/create-route";

export type RouteFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const routeSchema = z.object({
  origin: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
});

export async function createRouteAction(
  _prevState: RouteFormState,
  formData: FormData,
): Promise<RouteFormState> {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });
  if (!user || !isAdmin(user)) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = routeSchema.safeParse({
    origin: formData.get("origin"),
    destination: formData.get("destination"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Origin and destination are required." };
  }

  const result = await createRoute(
    { routeRepository: new SupabaseRouteRepository(supabase) },
    parsed.data,
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath("/admin/routes");
  revalidatePath("/admin/trips/new");
  return { status: "success", message: `Route ${result.value.origin} → ${result.value.destination} added.` };
}
