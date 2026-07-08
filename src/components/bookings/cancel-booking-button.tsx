"use client";

import { useActionState } from "react";
import { cancelBookingAction, type BookingActionState } from "@/app/bookings/[id]/actions";
import { ActionButton } from "@/components/ui/action-button";

const initialState: BookingActionState = { status: "idle" };

// Small client boundary owning the cancel mutation, so BookingList can stay a
// presentational (server) component that just composes it in.
export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(cancelBookingAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="bookingId" value={bookingId} />
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
