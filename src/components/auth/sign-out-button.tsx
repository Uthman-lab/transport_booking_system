"use client";

import { signOutAction } from "@/app/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SubmitButton
        variant="outline"
        size="sm"
        pendingText="Signing out…"
        className="rounded-md"
      >
        Sign out
      </SubmitButton>
    </form>
  );
}
