"use client";

import { useActionState } from "react";
import { cancelTripAction, type TripFormState } from "@/app/admin/trips/actions";

const initialState: TripFormState = { status: "idle" };

export function CancelTripButton({ tripId }: { tripId: string }) {
  const [state, formAction, pending] = useActionState(cancelTripAction, initialState);

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="tripId" value={tripId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-card-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-card disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Cancel"}
      </button>
      {state.status === "error" && state.message ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
