import type { UserRole } from "@/domain/auth/auth-user.entity";
import type {
  BulkInviteInputRow,
  InviteByEmailInput,
  InvitedUser,
  InviteRepository,
} from "@/domain/user/invite.repository";
import { isValidRole } from "@/domain/user/user.entity";

// A row that passed validation, normalized and ready to invite.
export type ValidatedRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  role: UserRole;
  studentId: string | null;
  phone: string | null;
};

export type RowError = {
  rowNumber: number;
  email: string;
  message: string;
};

export type BulkValidation = {
  validRows: ValidatedRow[];
  errors: RowError[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pure, exhaustive validation of every row up front. Collects ALL problems (so
// the admin can fix the whole file at once) rather than failing on the first.
export function validateBulkRows(
  rows: BulkInviteInputRow[],
  existingEmails: Set<string>,
): BulkValidation {
  const validRows: ValidatedRow[] = [];
  const errors: RowError[] = [];
  const seen = new Set<string>();
  let rowNumber = 0;

  for (const row of rows) {
    rowNumber += 1;
    const email = (row.email ?? "").trim().toLowerCase();
    const fullName = (row.fullName ?? "").trim();
    const roleRaw = (row.role ?? "").trim().toLowerCase();
    const role = (roleRaw === "" ? "student" : roleRaw) as UserRole;

    if (!fullName) {
      errors.push({ rowNumber, email, message: "Missing full name" });
      continue;
    }
    if (!EMAIL_RE.test(email)) {
      errors.push({ rowNumber, email, message: "Invalid email" });
      continue;
    }
    if (!isValidRole(role)) {
      errors.push({
        rowNumber,
        email,
        message: `Invalid role "${roleRaw}" (use student, staff, or admin)`,
      });
      continue;
    }
    if (seen.has(email)) {
      errors.push({ rowNumber, email, message: "Duplicate email in file" });
      continue;
    }
    if (existingEmails.has(email)) {
      errors.push({ rowNumber, email, message: "An account with this email already exists" });
      continue;
    }

    seen.add(email);
    validRows.push({
      rowNumber,
      fullName,
      email,
      role,
      studentId: row.studentId?.trim() || null,
      phone: row.phone?.trim() || null,
    });
  }

  return { validRows, errors };
}

export type CommitBulkInvitesDeps = {
  inviteRepository: InviteRepository;
};

// Commits the whole validated batch atomically (all accounts or none — the repo
// rolls back created accounts if any row fails).
export async function commitBulkInvites(
  { inviteRepository }: CommitBulkInvitesDeps,
  validRows: ValidatedRow[],
  actingUserId: string,
): Promise<InvitedUser[]> {
  const inputs: InviteByEmailInput[] = validRows.map((r) => ({
    email: r.email,
    fullName: r.fullName,
    role: r.role,
    studentId: r.studentId,
    phone: r.phone,
    invitedBy: actingUserId,
  }));
  return inviteRepository.inviteManyAtomic(inputs);
}
