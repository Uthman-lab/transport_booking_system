---
name: nextjs-clean-architecture
description: Layering rules for this Next.js codebase (domain / use-cases / data / ui) — how to add a feature, where code goes, and what each layer may and may not import. Use whenever writing or reviewing code in ubbs-web, especially new features, API routes, Server Actions, or pages.
---

# Clean architecture in this Next.js app

This repo separates code into four layers. The dependency rule is one-directional:

```
      ui (app/, components/)
            │  calls
            ▼
      use-cases (use-cases/)
            │  depends on interfaces from
            ▼
        domain (domain/)
            ▲  implemented by
            │
      data (data/)
```

- **`domain/`** never imports from `use-cases/`, `data/`, `app/`, `next/*`, or `@supabase/*`. It is plain TypeScript.
- **`use-cases/`** imports only from `domain/`. It never imports `next/*`, `@supabase/*`, or anything under `app/`.
- **`data/`** implements the repository interfaces declared in `domain/`. This is the only layer allowed to import `@supabase/*` or write SQL/RPC calls.
- **`app/` and `components/`** are the UI layer. Pages/Server Actions compose a `data/` repository with a `use-cases/` function; components render domain types as props and never fetch data themselves.

If you're about to import Supabase into a component, or write a business rule inside a Server Action, stop — it belongs in a different layer. See "Anti-patterns" below.

## Directory structure

```
src/
  domain/
    shared/
      result.ts                     Result<T, E> — expected-failure type, not an exception
    <feature>/
      <feature>.entity.ts           Types + pure functions (business rules, zero I/O)
      <feature>.repository.ts       Interface only — the "port" the data layer implements
      <feature>.errors.ts           Typed domain error classes (only where a feature needs them)

  use-cases/
    <feature>/
      <verb-phrase>.ts              One exported async function per use case, deps injected

  data/
    supabase/
      client.ts / server.ts         Supabase client factories (browser / server component)
      proxy.ts                      Session refresh used by src/proxy.ts
    mappers/
      <feature>.mapper.ts           Row type + `toXEntity()` — the ONLY place DB shape meets domain shape
    repositories/
      supabase-<feature>.repository.ts   Implements the domain repository interface

  app/                              Next.js App Router (routes = composition roots)
    <feature>/
      page.tsx                      Server Component: build repository → call use case → render
      actions.ts                    'use server': validate input → call use case → revalidate

  components/
    <feature>/
      <thing>.tsx                   Presentational only — props are domain types, no data access
```

Worked example already in the repo: `domain/trip/*`, `domain/booking/*`, `use-cases/trips/list-available-trips.ts`, `use-cases/bookings/book-seat.ts`, `data/repositories/supabase-trip.repository.ts`, `data/repositories/supabase-booking.repository.ts`, `app/trips/page.tsx`, `app/trips/actions.ts`, `components/trips/trip-list.tsx`. Copy this shape for new features.

## Adding a new feature — checklist

Say you're adding "waitlist" on top of the existing schema:

1. **Domain**: `domain/waitlist/waitlist.entity.ts` (type + any pure rules, e.g. `canJoinWaitlist`), `domain/waitlist/waitlist.repository.ts` (interface: `join`, `listForTrip`, ...).
2. **Use case(s)**: `use-cases/waitlist/join-waitlist.ts` — a function taking `{ waitlistRepository }` as deps and typed input, returning domain data or a `Result`.
3. **Data**: `data/mappers/waitlist.mapper.ts` (row type + mapper), `data/repositories/supabase-waitlist.repository.ts` (implements the interface, owns the actual `.from()`/`.rpc()` calls).
4. **UI**: a Server Component or Server Action in `app/.../` that constructs the Supabase client, `new`s the repository, calls the use case, and passes the *domain* result to a presentational component in `components/`.

If any of these steps feels skippable ("I'll just call Supabase straight from the page"), don't — that's exactly the shortcut this structure exists to prevent, because it's what makes business rules untestable and scattered later.

## Layer rules in detail

**Domain** (`domain/`)
- Entities are plain types (or classes) plus pure functions — no `async`, no I/O, no `Date.now()`-style hidden state (accept `now` as a parameter with a default, like `isBookable(trip, now = new Date())`, so it's testable).
- Repository files in `domain/` contain ONLY an interface. No implementation.
- Add a typed error class per failure mode a use case needs to distinguish (`TripNotBookableError`, not a generic `Error`). This lets the UI layer branch on `error instanceof X` or a discriminated `Result`.

**Use cases** (`use-cases/`)
- One function per use case, named as a verb phrase (`bookSeat`, `listAvailableTrips`, `cancelBooking`).
- Dependencies (repositories) are injected as the first argument, never imported directly — this is what makes use cases unit-testable with an in-memory fake repository instead of a real Supabase client.
- Return a `Result<T, E>` (see `domain/shared/result.ts`) for failures the UI needs to handle gracefully (validation, business-rule violations, conflicts). Let genuinely unexpected errors (a dropped DB connection) throw — don't wrap everything in `Result` reflexively.
- No `next/*`, no `@supabase/*`, no `"use server"` — a use case must be callable from a script or test with zero Next.js runtime.

**Data** (`data/`)
- Every Supabase call (`.from()`, `.rpc()`, `.auth`) lives here. If you find yourself typing `supabase.from(...)` inside `app/`, move it into a repository method instead.
- Mappers translate row shape → domain shape in one direction only. Domain entities never carry DB-only fields (e.g. `created_at` stays a `Date` named per domain convention, not a raw ISO string).
- Repository classes take a `SupabaseClient` via constructor injection, so the same class works with the browser client, the server client, or a test double.
- When a Postgres function enforces an invariant (e.g. `create_booking`'s unique-seat constraint), let the repository surface that as a thrown error and let the use case decide what domain error it becomes — don't re-implement the invariant in TypeScript.

**UI** (`app/`, `components/`)
- Default to Server Components for reads: fetch in the page itself (via a use case), not in a client-side `useEffect`.
- Use Server Actions (`"use server"`) for writes. A Server Action is a thin adapter: validate untrusted input (see below), build repositories, call the use case, translate the result into UI state, call `revalidatePath`/`revalidateTag`/`updateTag` as needed. It is not the place for business logic.
- Presentational components receive domain types as props and render — nothing else. If a component needs to fetch or mutate, that's a sign it should be a Server Component/Action boundary instead, or should call a passed-in handler.
- Reach for a Route Handler (`app/api/.../route.ts`) only for endpoints that must be plain HTTP (webhooks, third-party callbacks, non-browser clients) — not as a default way to move data to a page. Server Components and Server Actions cover normal reads/writes.

## Validation and security at the boundary

- Every Server Action must validate its input with `zod` before doing anything else — `FormData`/JSON from the client is untrusted regardless of what the UI enforces. See `app/trips/actions.ts` for the pattern (`z.object({...}).safeParse(...)`, return an error state on failure).
- Never derive identity/ownership from client-supplied fields. Re-derive the acting user from the session (`supabase.auth.getUser()` / RLS's `auth.uid()`) inside the data layer, not from a field the client sent.
- Row Level Security is the last line of defense, not the first — validate and authorize in the use case/action too, so failures are handled as UI-friendly errors instead of opaque Postgres exceptions.
- Never import anything that references a Supabase **service-role** key into code that can end up in a client bundle. Service-role usage (if ever needed) belongs in a Route Handler or server-only module, clearly separated from `data/supabase/client.ts`.

## Next.js 16 specifics (this project pins `next@16.2.10`)

- Middleware was renamed **Proxy**: the file is `src/proxy.ts`, exporting `proxy(request)`, not `middleware.ts`/`middleware()`. Don't recreate a `middleware.ts` file.
- Prefer Server Actions over hand-rolled `fetch` + Route Handler for mutations triggered from a form/button in this app — see `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` for the framework's security guarantees (CSRF origin check, encrypted action IDs) and their limits (still validate/authorize inside the action).
- Server Actions dispatch **sequentially per client** — don't `Promise.all` several actions from a client component expecting parallelism; do the parallel work inside one action, or use a Server Component for parallel reads.
- Choose the right revalidation primitive after a mutation: `revalidatePath` (used in `app/trips/actions.ts`) for a single affected route, `updateTag`/`revalidateTag` when multiple routes share a cache tag. Don't reach for a full page reload from the client to see fresh data.
- This version of Next.js may differ from training-data assumptions in other ways — when unsure about a convention, check `node_modules/next/dist/docs/` before guessing (see `AGENTS.md`).

## Testing implications of this structure

- `domain/` and `use-cases/` are unit-testable with zero mocking libraries: implement the repository interface with an in-memory fake (a plain object/class satisfying `TripRepository`) and assert on the use case's return value.
- `data/` repositories are the integration-test boundary — test them against a real (local/test) Supabase instance, not by mocking the Supabase client, or the test stops proving anything about the actual query.
- Because business rules live in `domain/`/`use-cases/`, UI tests (if/when added) only need to assert on rendering given domain data as props — they don't need a database at all.

## Anti-patterns to flag in review

- `supabase.from(...)` or `supabase.rpc(...)` called from anything under `app/` or `components/` — move it into a `data/repositories/*` method.
- A `domain/` or `use-cases/` file importing `next/*` or `@supabase/*`.
- A component that both fetches data and renders it (fetch belongs in the page/action; the component takes props).
- Business rules (seat availability, bookability, role checks) duplicated in a Server Action instead of living once in `domain/`.
- Raw DB rows (snake_case fields, ISO date strings) leaking past the `data/` mapper into a use case or component. If you see `row.trip_id` outside `data/`, something skipped the mapper.
- A new `Result`-returning function used for a failure mode that is actually a bug, not an expected outcome — let programmer errors throw.
