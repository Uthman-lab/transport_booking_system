"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, isAdminClientConfigured } from "@/data/supabase/admin";
import { isMailerConfigured } from "@/data/email/mailer";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseInviteRepository } from "@/data/repositories/supabase-invite.repository";
import { SupabaseUserRepository } from "@/data/repositories/supabase-user.repository";
import { createClient } from "@/data/supabase/server";
import type { AuthUser } from "@/domain/auth/auth-user.entity";
import { isAdmin } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { changeUserRole } from "@/use-cases/users/change-user-role";
import { deleteUser } from "@/use-cases/users/delete-user";
import * as XLSX from "xlsx";
import type { BulkInviteInputRow, BulkInviteRowResult } from "@/domain/user/invite.repository";
import {
  commitBulkInvites,
  validateBulkRows,
  type RowError,
} from "@/use-cases/users/bulk-invite";
import { inviteUser } from "@/use-cases/users/invite-user";
import { listInviteStates } from "@/use-cases/users/list-invite-states";
import { resendInvite } from "@/use-cases/users/resend-invite";
import { updateUserDetails } from "@/use-cases/users/update-user-details";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UserActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  // A copyable invite link, set on a successful invite/resend.
  link?: string;
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

// Explains why an invite wasn't emailed: SMTP genuinely isn't configured, or a
// send was attempted and failed (surface the real reason so it's fixable).
function notEmailedReason(emailError?: string): string {
  if (emailError) {
    return `the email failed to send (${emailError})`;
  }
  if (!isMailerConfigured()) {
    return "email isn't configured on the server";
  }
  return "the email couldn't be sent";
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
  role: z.enum(["student", "staff", "admin"]),
});

export async function inviteUserAction(
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
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid invite.",
    };
  }

  const inviteRepository = new SupabaseInviteRepository(createAdminClient(), siteUrl());
  const result = await inviteUser(
    { inviteRepository },
    {
      actingUserId: user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
    },
  );
  if (!result.ok) return { status: "error", message: result.error.message };

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: result.value.emailed
      ? `Invitation emailed to ${result.value.email} (${result.value.role}). The link is below too — copy it if you'd rather send it yourself.`
      : `Invite ready for ${result.value.email} (${result.value.role}), but ${notEmailedReason(result.value.emailError)}. Copy the link below and send it to them.`,
    link: result.value.actionLink,
  };
}

const resendSchema = z.object({ userId: z.string().uuid() });

export async function resendInviteAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const { user } = await requireAdmin();
  if (!user) return { status: "error", message: "Not authorized." };

  if (!isAdminClientConfigured()) {
    return { status: "error", message: "Invites aren't configured on the server." };
  }

  const parsed = resendSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { status: "error", message: "Invalid request." };

  const inviteRepository = new SupabaseInviteRepository(createAdminClient(), siteUrl());
  const result = await resendInvite({ inviteRepository }, parsed.data.userId);
  if (!result.ok) return { status: "error", message: result.error.message };

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: result.value.emailed
      ? `Invitation emailed to ${result.value.email}. The link is below too — copy it if you'd rather send it yourself.`
      : `Fresh invite link for ${result.value.email}, but ${notEmailedReason(result.value.emailError)}. Copy the link below and send it to them.`,
    link: result.value.actionLink,
  };
}

// ---------------------------------------------------------------------------
// Bulk invite from an uploaded spreadsheet
// ---------------------------------------------------------------------------

export type BulkInviteState = {
  // idle → nothing yet; invalid → validation failed, nothing created;
  // success → all created; error → commit failed and was rolled back.
  status: "idle" | "success" | "invalid" | "error";
  message?: string;
  // Set when status === "invalid": every problem found, so the whole file can
  // be fixed at once. Nothing is created in this case.
  errors?: RowError[];
  created?: number;
  results?: BulkInviteRowResult[];
  // A results spreadsheet (CSV) the admin downloads to distribute invite links.
  csv?: string;
};

// Reads a cell for any of several accepted header spellings (case/space/
// underscore-insensitive), e.g. "Full Name" / "full_name" → fullName.
function cell(row: Record<string, unknown>, accepted: string[]): string {
  for (const key of Object.keys(row)) {
    const norm = key.trim().toLowerCase().replace(/[\s_]+/g, "");
    if (accepted.includes(norm)) return String(row[key] ?? "").trim();
  }
  return "";
}

function csvCell(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function resultsToCsv(results: BulkInviteRowResult[]): string {
  const header = ["row", "email", "role", "status", "invite link / error"].join(",");
  const lines = results.map((r) =>
    [r.rowNumber, r.email, r.role ?? "", r.ok ? "invited" : "error", r.detail]
      .map(csvCell)
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export async function bulkInviteAction(
  _prevState: BulkInviteState,
  formData: FormData,
): Promise<BulkInviteState> {
  const { user } = await requireAdmin();
  if (!user) return { status: "error", message: "Not authorized." };

  if (!isAdminClientConfigured()) {
    return { status: "error", message: "Invites aren't configured on the server." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a .csv or .xlsx file to upload." };
  }

  let rows: BulkInviteInputRow[];
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return { status: "error", message: "The file has no sheets." };

    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    rows = raw.map((r) => ({
      fullName: cell(r, ["fullname", "name"]),
      email: cell(r, ["email", "emailaddress"]),
      role: cell(r, ["role"]),
      studentId: cell(r, ["studentid", "studentnumber", "indexnumber"]) || null,
      phone: cell(r, ["phone", "phonenumber", "mobile", "tel"]) || null,
    }));
  } catch {
    return { status: "error", message: "Could not read the file. Use a valid .csv or .xlsx." };
  }

  if (rows.length === 0) {
    return { status: "error", message: "No data rows found in the file." };
  }

  const inviteRepository = new SupabaseInviteRepository(createAdminClient(), siteUrl());

  // Phase 1 — validate every row (including against already-registered emails).
  // If anything is wrong, create NOTHING and report all issues.
  const existingStates = await listInviteStates({ inviteRepository });
  const existingEmails = new Set(
    existingStates.map((s) => s.email.toLowerCase()).filter(Boolean),
  );
  const { validRows, errors } = validateBulkRows(rows, existingEmails);

  if (errors.length > 0) {
    return {
      status: "invalid",
      message: `Validation failed — ${errors.length} issue(s) across ${rows.length} row(s). Nothing was uploaded; fix the file and try again.`,
      errors,
    };
  }

  // Phase 2 — commit the whole batch atomically (all or none).
  let invited;
  try {
    invited = await commitBulkInvites({ inviteRepository }, validRows, user.id);
  } catch {
    return {
      status: "error",
      message:
        "Upload failed and was rolled back — no accounts were created. Please try again.",
    };
  }

  const results: BulkInviteRowResult[] = invited.map((u, i) => ({
    rowNumber: validRows[i].rowNumber,
    email: u.email,
    role: u.role,
    ok: true,
    detail: u.actionLink,
  }));
  const emailedCount = invited.filter((u) => u.emailed).length;

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: `Invited ${invited.length} user(s)${emailedCount ? `, ${emailedCount} emailed` : ""}. Download the results for each invite link.`,
    created: invited.length,
    results,
    csv: resultsToCsv(results),
  };
}
