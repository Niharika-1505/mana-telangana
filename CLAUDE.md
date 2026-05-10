# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mana Telangana is a civic issue reporting platform for Nalgonda district, Telangana. Citizens anonymously submit geolocated complaints (potholes, garbage, drainage, etc.) with photos. The platform tracks MLA accountability via resolution rates and shows a public leaderboard. No login is required — identity is tracked via browser fingerprint.

The actual Next.js app lives in the `manatelangana/` subdirectory, not the repo root.

## Commands

All commands must be run from `manatelangana/`:

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL), Cloudinary (photo storage), Leaflet (maps)

**App directory** (`src/app/`):
- `/` — Home: interactive Leaflet map with issue pins
- `/report` — Anonymous issue submission form
- `/leaderboard` — MLA accountability rankings

**Components** (`src/components/`):
- `map/` — MapView, StatsBar, RecentReports, IssueBreakdown
- `Header.tsx`, `TransparencyFooter.tsx` — shared layout

**Lib** (`src/lib/`):
- `supabase.ts` — DB client + all TypeScript types (`Report`, `Ward`, `IssueType`, etc.)
- `cloudinary.ts` — Unsigned photo uploads
- `utils.ts` — Browser fingerprinting, status configs, formatting helpers

**Database** (`supabase/migrations/001_initial_schema.sql`):
- Core tables: `wards`, `issue_types`, `reports`, `report_confirmations`
- Fund/governance tables: `contributions`, `fund_proposals`, `proposal_votes`, `platform_costs`
- Views: `mla_leaderboard` (resolution scoring), `fund_summary`
- RLS enabled on all tables: public read + anonymous write (no auth)

## Key Patterns

**Path alias:** `@/` resolves to `src/` (configured in tsconfig.json and next.config.js webpack alias).

**Bilingual:** All user-facing strings have English and Telugu variants. Ward/issue type data has `_te` suffix fields (e.g., `ward_name_te`, `name_te`).

**Anonymity:** Reports are tied to a `browser_fingerprint` (generated in `utils.ts`) rather than user accounts. No auth flow exists.

**Severity levels:** `low`, `medium`, `high`, `critical` — styled via config in `utils.ts`.

**Report statuses:** `pending` → `in_progress` → `resolved` (or `rejected`) — only writable from `/manage-xt92k`.

**Image handling:** Photos upload directly to Cloudinary via unsigned preset; the returned URL is stored in `reports.photo_url`. The Cloudinary domain is whitelisted in `next.config.js`.

## Environment Variables

Required in `.env.local` (or Vercel dashboard):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

All are `NEXT_PUBLIC_` (browser-exposed). See `DEPLOYMENT.md` for Supabase and Cloudinary setup steps.

**Server-only (never expose with NEXT_PUBLIC_ prefix):**

```
SUPABASE_SERVICE_ROLE_KEY
```

Required for all admin write operations (reports, wards, issue_types, MLAs, MPs, contributions).
Find it in: **Supabase dashboard → Settings → API → service_role (secret)**.
Add to Vercel before running migration 008, or admin writes will return 500.
Only imported in `src/lib/supabase-admin.ts` — never import that file from `src/components/`.

## Git Workflow

- Always create a new branch from `main` before making any changes
- Branch naming: `feature/<short-description>` or `fix/<short-description>`
- After making changes, commit with a clear message
- Push the branch and raise a Pull Request to `main`
- Never commit directly to `main`

## Deployment

- **Hosting:** Vercel (auto-deploys from `main` branch pushes)
- **Database:** Supabase — run `supabase/migrations/001_initial_schema.sql` to initialize schema and seed data
- **Domain:** manatelangana.org.in (DNS via GoDaddy)
- Full launch checklist is in `DEPLOYMENT.md`
