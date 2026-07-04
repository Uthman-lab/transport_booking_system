"use client";

import { useActionState } from "react";
import {
  cancelBookingAction,
  confirmBookingAction,
  type BookingActionState,
} from "@/app/bookings/[id]/actions";
import { HoldCountdown } from "@/components/bookings/hold-countdown";

const initialState: BookingActionState = { status: "idle" };

// Simulated mobile-money payment for a held booking: countdown + Pay + Cancel.
// Both buttons submit to Server Actions; on confirm the page revalidates and
// re-renders as a ticket.
export function PaymentPanel({
  bookingId,
  tripId,
  amountGhs,
  holdExpiresAt,
}: {
  bookingId: string;
  tripId: string;
  amountGhs: number;
  holdExpiresAt: Date;
}) {
  const [confirmState, confirmFormAction, confirming] = useActionState(
    confirmBookingAction,
    initialState,
  );
  const [cancelState, cancelFormAction, cancelling] = useActionState(
    cancelBookingAction,
    initialState,
  );

  return (
    <div className="mt-8 flex flex-col gap-5 rounded-xl border border-card-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pay to confirm your seat</h2>
        <HoldCountdown expiresAt={holdExpiresAt} tripId={tripId} />
      </div>

      <p className="text-sm text-muted">
        This is a simulated mobile-money payment for the demo — no real charge is made.
      </p>

      {confirmState.status === "error" && confirmState.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {confirmState.message}
        </p>
      ) : null}
      {cancelState.status === "error" && cancelState.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {cancelState.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <form action={confirmFormAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button
            type="submit"
            disabled={confirming}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {confirming ? "Processing payment…" : `Pay GHS ${amountGhs.toFixed(2)} with mobile money`}
          </button>
        </form>

        <form action={cancelFormAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button
            type="submit"
            disabled={cancelling}
            className="rounded-md border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card disabled:opacity-60"
          >
            {cancelling ? "Cancelling…" : "Cancel"}
          </button>
        </form>
      </div>
    </div>
  );
}
