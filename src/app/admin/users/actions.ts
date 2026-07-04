"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseUserRepository } from "@/data/repositories/supabase-user.repository";
import { createClient } from "@/data/supabase/server";
import { isAdmin } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { changeUserRole } from "@/use-cases/users/change-user-role";

export type UserRoleFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["student", "staff", "admin"]),
});

export async function changeUserRoleAction(
  _prevState: UserRoleFormState,
  formData: FormData,
): Promise<UserRoleFormState> {
  // Re-authorize admin here even though the proxy guards /admin and RLS guards
  // the write — defense in depth per the architecture skill.
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });
  if (!user || !isAdmin(user)) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = changeRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid request." };
  }

  const result = await changeUserRole(
    { userRepository: new SupabaseUserRepository(supabase) },
    {
      actingUserId: user.id,
      targetUserId: parsed.data.userId,
      newRole: parsed.data.role,
    },
  );
  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: `${result.value.fullName} is now ${result.value.role}.`,
  };
}
