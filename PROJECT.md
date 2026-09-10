# PROJECT.md — Poker Bulls Classic

Read this file at the start of every session working in this repo. It records
standing rules the user has set for how to work here, the project history/
architecture, and a running changelog. Keep it up to date as work happens —
append to the changelog, don't rewrite history.

## Standing rules (do not violate)

1. **Never `git push` without explicit approval for that specific push.**
   Prior approval to push does not carry over to later changes — ask again
   every time, even for small/obvious changes. Local commits are fine to
   create without asking (unless told otherwise in a given session), but the
   push itself always needs a fresh "go ahead" from the user in chat.
2. Never handle real passwords (entering them, or even just seeing a user
   paste one in chat) — decline and ask the user to enter credentials
   themselves. If a password is ever pasted into chat by mistake, tell the
   user to rotate it.
3. Roles (`admin`, `floor_manager`) are stored in Supabase Auth
   `app_metadata`, **never** `user_metadata`. `user_metadata` is editable by
   the signed-in user via the client SDK (`supabase.auth.updateUser`), so
   using it for authorization would let anyone self-promote to admin.
   Supabase's own RLS advisor (`mcp__claude_ai_Supabase__get_advisors`,
   `type: security`) flags this — run it after any RLS change.
4. `C:\Users\fredm` (the Windows user home directory) has an unrelated stray
   git repo in it (remote `BMAD.git`), discovered by accident. Never assume
   the shell's cwd — always `cd` explicitly with an absolute path and check
   `pwd` / `git remote -v` before running git commands, since `git status`
   run from the wrong place can silently walk up to that repo instead.

## Architecture

- **Frontend**: Vite + React 19 + TypeScript, react-router-dom, Tailwind +
  shadcn/ui, react-hook-form + zod, @tanstack/react-query.
- **Backend**: Supabase (Postgres + Auth + RLS). Project ref:
  `zdveaylxvaydbyejtxye` (URL `https://zdveaylxvaydbyejtxye.supabase.co`).
  Schema: `supabase/schema.sql` (players, seasons, blind_structures, events,
  event_participants, event_results, app_settings — relational, replacing
  Firestore's nested arrays).
- **Auth roles**: `admin` (full access), `floor_manager` (can go live, run
  the live tournament — timer, participants, results — and mark an event
  completed; cannot manage players/seasons/blind structures/settings or
  create/edit/delete events), `guest` (client-side-only flag, zero write
  access anywhere, same read visibility as a logged-in user). See
  `src/hooks/useAuth.tsx` (`role`, `canManage`) and
  `src/components/RequireAuth.tsx` (`adminOnly` prop).
- **Hosting**: Vercel project connected to this repo, auto-deploys on every
  push to `main`. Production URL: `https://poker-bulls-classic.vercel.app`
  (no custom domain). `vercel.json` has the SPA rewrite react-router needs.
- **Local dev**: `npm install` then `npm run dev` from this directory
  (`C:\Users\fredm\projects\Poker-Bulls-Classic`) — this is the **canonical**
  working copy (git-tracked, remote `FredM-AI/Poker-Bulls-Classic`). Needs a
  `.env.local` (gitignored) with `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY`. Vite auto-picks the next free port if 3000 is
  taken (multiple stale dev servers tend to accumulate across sessions —
  check running background tasks before assuming a port).
- There is also `C:\Users\fredm\projects\poker-bulls-classic-vite` — the
  original scratch directory used to build the app before it was copied into
  this repo. It is **not** git-tracked and is now stale/superseded. Don't
  edit it; it's only useful as a historical reference if needed.

## Changelog

### 2026-09-10 — Full stack rebuild + data migration
- Rebuilt the app from Next.js 15 (Server Components/Actions) + Firestore to
  React (Vite) + Supabase, per user request to change stack while keeping
  all existing functionality. The AI assistant feature ("El Toro", which
  called an external n8n webhook) was dropped for v1.
- Migrated all production Firestore data to Supabase: 25 players, 5 seasons,
  1 blind structure template, 51 events, 621 event_participants, 621
  event_results. Verified via row counts after migration.
- Replaced the content of `main` on `FredM-AI/Poker-Bulls-Classic` with the
  new codebase (git history preserved — files replaced + committed, not a
  force-push/rewrite).
- Added `vercel.json` (SPA rewrite) and deployed to a new Vercel project
  connected to this repo. No custom domain — production is
  `poker-bulls-classic.vercel.app`.
- Created the `admin` Supabase Auth account (`admin@pbc.com`) — user set the
  password themselves; role set via `app_metadata`.

### 2026-09-10 — floor_manager role + RLS role-based access
- Added a second role, `floor_manager`, for running live tournaments without
  full admin rights. RLS policies split: admin-only for
  players/seasons/blind_structures/app_settings and event insert/delete;
  admin+floor_manager for event update, event_participants, event_results.
- **Security fix**: roles were initially read from `user_metadata` — moved
  to `app_metadata` after Supabase's RLS advisor flagged it as end-user-
  editable (see rule #3 above).
- Fixed `/events/:eventId/live` having no auth guard at all (reachable by
  anyone via direct URL) and `/settings` allowing any authenticated role
  instead of admin-only. Both now properly gated via `RequireAuth`.
- Wrapped all player/event/season create & edit routes in
  `RequireAuth adminOnly` for defense in depth (previously reachable by
  direct URL even though the buttons linking to them were hidden).
- Created the `floor_manager` account (`floor@pbc.com`) — same pattern as
  admin, password set by the user, role set via `app_metadata` by me on
  request.

### 2026-09-10 — Guest mode
- Added a `guest` role: a "Continuer en tant qu'invité" button on the login
  page, no password, implemented as a local-only flag (not a real Supabase
  session) since RLS already allows public reads on every table — no
  backend change was needed for this to be read-only by construction.
- Introduced `canManage` (`admin | floor_manager`) in `useAuth` and switched
  `RequireAuth` + all write-adjacent buttons to check it instead of "any
  truthy role", since `guest` is now also a truthy role. Fixed two more
  pre-existing spots (Edit Player / Edit Season buttons) that had the same
  "any authenticated role" bug, predating guest mode.

### 2026-09-10 — Live tournament timer responsive fixes (in progress)
- Found via testing at 1280×720 and 390×844 (mobile): `PokerTimerModal`
  (`src/components/PokerTimerModal.tsx` + `src/poker-timer.css`) has a fixed
  `flex-row` layout with a hardcoded `w-[350px]` stats sidebar that never
  stacks, huge fixed font sizes (`text-7xl`/`text-9xl` countdown) with no
  smaller breakpoint variant, and a hardcoded `height: 40%` on the sticky
  content area. Result: content clipped at 1280×720 (Ante line and "Next
  Level" bar invisible), and on mobile the countdown text visually overlaps
  the blinds text while the stats panel's numeric values are pushed off
  screen entirely.
- Fix in progress — kept **local only**, not pushed, per standing rule #1.
