"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterActionState } from "@/app/register/actions";

const initialState: RegisterActionState = { status: "idle" };

const fieldClass =
  "rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  if (state.status === "success") {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-card-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p role="status" className="text-sm text-muted">
          {state.message}
        </p>
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-card-border bg-card p-8 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted">Register with your student ID and email.</p>
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
        Phone <span className="font-normal text-muted">(optional)</span>
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Register"}
      </button>

      <span className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-link underline">
          Sign in
        </Link>
      </span>
    </form>
  );
}
