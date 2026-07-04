"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  type ForgotPasswordActionState,
} from "@/app/forgot-password/actions";

const initialState: ForgotPasswordActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-zinc-500">
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-base font-normal outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
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

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <span className="text-sm text-zinc-500">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline dark:text-zinc-100">
          Sign in
        </Link>
      </span>
    </form>
  );
}
