# UBBS — University Bus Booking System

A fullstack bus-booking platform for AAMUSTED students and the transport office:
browse trips, reserve a seat with a hold timer, get a QR ticket, and let staff scan
it at boarding. Admins manage routes, trips, users, and see demand/occupancy/revenue.

Built from scratch as a modern Next.js app on Supabase (a rebuild of the original
PHP/MySQL coursework proposal). For the full picture — architecture, data model,
and how to add a feature — see [DOCUMENTATION.md](./DOCUMENTATION.md).

## Stack

- **Next.js 16** (App Router, React 19, TypeScript) — Server Components + Server Actions
- **Supabase** — Postgres, Auth, RLS, RPCs, `pg_cron` (the only backend; no separate API/ORM)
- **Tailwind CSS 4** — styling
- **Zod 4** — input validation
- **`@supabase/ssr`** — cookie-based auth across server/client/proxy
- **jsQR** + **qrcode** — QR ticket generation and the staff boarding scanner
- **Nodemailer** (Brevo SMTP) — email invites
- **xlsx** — bulk user upload / CSV exports
- **npm** — package manager (do not introduce pnpm/yarn/bun)

## Getting started

Copy the env template and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Camera APIs (the QR scanner at `/staff/check-in`) require a secure context.
> For LAN testing on a phone, use `npm run dev:https` and the generated certs.

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase anon/publishable key |
| `NEXT_PUBLIC_SITE_URL` | public | Base URL for email links (invites, resets) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin email-invite flow (bypasses RLS — never expose) |
| `SMTP_*` | server only | Brevo SMTP for emailing invite links (optional) |

See [.env.local.example](./.env.local.example) for details. Missing the optional
keys degrades gracefully — invites still generate a copyable link, just without email.

### Password reset and invite links (production)

Email auth links (password reset, invites) use `NEXT_PUBLIC_SITE_URL` to build
redirect URLs like `{SITE_URL}/auth/confirm?next=/reset-password`. For production:

1. **Vercel** — set `NEXT_PUBLIC_SITE_URL` to your public app URL (e.g.
   `https://transport-booking-system-gamma.vercel.app`, no trailing slash).
2. **Supabase Dashboard** → Authentication → URL Configuration:
   - **Site URL** — same public app URL.
   - **Redirect URLs** — add `{SITE_URL}/auth/confirm` (and optionally
     `{SITE_URL}/auth/confirm?next=/reset-password`).

If the redirect URL is not allow-listed, Supabase falls back to Site URL and may
append `?code=` to the app root instead of `/auth/confirm`. The app proxy
forwards stray `?code=` params to `/auth/confirm` as a safety net, but fixing
the env + Dashboard settings is the proper fix.

3. **Supabase Dashboard** → Authentication → Emails → Templates → **Reset Password**
   — replace the default `{{ .ConfirmationURL }}` link (PKCE `?code=`, requires
   the same browser that requested the reset) with a direct `token_hash` link
   that works in any browser:

   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset password</a>
   ```

   Set **Site URL** (Authentication → URL Configuration) to your public app URL.
   The link goes straight to `/auth/confirm`; the Continue button still protects
   the one-time token from email scanners.

### Invite emails (production)

User invites are emailed by the **app** via Nodemailer ([src/data/email/mailer.ts](src/data/email/mailer.ts)), not Supabase's built-in mailer. Password-reset emails use Supabase SMTP; invite emails need separate `SMTP_*` env vars.

1. **Vercel** → project → Settings → Environment Variables — add (reuse the same Brevo credentials as Supabase Dashboard SMTP):
   - `SMTP_HOST` = `smtp-relay.brevo.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = your Brevo login email
   - `SMTP_PASS` = your Brevo SMTP key
   - `SMTP_FROM` = your verified sender email
   - `SMTP_FROM_NAME` = `UBBS` (optional)
2. **Redeploy** after adding env vars (changes don't apply until a new deployment).
3. **Local dev** — copy the same values into `.env.local` if you want invite emails when running `npm run dev`.

Without `SMTP_*`, invites still work: the admin UI shows a copyable link and a warning that email isn't configured.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run dev:https` | Dev server over HTTPS (for camera/LAN testing) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Architecture

Clean-architecture layering — `domain/` → `use-cases/` → `data/` → `app/`+`components/`.
The rules are enforced as a project skill: read
[`.claude/skills/nextjs-clean-architecture/SKILL.md`](./.claude/skills/nextjs-clean-architecture/SKILL.md)
before adding a feature. Feature/build status lives in [FEATURES.md](./FEATURES.md).

> **Next.js 16 note:** `middleware.ts` is renamed to [`src/proxy.ts`](./src/proxy.ts) —
> intentional, not a typo. APIs differ from older Next; check `node_modules/next/dist/docs/`.
