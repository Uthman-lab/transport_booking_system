# UBBS — Project Documentation

**University Bus Booking System** for AAMUSTED. Students browse scheduled bus trips,
reserve a seat under a hold timer, receive a QR ticket, and board by having staff scan
it. The transport office manages routes, trips, and users, and monitors demand,
occupancy, and revenue.

This is a from-scratch Next.js + Supabase rebuild of the original PHP/MySQL/Bootstrap
coursework proposal (AAMUSTED IT Education dept.).

- **Feature checklist & build status:** [FEATURES.md](./FEATURES.md)
- **Quick start:** [README.md](./README.md)
- **Layering rules (read before adding features):** [`.claude/skills/nextjs-clean-architecture/SKILL.md`](./.claude/skills/nextjs-clean-architecture/SKILL.md)

---

## 1. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, TypeScript 5) |
| Rendering | Server Components + Server Actions (`'use server'`) |
| Backend | Supabase — Postgres, Auth, RLS, RPCs, `pg_cron` (the only backend) |
| Auth session | `@supabase/ssr` (cookie-based, browser/server/proxy clients) |
| Styling | Tailwind CSS 4 |
| Validation | Zod 4 |
| QR tickets | `qrcode` (generate) + `jsqr` (scan) |
| Email | Nodemailer over Brevo SMTP |
| Spreadsheets | `xlsx` (bulk user upload, CSV exports) |
| Package manager | **npm** (committed `package-lock.json` — do not add pnpm/yarn/bun) |

> **Next.js 16 specifics:** `middleware.ts` is renamed to [`src/proxy.ts`](./src/proxy.ts)
> (intentional). Several APIs differ from older Next — consult
> `node_modules/next/dist/docs/` rather than relying on prior knowledge.

---

## 2. Architecture

The codebase follows clean-architecture layering with a **one-directional dependency
rule**:

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

| Layer | Path | May import | Must not import |
| --- | --- | --- | --- |
| **domain** | `src/domain/` | plain TS only | use-cases, data, app, `next/*`, `@supabase/*` |
| **use-cases** | `src/use-cases/` | domain | `next/*`, `@supabase/*`, app |
| **data** | `src/data/` | domain, `@supabase/*` | use-cases, app |
| **ui** | `src/app/`, `src/components/` | use-cases + data (composition), domain types | — |

- **domain** — entities (types + pure business rules), repository *interfaces* (ports),
  and typed errors. Zero I/O.
- **use-cases** — one async function per action; dependencies (repositories) are injected.
- **data** — the only layer that talks to Supabase: repository implementations, mappers
  (DB row → domain entity), Supabase client factories, mailer.
- **ui** — routes are composition roots: `page.tsx` builds a repository, calls a use case,
  renders domain types; `actions.ts` validates input, calls a use case, revalidates.

Import alias: `@/*` → `src/*` (see `tsconfig.json`).

### Directory map

```
src/
  domain/        auth booking check-in dashboard roster route trip user waitlist shared
                 └ <feature>.entity.ts · <feature>.repository.ts · <feature>.errors.ts
  use-cases/     one verb-phrase file per action (book-seat, invite-user, get-admin-dashboard, …)
  data/
    supabase/    client.ts (browser) · server.ts (RSC) · admin.ts (service-role) · proxy.ts
    mappers/     row → entity conversion
    repositories/ supabase-<feature>.repository.ts (10 repos)
    email/       mailer.ts (Brevo SMTP)
  app/           App Router routes (see §5)
  components/    ui/ bookings/ auth/ layout/ admin/ staff/ graphics/ trips/
  proxy.ts       session refresh (Next 16 "middleware")
supabase/migrations/   timestamped SQL (schema, RLS, RPCs, cron)
```

---

## 3. Data model

Live, linked Supabase Postgres project. RLS is enabled on **every** table; privileged
logic lives in `SECURITY DEFINER` functions under an `internal` schema.

### Tables

**`profiles`** — one row per `auth.users` (auto-created by trigger on signup)
- `id` (FK→auth.users), `full_name`, `student_id` (unique), `phone`
- `role` ∈ `student | staff | admin` (default `student`)
- `invited_by` (FK→profiles) — powers the admin invite hierarchy
- A trigger blocks non-admins from self-escalating their `role`.

**`routes`** — `origin`, `destination`. Admin-managed; readable by all authenticated.

**`trips`** — a scheduled run on a route
- `route_id`, `departure_at`, `capacity` (>0), `price_ghs`
- `status` ∈ `scheduled | cancelled | completed`

**`bookings`**
- `trip_id`, `student_id`, `seat_number`
- `status` ∈ `held | confirmed | cancelled`
- `hold_expires_at` (default now + 15 min), `ticket_code` (random hex, for QR)
- `checked_in_at`, `checked_in_by` (FK→profiles) — boarding scan
- **Unique partial index**: one active (`held`/`confirmed`) booking per `(trip_id, seat_number)` — the double-booking guard.
- Trigger enforces `seat_number` within the trip's capacity.

**`waitlist_entries`**
- `trip_id`, `student_id`, `status` ∈ `waiting | promoted | expired`
- Unique partial index: one active entry per `(trip_id, student_id)`.

### Key RPCs

| Function | Purpose |
| --- | --- |
| `create_booking` / `confirm_booking` / `cancel_booking` | Concurrency-safe seat booking lifecycle |
| `get_occupied_seats` | Seat map availability for a trip |
| `check_in_booking` | Mark a ticket boarded (staff scan) |
| `get_trip_roster` | Passenger list for a trip (staff/admin) |
| `get_admin_dashboard` | Demand / occupancy / revenue (excludes cancelled trips) |
| `delete_user` | Hard-delete respecting the invite hierarchy |
| `current_user_role` / `is_admin_ancestor` / `can_manage_user` | RLS & hierarchy helpers |

### Background job (`pg_cron`, every minute)

- `expire_held_bookings` — releases seats whose `hold_expires_at` has passed
- `promote_next_waitlist` — promotes the next waiter when a seat frees up

---

## 4. Auth & authorization

- **Session** — `@supabase/ssr` stores the session in cookies; `src/proxy.ts` refreshes
  it on each request. Three client factories in `data/supabase/`: `client.ts` (browser),
  `server.ts` (Server Components/Actions), `admin.ts` (service-role, server-only).
- **Roles** — `student | staff | admin`, stored on `profiles.role`, enforced end-to-end
  by RLS policies (not just in the UI).
- **Invite hierarchy** — admins invite staff/other admins; `invited_by` records who
  created whom, and `can_manage_user` / `is_admin_ancestor` gate management/deletion so
  an admin can only manage their own subtree.
- **Service role** — `SUPABASE_SERVICE_ROLE_KEY` is required only for the email-invite
  flow (creates the auth user + sends the invite). It bypasses RLS: server-only, never
  `NEXT_PUBLIC`. Omit it and invites still produce a copyable link.

---

## 5. Routes

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | public | Landing |
| `/login`, `/register` | public | Auth |
| `/forgot-password`, `/reset-password`, `/auth/confirm` | public | Password reset & email confirm |
| `/trips`, `/trips/[id]` | student | Browse trips, seat map, book |
| `/my-bookings` | student | View / cancel / rebook |
| `/bookings/[id]` | student | Booking detail + QR ticket |
| `/staff/check-in` | staff | QR/manual boarding scan |
| `/staff/trips`, `/staff/trips/[id]` | staff | Trip list + roster |
| `/admin/dashboard` | admin | Demand / occupancy / revenue |
| `/admin/users` | admin | Invite, role changes, edit, delete, bulk upload |
| `/admin/routes` | admin | Manage routes |
| `/admin/trips`, `/admin/trips/new`, `/admin/trips/[id]/edit` | admin | Manage trips |

---

## 6. Core flows

**Booking a seat.** `/trips/[id]` shows a seat map (`get_occupied_seats`). Selecting a
seat calls `create_booking`, which atomically inserts a `held` booking (the unique
partial index prevents two students grabbing the same seat). The seat is held for
15 minutes. A simulated mobile-money step calls `confirm_booking`; the ticket QR encodes
`ticket_code`. If the hold lapses, the cron job releases the seat and promotes the
waitlist.

**Waitlist.** When a trip is full, a student joins `waitlist_entries` (`waiting`). On a
cancellation/expiry, `promote_next_waitlist` promotes the earliest waiter.

**Boarding check-in.** `/staff/check-in` runs a jsQR camera scanner (or manual code
entry). The scanned `ticket_code` hits `check_in_booking`, which stamps `checked_in_at` /
`checked_in_by`. Requires a secure context — use `npm run dev:https` for phone testing.

**User management.** `/admin/users` supports single invites (email link via
Nodemailer/Brevo, plus an always-visible copyable link), bulk upload via `xlsx`
(Server Action, 4 MB body limit), role changes, edits, and hierarchy-aware hard delete.

---

## 7. Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase anon/publishable key |
| `NEXT_PUBLIC_SITE_URL` | public | Base URL for email links |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin email invites (bypasses RLS) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` / `SMTP_FROM_NAME` | server only | Brevo SMTP for invite emails (optional) |

Template: [.env.local.example](./.env.local.example). Both `SUPABASE_SERVICE_ROLE_KEY`
and `SMTP_*` are optional — without them invites fall back to a copyable link.

---

## 8. Local development

```bash
cp .env.local.example .env.local   # fill in Supabase creds
npm install
npm run dev                         # http://localhost:3000
npm run dev:https                   # HTTPS (camera/LAN testing)
npm run build && npm run start      # production build
npm run lint
```

Database changes are versioned SQL under `supabase/migrations/` (timestamped). Add a new
migration file rather than editing existing schema in place.

---

## 9. Adding a feature (the short version)

1. Model it in **`domain/<feature>/`** — entity types, pure rules, a repository interface,
   any typed errors.
2. Write the **use case** in `use-cases/<feature>/<verb>.ts`, depending only on the
   domain interface.
3. Implement the repository in **`data/repositories/`** + a mapper; add a migration if the
   schema changes.
4. Wire the **UI** in `app/<feature>/`: `page.tsx` composes repo + use case; `actions.ts`
   validates with Zod, calls the use case, revalidates.

Never import Supabase into a component or put a business rule in a Server Action. Full
rules and anti-patterns: [`.claude/skills/nextjs-clean-architecture/SKILL.md`](./.claude/skills/nextjs-clean-architecture/SKILL.md).

---

## 10. Status

Done: auth, trip browsing + seat booking, waitlist, admin user management (with invite
hierarchy), staff QR check-in, admin dashboard, route/trip CRUD. Next up: notifications
(email/SMS) and CSV report exports. See [FEATURES.md](./FEATURES.md) for the live list.
