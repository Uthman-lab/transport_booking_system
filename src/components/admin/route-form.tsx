"use client";

import { useActionState } from "react";
import { createRouteAction, type RouteFormState } from "@/app/admin/routes/actions";

const initialState: RouteFormState = { status: "idle" };

export function RouteForm() {
  const [state, formAction, pending] = useActionState(createRouteAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-6 flex w-full max-w-lg flex-col gap-4 rounded-xl border border-card-border bg-card p-6"
    >
      <h2 className="text-lg font-semibold">Add a route</h2>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Origin
          <input
            name="origin"
            required
            className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Destination
          <input
            name="destination"
            required
            className="rounded-md border border-input bg-input-bg px-3 py-2 text-base font-normal outline-none focus:border-ring"
          />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="text-sm font-medium text-green-700 dark:text-green-400">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add route"}
      </button>
    </form>
  );
}
