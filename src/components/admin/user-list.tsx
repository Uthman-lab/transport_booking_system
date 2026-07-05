"use client";

import { useState } from "react";
import { useActionState } from "react";
import { BulkInviteForm } from "@/components/admin/bulk-invite-form";
import {
  changeUserRoleAction,
  deleteUserAction,
  inviteUserAction,
  resendInviteAction,
  updateUserDetailsAction,
  type UserActionState,
} from "@/app/admin/users/actions";
import type { UserRole } from "@/domain/auth/auth-user.entity";
import { USER_ROLES, type ManagedUser } from "@/domain/user/user.entity";

const initialState: UserActionState = { status: "idle" };

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  staff: "Staff",
  admin: "Admin",
};

const inputClass =
  "rounded-md border border-input bg-input-bg px-2 py-1.5 text-sm outline-none focus:border-ring";
const buttonClass =
  "rounded-md border border-card-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background disabled:opacity-60";
const chip = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";

// Mirrors internal.can_manage_user for UI gating: never self; any admin manages
// non-admins; an admin target is manageable only if the current admin is an
// ancestor in the invite tree. The DB enforces this regardless.
function isManageable(
  target: ManagedUser,
  currentUserId: string,
  byId: Map<string, ManagedUser>,
): boolean {
  if (target.id === currentUserId) return false;
  if (target.role !== "admin") return true;

  const seen = new Set<string>();
  let cursor = target.invitedBy;
  while (cursor && !seen.has(cursor)) {
    if (cursor === currentUserId) return true;
    seen.add(cursor);
    cursor = byId.get(cursor)?.invitedBy ?? null;
  }
  return false;
}

export function UserList({
  users,
  currentUserId,
  inviteConfigured,
}: {
  users: ManagedUser[];
  currentUserId: string;
  inviteConfigured: boolean;
}) {
  const byId = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="mt-6 flex flex-col gap-8">
      <InviteUserForm configured={inviteConfigured} />
      <BulkInviteForm configured={inviteConfigured} />

      {users.length === 0 ? (
        <p className="text-muted">No users yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left text-muted">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelf={user.id === currentUserId}
                  manageable={isManageable(user, currentUserId, byId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  manageable,
}: {
  user: ManagedUser;
  isSelf: boolean;
  manageable: boolean;
}) {
  const [open, setOpen] = useState(false);

  const meta = [user.studentId, user.phone].filter(Boolean).join(" · ");

  return (
    <>
      <tr className={open ? "bg-background/40" : undefined}>
        <td className="px-4 py-3 align-top">
          <div className="font-medium">
            {user.fullName}
            {isSelf ? <span className="ml-2 text-xs text-muted">(you)</span> : null}
          </div>
          {user.email ? <div className="text-xs text-muted">{user.email}</div> : null}
          {meta ? <div className="text-xs text-muted">{meta}</div> : null}
        </td>
        <td className="px-4 py-3 align-top">
          <span className={`${chip} border border-card-border`}>{ROLE_LABELS[user.role]}</span>
        </td>
        <td className="px-4 py-3 align-top">
          <StatusChip user={user} />
        </td>
        <td className="px-4 py-3 align-top text-right">
          {isSelf ? (
            <span className="text-xs text-muted">—</span>
          ) : manageable ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className={buttonClass}
            >
              {open ? "Close" : "Manage"}
            </button>
          ) : (
            <span className="text-xs text-muted">Not in your tree</span>
          )}
        </td>
      </tr>

      {open && manageable ? (
        <tr className="bg-background/40">
          <td colSpan={4} className="px-4 pb-5 pt-1">
            <ManagePanel user={user} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function StatusChip({ user }: { user: ManagedUser }) {
  if (user.invitePending) {
    return (
      <span className={`${chip} border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400`}>
        Invite pending
      </span>
    );
  }
  if (user.email) {
    return (
      <span className={`${chip} border border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400`}>
        Active
      </span>
    );
  }
  return <span className="text-xs text-muted">—</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h4>
      {children}
    </div>
  );
}

function ManagePanel({ user }: { user: ManagedUser }) {
  return (
    <div className="grid gap-6 rounded-lg border border-card-border bg-card p-4 sm:grid-cols-2">
      <Section title="Details">
        <DetailsForm user={user} />
      </Section>

      <Section title="Role">
        <RoleControl user={user} />
      </Section>

      {user.invitePending ? (
        <Section title="Pending invite">
          <ResendControl user={user} />
        </Section>
      ) : null}

      <Section title="Danger zone">
        <DeleteControl user={user} />
      </Section>
    </div>
  );
}

function DetailsForm({ user }: { user: ManagedUser }) {
  const [state, formAction, pending] = useActionState(updateUserDetailsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={user.id} />
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted">
          Full name
          <input name="fullName" defaultValue={user.fullName} required className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted">
          Student ID
          <input name="studentId" defaultValue={user.studentId ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-muted">
          Phone
          <input name="phone" defaultValue={user.phone ?? ""} className={inputClass} />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Save details"}
        </button>
        {state.status === "error" && state.message ? (
          <span role="alert" className="text-xs text-red-600 dark:text-red-400">
            {state.message}
          </span>
        ) : null}
        {state.status === "success" && state.message ? (
          <span role="status" className="text-xs font-medium text-green-700 dark:text-green-400">
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function RoleControl({ user }: { user: ManagedUser }) {
  const [state, formAction, pending] = useActionState(changeUserRoleAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <select name="role" defaultValue={user.role} className={inputClass}>
        {USER_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Set role"}
      </button>
      {state.status === "error" && state.message ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      ) : null}
      {state.status === "success" && state.message ? (
        <span role="status" className="text-xs font-medium text-green-700 dark:text-green-400">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

function ResendControl({ user }: { user: ManagedUser }) {
  const [state, formAction, pending] = useActionState(resendInviteAction, initialState);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        Generate a fresh invite link and send it to the invitee.
      </p>
      <form action={formAction}>
        <input type="hidden" name="userId" value={user.id} />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Generating…" : "Resend invite"}
        </button>
      </form>
      {state.status === "error" && state.message ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      ) : null}
      {state.status === "success" && state.link ? <CopyLink link={state.link} /> : null}
    </div>
  );
}

function DeleteControl({ user }: { user: ManagedUser }) {
  const [state, formAction, pending] = useActionState(deleteUserAction, initialState);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted">
          Permanently removes the account and all their bookings. This can&apos;t be undone.
        </p>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="self-start rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete user
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <span className="text-xs text-muted">Delete {user.fullName}?</span>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={buttonClass}>
        Cancel
      </button>
      {state.status === "error" && state.message ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="w-64 rounded-md border border-input bg-input-bg px-2 py-1 text-xs"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          } catch {
            // Clipboard blocked (e.g. insecure context) — the field is still
            // selectable for a manual copy.
          }
        }}
        className={buttonClass}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

function InviteUserForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(inviteUserAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-card-border bg-card p-6"
    >
      <div>
        <h3 className="text-base font-semibold">Invite a user</h3>
        <p className="mt-1 text-sm text-muted">
          Creates the account with the role you choose and generates a one-time
          invite link. Copy it and send it to the invitee — they open it, set a
          password, and join. An invited admin lands in your invite tree.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-md border border-card-border bg-background px-3 py-2 text-xs text-muted">
          Invites are disabled until <code>SUPABASE_SERVICE_ROLE_KEY</code> is set
          on the server. You can still change a user&apos;s role in the table below.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Full name
          <input name="fullName" required disabled={!configured} className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Email
          <input name="email" type="email" required disabled={!configured} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Role
          <select name="role" defaultValue="admin" disabled={!configured} className={inputClass}>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <div className="flex flex-col gap-2">
          <p role="status" className="text-sm font-medium text-green-700 dark:text-green-400">
            {state.message}
          </p>
          {state.link ? <CopyLink link={state.link} /> : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || !configured}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create invite"}
      </button>
    </form>
  );
}
