"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { TripFormState } from "@/app/admin/trips/actions";
import type { Route } from "@/domain/route/route.entity";
import type { Trip } from "@/domain/trip/trip.entity";

const initialState: TripFormState = { status: "idle" };

type TripFormAction = (state: TripFormState, formData: FormData) => Promise<TripFormState>;

// Reusable create/edit form. The concrete Server Action is injected so the same
// UI serves both flows; on edit, `trip` prefills the fields.
export function TripForm({
  action,
  routes,
  trip,
  submitLabel,
}: {
  action: TripFormAction;
  routes: Route[];
  trip?: Trip;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  // datetime-local wants "YYYY-MM-DDTHH:mm".
  const departureValue = trip
    ? new Date(trip.departureAt.getTime() - trip.departureAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";

  return (
    <form
      action={formAction}
      className="mt-6 flex w-full max-w-lg flex-col gap-4 rounded-xl border border-card-border bg-card p-6"
    >
      {trip ? <input type="hidden" name="tripId" value={trip.id} /> : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Route
        <select
          name="routeId"
          required
          defaultValue={trip?.routeId ?? ""}
          className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
        >
          <option value="" disabled>
            Select a route…
          </option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.origin} → {route.destination}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Departure
        <input
          name="departureAt"
          type="datetime-local"
          required
          defaultValue={departureValue}
          className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Capacity
          <input
            name="capacity"
            type="number"
            min={1}
            max={200}
            required
            defaultValue={trip?.capacity ?? 12}
            className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Price (GHS)
          <input
            name="priceGhs"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={trip?.priceGhs ?? 0}
            className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
          />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/trips" className="text-sm text-link hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
