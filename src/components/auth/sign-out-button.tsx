"use client";

import { signOutAction } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md border border-input px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        Sign out
      </button>
    </form>
  );
}
