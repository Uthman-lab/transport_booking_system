"use client";

import { useActionState } from "react";
import { cancelTripAction, type TripFormState } from "@/app/admin/trips/actions";
import { ActionButton } from "@/components/ui/action-button";

const initialState: TripFormState = { status: "idle" };

export function CancelTripButton({ tripId }: { tripId: string }) {
  const [state, formAction, pending] = useActionState(cancelTripAction, initialState);

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="tripId" value={tripId} />
      <ActionButton
        pending={pending}
        pendingText="Cancelling…"
        variant="outline"
        size="sm"
        className="rounded-md"
      >
        Cancel
      </ActionButton>
      {state.status === "error" && state.message ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
