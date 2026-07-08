"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type SignInActionState } from "@/app/login/actions";
import { ActionButton } from "@/components/ui/action-button";

const initialState: SignInActionState = { status: "idle" };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-card-border bg-card p-8 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted">Welcome back to UBBS.</p>
      </div>

      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

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

      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
        />
      </label>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <ActionButton pending={pending} pendingText="Signing in…" className="rounded-md">
        Sign in
      </ActionButton>

      <div className="flex flex-col gap-1 text-sm text-muted">
        <Link href="/forgot-password" className="font-medium text-link underline">
          Forgot password?
        </Link>
        <span>Accounts are created by an administrator.</span>
      </div>
    </form>
  );
}
