# ENHANCEMENT.md — planned features not yet built

Design notes for features that have been discussed and agreed on in direction
but not implemented yet. When one gets built, move its section into
`PROJECT.md`'s changelog and delete it from here.

## Surrender (live tournament)

### What it is

At the first break of a live tournament — which is also the rebuy deadline —
a player can trade in their current (short) stack for a fresh starting
stack, in exchange for paying a buy-in. Functionally a special case of a
rebuy: same price, but the player isn't at 0 chips, so the chip-count math
needs to know how many chips they're trading in to avoid over-counting.

### Decisions made (2026-09-21 design discussion)

- **Chip accounting: precise, not simplified.** The floor manager enters the
  player's current stack at the moment of surrender; the app nets it out
  rather than assuming a full starting stack was added (which is what a
  normal rebuy-after-busting does).
- **Price: same as a rebuy** (`event.rebuyPrice`). No new per-event price
  field needed.
- **Enforcement: manual convention, not app-restricted.** The Surrender
  button (like the existing rebuy +/- controls) is always available; it's on
  the floor manager to only use it at the first break, same as today's
  unrestricted rebuy controls. No blind-level/break detection logic needed
  for v1.

### Proposed implementation (not yet built)

**Reuse the existing `rebuys` counter rather than adding a parallel one.**
Since the price is identical, a Surrender = a rebuy (`rebuys += 1`, which
already correctly feeds the prize pool and each player's net calculation)
*plus* recording the stack traded in, to correct the chip count:

```
totalChips = (participants + rebuys) × startingStack − Σ(surrendered chips)
```

A true rebuy (player busts to 0, pays, gets a full stack) adds one full
starting stack net — that's already today's behavior and is left untouched.
A Surrender only adds the *difference*, because the chips they already had
in play get subtracted back out.

**Data model:**
- `ParticipantState.surrenderedChips: number` (cumulative, default 0) — live
  state, already covered by the existing backup mechanism
  (`events.live_state`, see [[project-poker-bulls-classic]] / PROJECT.md's
  2026-09-21 backup changelog entry) since it's just another field on the
  participant object that already round-trips through that jsonb blob.
- `EventResult.surrenderedChips?: number` — persisted at finalization
  (`saveLiveResults`).
- New column: `event_results.surrendered_chips numeric not null default 0`.
  No RLS change needed — the existing `event_results_write_admin_or_floor`
  policy covers all columns already.

**Files to touch:**
- `src/lib/types.ts` — add the two new fields above.
- `src/lib/data-service.ts` — map the new column in `mapEvent`/results
  helpers; include it when building `finalResults` in wherever
  `saveLiveResults` is called from.
- `src/pages/events/LiveTournamentClient.tsx` +
  `src/components/PokerTimerModal.tsx` — both currently duplicate the
  `totalChips` formula; update both to subtract surrendered chips. Thread a
  new `onSurrender(playerId, stackTradedIn)` callback down through the same
  prop-drilling pattern as `onRebuyChange` etc.
- `src/components/LivePlayerTracking.tsx` — new "Surrender" action per
  active-player row (icon button next to Eliminate/Remove), opening a small
  popover (shadcn `Popover`) prompting for the current stack, with a
  Confirm button. After confirming, show a badge on the row (e.g. "↺ 4,500")
  — repeatable in the data model even though in practice it'll be used once
  per player.
- `supabase/schema.sql` + a `mcp__claude_ai_Supabase__apply_migration` call
  for the new column.

### Open questions (not yet answered by the user)

1. Should the surrendered-chips info also show up in the post-event results
   table on `EventDetailPage.tsx`, or is it purely a live-tracking aid with
   no visible trace afterward?
2. Button/label wording: "Surrender" in English (consistent with the rest of
   the app's UI copy, which is all English) or a French label since it's a
   term specific to this club?
