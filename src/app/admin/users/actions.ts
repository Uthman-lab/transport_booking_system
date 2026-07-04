"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, isAdminClientConfigured } from "@/data/supabase/admin";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseInviteRepository } from "@/data/repositories/supabase-invite.repository";
import { SupabaseUserRepository } from "@/data/repositories/supabase-user.repository";
import { createClient } from "@/data/supabase/server";
import type { AuthUser } from "@/domain/auth/auth-user.entity";
import { isAdmin } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { changeUserRole } from "@/use-cases/users/change-user-role";
import { deleteUser } from "@/use-cases/users/delete-user";
import { inviteAdmin } from "@/use-cases/users/invite-admin";
import { updateUserDetails } from "@/use-cases/users/update-user-details";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UserActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Re-authorize admin in every action even though the proxy guards /admin and
// RLS guards the writes — defense in depth per the architecture skill.
async function requireAdmin(): Promise<{
  supabase: SupabaseClient;
  user: AuthUser | null;
}> {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });
  return { supabase, user: user && isAdmin(user) ? user : null };
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["student", "staff", "admin"]),
});

export async function changeUserRoleAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { status: "error", message: "Not authorized." };

  const parsed = changeRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { status: "error", message: "Invalid request." };

  const result = await changeUserRole(
    { userRepository: new SupabaseUserRepository(supabase) },
    {
      actingUserId: user.id,
      targetUserId: parsed.data.userId,
      newRole: parsed.data.role,
    },
  );
  if (!result.ok) return { status: "error", message: result.error.message };

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: `${result.value.fullName} is now ${result.value.role}.`,
  };
}

const detailsSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().trim().min(1, "Name is required.").max(120),
  studentId: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(40).optional(),
});

export async function updateUserDetailsAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { status: "error", message: "Not authorized." };

  const parsed = detailsSchema.safeParse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    studentId: formData.get("studentId"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid details.",
    };
  }

  const result = await updateUserDetails(
    { userRepository: new SupabaseUserRepository(supabase) },
    {
      targetUserId: parsed.data.userId,
      fullName: parsed.data.fullName,
      studentId: parsed.data.studentId ?? null,
      phone: parsed.data.phone ?? null,
    },
  );
  if (!result.ok) return { status: "error", message: result.error.message };

  revalidatePath("/admin/users");
  return { status: "success", message: "Details updated." };
}

const deleteSchema = z.object({ userId: z.string().uuid() });

export async function deleteUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { status: "error", message: "Not authorized." };

  const parsed = deleteSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { status: "error", message: "Invalid request." };

  const result = await deleteUser(
    { userRepository: new SupabaseUserRepository(supabase) },
    { actingUserId: user.id, targetUserId: parsed.data.userId },
  );
  if (!result.ok) return { status: "error", message: result.error.message };

  revalidatePath("/admin/users");
  return { status: "success", message: "User deleted." };
}

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  fullName: z.string().trim().min(1, "Name is required.").max(120),
});

export async function inviteAdminAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const { user } = await requireAdmin();
  if (!user) return { status: "error", message: "Not authorized." };

  if (!isAdminClientConfigured()) {
    return {
      status: "error",
      message: "Email invitations aren't configured on the server.",
    };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid invite.",
    };
  }

  const inviteRepository = new SupabaseInviteRepository(
    createAdminClient(),
    `${siteUrl()}/auth/confirm?next=/reset-password`,
  );
  const result = await inviteAdmin(
    { inviteRepository },
    {
      actingUserId: user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
    },
  );
  if (!result.ok) return { status: "error", message: result.error.message };

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: `Invitation sent to ${result.value.email}.`,
  };
}
