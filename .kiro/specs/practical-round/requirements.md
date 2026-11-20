# Requirements — Practical-Use Round + Design Polish (Pack Player, landing)

Approved by Raz on 2026-11-20. The new-element UI follows the approved mock v2
(`mock/practical-round-v2/` on branch `feature/practical-round-mock`, commit
fbc598d): progress + Resume on list rows, Repeat toggle + Resume in the playback
bar, Played labels, keyboard hint line, single-line documents as body text.

## Scope

- Pack Player gains practical playback features: per-pack progress memory,
  resume, played marks, repeat modes, speed retention, keyboard operation,
  and the single-line heading fix.
- Landing page and Pack Player get a visual design polish for presentation
  (including the demo video). Structure, flows and data semantics do not
  change beyond the features below.
- **core/ is untouched**: codec.js, validate.js, store.js and ui.js stay
  byte-identical. All work lives in apps/player/, theme.css, and the landing
  page files. Memory Board code is untouched (it only inherits theme token
  values if they change).

## Requirement 1 — Progress memory

1. The player SHALL persist, per pack, a progress record: the index of the
   item/block where playback last stopped or is positioned (resume point),
   the set of played item/block indices, a finished flag, and an updatedAt
   timestamp.
2. Progress SHALL be keyed by the pack's store id and stored in localStorage
   under a `player-progress:` prefix. Speed (Requirement 4) uses
   `player-speed`. No IndexedDB schema change, no core/store.js change.
3. Progress updates SHALL be written when an item/block starts playing, when
   playback stops, and when playback finishes (finished = true, resume point
   cleared).
4. Deleting a pack SHALL also delete its progress record.
5. Re-importing a pack (same title replaces) SHALL keep the progress record
   if the item/block count is unchanged, and reset it otherwise.
6. A pack with no progress record behaves exactly as today.

## Requirement 2 — Resume and played marks

1. List view: a pack with progress and not finished SHALL show a thin
   progress bar (accent color) and the text `Section x of N` (document packs)
   or `Item x of N` (listening packs), plus a Resume button in the row.
   A finished pack SHALL show a full bar and a muted `Finished` label.
   The progress row SHALL align with the entry row above it (same width).
2. Resume (list row or detail bar) SHALL open the pack, scroll to the resume
   point, highlight it, and start playback from there.
3. Detail view: items/blocks before the resume point or already played SHALL
   render with a small `Played` label (accent color) and slightly muted text.
   The currently playing item/block keeps the existing `.playing` treatment.
4. The detail playback bar SHALL show a Resume button with the text
   `Resume · Section N` (or `Item N`) when a resume point exists and playback
   is not running. Play all always starts from the beginning.

## Requirement 3 — Repeat modes

1. The playback bar SHALL have one Repeat toggle button cycling three modes:
   Off → Repeat block → Repeat all → Off. The button label shows the mode;
   the active modes use `aria-pressed="true"` styling from the mock.
2. Repeat block: when the current item/block ends, it plays again, until the
   user stops playback or changes the mode.
3. Repeat all: when the last item/block ends, playback restarts from the
   first item/block.
4. Repeat applies to Play all, Resume and single item/block playback alike.

## Requirement 4 — Speed retention

1. The selected playback speed SHALL persist across sessions (localStorage)
   and be restored on load. Default remains 1.0 when nothing is stored.
2. Changing the speed during playback applies from the next utterance, as
   today.

## Requirement 5 — Keyboard operation (detail view)

1. When the detail view is shown and focus is not in an input, select or
   textarea: Space toggles Play all / Stop; ArrowDown plays the next
   item/block; ArrowUp plays the previous item/block.
2. A quiet muted hint line under the playback bar SHALL read:
   `Space: Play / Stop · ↑ / ↓: Previous / Next block`

## Requirement 6 — Single-line document fix

1. `splitDocument` SHALL return no heading when the document has exactly one
   non-empty line; the body is that line. (Multi-line documents keep the
   current rule: first non-empty line of 40 characters or fewer is the
   heading.)
2. The existing heading-rule test for the single-line case SHALL be updated
   to the new expectation; all other heading tests stay unchanged.

## Requirement 7 — Design polish (landing + player)

Visual only; no layout structure or flow changes.

1. Playing state: the full-saturation fill (`--playing-bg: #ffe066`) SHALL be
   replaced by a pale tint of the same hue. The playing state is carried
   mainly by a stronger left edge bar and the bold heading/text. Text on the
   playing background must stay clearly readable.
2. Typography: clearer hierarchy — pack title at title size on the detail
   view; document headings slightly larger; listening item text and meaning
   keep their sizes but gain line-height.
3. Document blocks gain a small muted counter label (`Section N`) above the
   heading, matching the mock's progress language.
4. Spacing: document blocks get one step more vertical padding; list rows
   and detail blocks share one consistent gap rhythm.
5. Landing: hero with a larger product title, a one-line pitch, and primary
   actions; app cards with clearer separation and hierarchy. The raw
   instruction-sheet URLs stay visible. No new sections.
6. Palette discipline: no new colors. Only `--playing-bg` (and if needed
   `--playing-edge`) token values change; every other token keeps its value.
7. Quality bars unchanged: tap targets ≥44px, no horizontal scroll at
   375px, `prefers-reduced-motion` respected, body-text contrast stays AA
   on its background.

## Requirement 8 — Tests and verification

1. New DOM-free module `apps/player/progress.js` (progress record shape,
   load/save/clear against an injected storage, resume-point and repeat
   resolution) with `node --test` coverage, mirroring document.js.
2. All existing tests stay green except the single-line heading test updated
   per Requirement 6.
3. Fresh-profile E2E: every existing flow plus progress save/resume across a
   reload, repeat block/all, speed restore, keyboard operation, and the
   Sokqa document sample by link. Screenshots at 1280px and 375px compared
   against mock v2 for the new elements.
