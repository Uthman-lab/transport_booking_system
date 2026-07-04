"use client";

import { useActionState } from "react";
import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from "@/app/reset-password/actions";

const initialState: ResetPasswordActionState = { status: "idle" };

const fieldClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-base font-normal outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <p className="text-sm text-zinc-500">Choose a password you haven&apos;t used before.</p>
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

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
