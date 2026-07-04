"use client";

import { signOutAction } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Sign out
      </button>
    </form>
  );
}
