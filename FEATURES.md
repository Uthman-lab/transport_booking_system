# UBBS — University Bus Booking System

Feature list for the AAMUSTED bus booking platform. Built as a single Next.js project on Supabase (Postgres, Auth, Realtime, Edge Functions, Storage).

## Student-facing

- [ ] Registration/login (student ID + email verification) via Supabase Auth
- [ ] Browse routes, destinations, and schedules for upcoming breaks
- [ ] Live seat availability view (seat map per trip)
- [ ] Seat reservation with a hold timer (seat auto-releases if payment isn't confirmed in time)
- [ ] Simulated mobile money payment step
- [ ] Booking confirmation via email/SMS with a digital ticket (QR code)
- [ ] "My Bookings" — view, cancel, or rebook
- [ ] Waitlist: auto-join when a trip is full, auto-promoted on cancellation
- [ ] Notifications for confirmations, reminders, delays, cancellations

## Admin / Transport-office-facing

- [ ] Admin dashboard: demand by route/date, occupancy %, revenue (simulated)
- [ ] CRUD for routes, trips, schedules, bus capacity
- [ ] Booking management: view all, manual override, refund/cancel
- [ ] Fair-allocation rules (1 active booking per student per trip)
- [ ] Broadcast announcements (delay, route change) to affected bookers
- [ ] Staff check-in tool: scan the QR ticket at boarding to mark attendance
- [ ] Exportable reports (CSV) for university planning

## System-level

- [ ] Role-based access: student / staff / admin (`profiles.role`, enforced via RLS)
- [ ] Audit log of booking/cancellation actions
- [ ] Atomic seat-locking to prevent double booking under concurrent requests

## Build status

**Done**
- Next.js 16 project scaffolded (`src/` App Router, TypeScript, Tailwind)
- Supabase project linked (`ubbs`); client/server/proxy helpers wired up via `@supabase/ssr`
- Database schema live: `profiles`, `routes`, `trips`, `bookings`, `waitlist_entries`
- RLS on every table; role-escalation guard on `profiles.role`
- Concurrency-safe booking lifecycle: `create_booking` / `confirm_booking` / `cancel_booking` RPCs
- `pg_cron` job expiring stale seat holds and auto-promoting the waitlist every minute
- Security/performance advisors clean (no warnings or errors)
- Clean architecture layering (`domain/` / `use-cases/` / `data/` / `app`+`components`) established; see
  `.claude/skills/nextjs-clean-architecture/SKILL.md`. First vertical slice built end-to-end: browsing
  upcoming trips (`use-cases/trips/list-available-trips.ts`) and booking a seat
  (`use-cases/bookings/book-seat.ts`) on `/trips`.
- Admin user management (`/admin/users`): invite hierarchy, role changes, edit details, hard delete,
  email invites via copyable link (`generateLink`).
- Staff QR check-in / boarding scan (`/staff/check-in`): camera scanner (jsQR) + manual code entry,
  backed by the `check_in_booking` RPC (`bookings.checked_in_at`/`checked_in_by`).

**Next up**
- Notifications (email/SMS)
- Reporting/exports (CSV) and admin dashboard stats (occupancy, revenue)
