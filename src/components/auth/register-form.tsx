"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterActionState } from "@/app/register/actions";

const initialState: RegisterActionState = { status: "idle" };

const fieldClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-base font-normal outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-sm text-zinc-500">Register with your student ID and email.</p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Full name
        <input name="fullName" type="text" autoComplete="name" required className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Student ID
        <input name="studentId" type="text" required className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input name="email" type="email" autoComplete="email" required className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Phone <span className="font-normal text-zinc-400">(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          name="password"
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
        {pending ? "Creating account…" : "Register"}
      </button>

      <span className="text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline dark:text-zinc-100">
          Sign in
        </Link>
      </span>
    </form>
  );
}
