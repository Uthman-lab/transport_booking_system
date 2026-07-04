"use client";

import { useActionState } from "react";
import { cancelBookingAction, type BookingActionState } from "@/app/bookings/[id]/actions";

const initialState: BookingActionState = { status: "idle" };

// Small client boundary owning the cancel mutation, so BookingList can stay a
// presentational (server) component that just composes it in.
export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(cancelBookingAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="bookingId" value={bookingId} />
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
