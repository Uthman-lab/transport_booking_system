"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  type ForgotPasswordActionState,
} from "@/app/forgot-password/actions";
import { ActionButton } from "@/components/ui/action-button";

const initialState: ForgotPasswordActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-card-border bg-card p-8 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
        />
      </label>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {state.message}
        </p>
      ) : null}

      <ActionButton pending={pending} pendingText="Sending…" className="rounded-md">
        Send reset link
      </ActionButton>

      <span className="text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-link underline">
          Sign in
        </Link>
      </span>
    </form>
  );
}
