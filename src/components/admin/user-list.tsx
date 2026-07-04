"use client";

import { useActionState } from "react";
import { changeUserRoleAction, type UserRoleFormState } from "@/app/admin/users/actions";
import type { UserRole } from "@/domain/auth/auth-user.entity";
import { USER_ROLES, type ManagedUser } from "@/domain/user/user.entity";

const initialState: UserRoleFormState = { status: "idle" };

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  staff: "Staff",
  admin: "Admin",
};

export function UserList({
  users,
  currentUserId,
}: {
  users: ManagedUser[];
  currentUserId: string;
}) {
  if (users.length === 0) {
    return <p className="mt-4 text-muted">No users yet.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-card-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border text-left text-muted">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Student ID</th>
            <th className="px-4 py-3 font-medium">Current role</th>
            <th className="px-4 py-3 font-medium">Change role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {users.map((user) => (
            <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user, isSelf }: { user: ManagedUser; isSelf: boolean }) {
  const [state, formAction, pending] = useActionState(
    changeUserRoleAction,
    initialState,
  );

  return (
    <tr>
      <td className="px-4 py-3 font-medium">
        {user.fullName}
        {isSelf ? <span className="ml-2 text-xs text-muted">(you)</span> : null}
      </td>
      <td className="px-4 py-3 text-muted">{user.studentId ?? "—"}</td>
      <td className="px-4 py-3">
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-medium">
          {ROLE_LABELS[user.role]}
        </span>
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-xs text-muted">Ask another admin</span>
        ) : (
          <form action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="userId" value={user.id} />
            <select
              name="role"
              defaultValue={user.role}
              className="rounded-md border border-input bg-input-bg px-2 py-1.5 text-sm outline-none focus:border-ring"
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md border border-card-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            {state.status === "error" && state.message ? (
              <span role="alert" className="text-xs text-red-600 dark:text-red-400">
                {state.message}
              </span>
            ) : null}
            {state.status === "success" && state.message ? (
              <span
                role="status"
                className="text-xs font-medium text-green-700 dark:text-green-400"
              >
                {state.message}
              </span>
            ) : null}
          </form>
        )}
      </td>
    </tr>
  );
}
