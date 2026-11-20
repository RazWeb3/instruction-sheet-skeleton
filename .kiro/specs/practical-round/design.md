# Design — Practical-Use Round + Design Polish

## Boundaries

- Zero changes under `core/`. Progress and speed persist in localStorage,
  not IndexedDB, so `core/store.js` and the DB version stay untouched.
- Memory Board files are not edited. theme.css token changes are limited to
  the playing-state values, so Board's appearance does not shift.
- The reference for every new element is the approved mock v2
  (branch `feature/practical-round-mock`, `mock/practical-round-v2/`):
  same DOM placement, same class approach (player additions live in
  `apps/player/style.css`, theme-level changes only where noted).

## Progress model (new file: apps/player/progress.js)

DOM-free, storage injected (defaults to window.localStorage) so it is
testable with `node --test` like document.js.

```
loadProgress(storage, packId) -> { index, played: number[], finished } | null
saveProgress(storage, packId, record)   // adds updatedAt
clearProgress(storage, packId)
key: `player-progress:<packId>`
speed: loadSpeed(storage) / saveSpeed(storage, rate)  // key `player-speed`
```

Semantics:

- `index` = resume point: the item/block index where playback last started
  or stopped. Playing an item/block sets `index` to it and adds it to
  `played`. Natural completion of the last item/block sets `finished: true`
  and clears `index` (keep `played` full).
- Stop (user) leaves `index` at the item/block that was playing.
- Play all from the top resets the record first.
- Resume starts playback at `index` without resetting.
- Pack identity: the store id the views already use (`showDetail(id)`,
  list entries). Deletion in the list view clears the record; re-import
  compares the stored item/block count kept in the record
  (`count` field) and resets on mismatch.

## Playback changes (apps/player/app.js)

- `playAll(pack, rows, startIndex = 0)`: walks rows from startIndex;
  a shared `onItemStart(i)` hook updates highlight, progress and played
  rendering. Repeat resolution at item end:
  - mode `block` → replay same index (progress unchanged);
  - mode `all` and i is last → continue at 0;
  - mode `off` and i is last → finish (progress.finished).
- Single item/block tap-play also routes through `onItemStart`, so played
  marks accumulate from manual taps too.
- Repeat toggle is a button in the bar; mode kept in a module variable and
  mirrored to the button label (`Repeat: off` / `Repeat block` /
  `Repeat all`) with `aria-pressed` true unless off.
- Speed `<select>` initializes from `loadSpeed` and saves on change.
- Keyboard: one keydown listener active only while the detail view is
  shown; ignores events whose target is input/select/textarea or a button
  (Space on a focused button keeps its native click behavior). Space →
  toggle play-all/stop; ArrowDown/Up → play next/previous row relative to
  the current or resume index.
- List view: after the shared list renders, app.js augments each row whose
  pack has a progress record: appends a progress row element (bar + text)
  sized to the row, and inserts the Resume button. No core/ui.js change.

## Heading fix (apps/player/document.js)

In `splitDocument`, count non-empty lines first; when there is exactly
one, return `{ heading: null, body: <that line> }`. All other paths are
unchanged. The single-line unit test is updated to expect this.

## Design polish

- theme.css: `--playing-bg` becomes a pale tint of the current hue
  (light, warm, clearly a tint — not a saturated fill); `--playing-edge`
  stays or deepens slightly. The `.playing` treatment gains a 4px left
  edge (box-shadow inset or border) in player/style.css so the state
  reads without the loud fill.
- apps/player/style.css: doc-block padding up one step; `.doc-section`
  small muted counter label; `.doc-played` / progress / repeat styles
  ported from the mock's `mock-additions.css` (which was written against
  these same tokens); list progress row aligned to the entry row width.
- Landing (index.html + landing.css): hero type scale up (title uses
  `--fs-title` at a larger step via a landing-scoped class), pitch line,
  primary button emphasis, card separation via existing shadow levels.
  No new tokens, no new sections, instruction URLs unchanged.
- Board inherits nothing but the (unchanged) tokens it already uses.

## Testing

- `node --test`: existing suites green; document single-line test updated;
  new progress.js suite (round-trip, finish clearing index, count-mismatch
  reset, speed default/restore).
- E2E in a fresh browser profile over a local static server: import flows,
  play → reload → resume point offered and works, repeat block loops,
  repeat all restarts, speed persists after reload, Space/arrows operate,
  delete clears progress (re-import shows no progress row).
- Screenshots 1280/375 for landing, list, detail (document + listening),
  compared with mock v2 and the pre-change live pages.
