"use client";

import { useActionState } from "react";
import { joinWaitlistAction, type JoinWaitlistActionState } from "@/app/trips/[id]/actions";

const initialState: JoinWaitlistActionState = { status: "idle" };

export function WaitlistPanel({ tripId }: { tripId: string }) {
  const [state, formAction, pending] = useActionState(joinWaitlistAction, initialState);

  return (
    <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
      <h2 className="text-lg font-semibold">This trip is full</h2>
      <p className="mt-1 text-sm text-muted">
        Join the waitlist and we&apos;ll automatically hold a seat for you if one frees up.
      </p>

      {state.status === "success" ? (
        <p role="status" className="mt-4 text-sm font-medium text-green-700 dark:text-green-400">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="tripId" value={tripId} />
          {state.status === "error" && state.message ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {state.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Joining…" : "Join waitlist"}
          </button>
        </form>
      )}
    </div>
  );
}
