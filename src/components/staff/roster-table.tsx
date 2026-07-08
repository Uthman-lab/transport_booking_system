"use client";

import { useActionState, useState } from "react";
import { boardAction, type BoardState } from "@/app/staff/trips/[id]/actions";
import { ActionButton } from "@/components/ui/action-button";
import { isBoarded, type RosterEntry } from "@/domain/roster/roster.entity";

const initialState: BoardState = { status: "idle" };

export function RosterTable({
  tripId,
  entries,
}: {
  tripId: string;
  entries: RosterEntry[];
}) {
  const [pendingOnly, setPendingOnly] = useState(false);

  if (entries.length === 0) {
    return (
      <p className="mt-4 text-muted">No confirmed passengers on this trip yet.</p>
    );
  }

  const rows = pendingOnly ? entries.filter((e) => !isBoarded(e)) : entries;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={pendingOnly}
          onChange={(e) => setPendingOnly(e.target.checked)}
          className="h-4 w-4"
        />
        Show only not-yet-boarded
      </label>

      <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Seat</th>
              <th className="px-4 py-3 font-medium">Passenger</th>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {rows.map((entry) => (
              <RosterRow key={entry.bookingId} tripId={tripId} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RosterRow({ tripId, entry }: { tripId: string; entry: RosterEntry }) {
  const [state, formAction, pending] = useActionState(boardAction, initialState);
  const boarded = isBoarded(entry);

  return (
    <tr>
      <td className="px-4 py-3 font-medium">{entry.seatNumber}</td>
      <td className="px-4 py-3">{entry.passengerName}</td>
      <td className="px-4 py-3 font-mono text-xs uppercase text-muted">{entry.ticketCode}</td>
      <td className="px-4 py-3">
        {boarded ? (
          <span className="inline-flex items-center whitespace-nowrap rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
            Boarded
            {entry.checkedInAt ? ` · ${entry.checkedInAt.toLocaleTimeString()}` : ""}
          </span>
        ) : (
          <form action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="ticketCode" value={entry.ticketCode} />
            <input type="hidden" name="tripId" value={tripId} />
            <ActionButton
              pending={pending}
              pendingText="Checking in…"
              variant="outline"
              size="sm"
              className="rounded-md"
            >
              Check in
            </ActionButton>
            {state.status === "error" && state.message ? (
              <span role="alert" className="text-xs text-red-600 dark:text-red-400">
                {state.message}
              </span>
            ) : null}
          </form>
        )}
      </td>
    </tr>
  );
}
