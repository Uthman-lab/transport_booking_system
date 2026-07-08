"use client";

import { useActionState } from "react";
import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from "@/app/reset-password/actions";
import { ActionButton } from "@/components/ui/action-button";

const initialState: ResetPasswordActionState = { status: "idle" };

const fieldClass =
  "rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-card-border bg-card p-8 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <p className="text-sm text-muted">Choose a password you haven&apos;t used before.</p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Confirm password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className={fieldClass}
        />
      </label>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <ActionButton pending={pending} pendingText="Updating…" className="rounded-md">
        Update password
      </ActionButton>
    </form>
  );
}
