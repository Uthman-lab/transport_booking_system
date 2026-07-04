"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import {
  changeUserRoleAction,
  deleteUserAction,
  inviteAdminAction,
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

// Mirrors internal.can_manage_user for UI gating: never self; any admin manages
// non-admins; an admin target is manageable only if the current admin is an
// ancestor in the invite tree. The DB enforces this regardless — this just
// avoids showing controls that would fail.
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
      <InviteAdminForm configured={inviteConfigured} />

      {users.length === 0 ? (
        <p className="text-muted">No users yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Student ID</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Actions</th>
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
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditRow user={user} onDone={() => setEditing(false)} />;
  }

  return (
    <tr>
      <td className="px-4 py-3 font-medium">
        {user.fullName}
        {isSelf ? <span className="ml-2 text-xs text-muted">(you)</span> : null}
      </td>
      <td className="px-4 py-3 text-muted">{user.studentId ?? "—"}</td>
      <td className="px-4 py-3 text-muted">{user.phone ?? "—"}</td>
      <td className="px-4 py-3">
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-medium">
          {ROLE_LABELS[user.role]}
        </span>
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-xs text-muted">Ask another admin</span>
        ) : manageable ? (
          <div className="flex flex-wrap items-center gap-2">
            <RoleControl user={user} />
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={buttonClass}
            >
              Edit
            </button>
            <DeleteControl user={user} />
          </div>
        ) : (
          <span className="text-xs text-muted">Not in your invite tree</span>
        )}
      </td>
    </tr>
  );
}

function RoleControl({ user }: { user: ManagedUser }) {
  const [state, formAction, pending] = useActionState(
    changeUserRoleAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex items-center gap-1.5">
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
    </form>
  );
}

function DeleteControl({ user }: { user: ManagedUser }) {
  const [state, formAction, pending] = useActionState(
    deleteUserAction,
    initialState,
  );
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="userId" value={user.id} />
      <span className="text-xs text-muted">Delete {user.fullName}?</span>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className={buttonClass}
      >
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

function EditRow({ user, onDone }: { user: ManagedUser; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(
    updateUserDetailsAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state.status, onDone]);

  return (
    <tr className="bg-background/40">
      <td colSpan={5} className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="userId" value={user.id} />
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Full name
            <input
              name="fullName"
              defaultValue={user.fullName}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Student ID
            <input
              name="studentId"
              defaultValue={user.studentId ?? ""}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Phone
            <input
              name="phone"
              defaultValue={user.phone ?? ""}
              className={inputClass}
            />
          </label>
          <button type="submit" disabled={pending} className={buttonClass}>
            {pending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onDone} className={buttonClass}>
            Cancel
          </button>
          {state.status === "error" && state.message ? (
            <span role="alert" className="text-xs text-red-600 dark:text-red-400">
              {state.message}
            </span>
          ) : null}
        </form>
      </td>
    </tr>
  );
}

function InviteAdminForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(
    inviteAdminAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-card-border bg-card p-6"
    >
      <div>
        <h3 className="text-base font-semibold">Invite an admin</h3>
        <p className="mt-1 text-sm text-muted">
          Sends an email invite. The invitee sets a password and joins as an admin
          in your invite tree.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-md border border-card-border bg-background px-3 py-2 text-xs text-muted">
          Email invitations are disabled until <code>SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          is set on the server. You can still make someone an admin by changing
          their role in the table below.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Full name
          <input name="fullName" required disabled={!configured} className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            disabled={!configured}
            className={inputClass}
          />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="text-sm font-medium text-green-700 dark:text-green-400">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !configured}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}
