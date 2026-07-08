"use client";

import { useActionState, useState } from "react";
import { bookSeatAction, type BookSeatActionState } from "@/app/trips/[id]/actions";
import { ActionButton } from "@/components/ui/action-button";
import type { Seat } from "@/domain/trip/seat-map";

const initialState: BookSeatActionState = { status: "idle" };

// Client component: local selection state + progressive-enhancement form that
// submits to the bookSeatAction Server Action. It renders domain Seats given
// as props; it never fetches.
export function SeatMap({
  tripId,
  seats,
  priceGhs,
}: {
  tripId: string;
  seats: Seat[];
  priceGhs: number;
}) {
  const [state, formAction, pending] = useActionState(bookSeatAction, initialState);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="seatNumber" value={selected ?? ""} />

      <div>
        <p className="text-sm text-muted">Select a seat</p>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {seats.map((seat) => {
            const isSelected = selected === seat.number;
            return (
              <button
                key={seat.number}
                type="button"
                disabled={!seat.isAvailable}
                aria-pressed={isSelected}
                onClick={() => setSelected(seat.number)}
                className={[
                  "flex h-11 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                  seat.isAvailable
                    ? isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-card-border hover:border-primary"
                    : "cursor-not-allowed border-card-border bg-card text-muted opacity-50",
                ].join(" ")}
              >
                {seat.number}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">Greyed-out seats are already taken.</p>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <ActionButton
        pending={pending}
        pendingText="Holding seat…"
        disabled={selected === null}
        className="rounded-md"
      >
        {selected
          ? `Hold seat ${selected} · GHS ${priceGhs.toFixed(2)}`
          : "Select a seat"}
      </ActionButton>
    </form>
  );
}
