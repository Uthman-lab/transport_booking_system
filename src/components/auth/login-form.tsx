"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type SignInActionState } from "@/app/login/actions";

const initialState: SignInActionState = { status: "idle" };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-zinc-500">Welcome back to UBBS.</p>
      </div>

      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-base font-normal outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-base font-normal outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex flex-col gap-1 text-sm text-zinc-500">
        <span>
          No account?{" "}
          <Link href="/register" className="font-medium text-zinc-900 underline dark:text-zinc-100">
            Register
          </Link>
        </span>
        <Link href="/forgot-password" className="font-medium text-zinc-900 underline dark:text-zinc-100">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
