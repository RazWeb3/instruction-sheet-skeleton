# Design — UI Overhaul

Presentation only. `core/codec.js`, `core/validate.js`, and
`core/store.js` are untouched. Allowed code changes: `theme.css`, the
three pages' markup, app `style.css` files, rendering code in the two
apps, and one small addition to `apps/player/normalize.js` (below).

## Shell and design system

- `theme.css` holds the tokens: bone palette (existing hues, deepened
  contrast), a type scale (page title / section heading / body / small),
  spacing steps, radius, and shadow levels.
- Shell per page: top bar (product name → landing link, small), title
  area, content column (max-width about 44rem; the board grid may use
  about 60rem), footer note where a page already has one.
- Components styled from the shell: buttons (primary / quiet / danger),
  list rows, cards, chips, notice, playback bar, document block.

## Landing page

Hero → app cards (primary action per card; the raw instruction-sheet
URL stays visible under each card, mono, wrapping) → "How it works"
strip with four steps → footer (GitHub link, license). Static HTML.

## Player rendering

Detail view branches on the stored pack:

- **Listening packs** (`source` absent or `"listening-pack"`): headed
  sections of item rows, as today, restyled.
- **Document packs** (`source: "document"`): one block per section.
  - Heading derivation (render time, from the item's text): take the
    first non-empty line; if it is 40 characters or fewer, it is the
    heading and the body is the remaining lines; otherwise no heading
    and the body is the full text.
  - Body preserves line breaks (`white-space: pre-wrap` or equivalent).
  - The whole block is the tap target for playing that document; the
    playing block gets the current-item highlight.
- Playback bar: Play all / Stop / speed selector in a bar that stays
  visible in the detail view (sticky). Playback logic (order, speak
  text/lang resolution via `speechFor`, stop semantics) is unchanged.

### Model addition (normalize.js)

`normalizeDocumentPack` adds `source: "document"` to the stored pack.
Everything else about the normalized shape is unchanged, so stored
document packs remain listening-pack-shaped; the flag only selects the
rendering branch. Packs stored before this change have no flag and
render as listening packs (Requirement 6.1) — re-importing a document
pack upgrades it.

## Board rendering

Cards in a CSS grid (1 column < 640px, 2 columns above; wider screens
may use the wider content column). Tag filter becomes a chip row with
a pressed state. Card content and filter logic are unchanged.

## Verification

- `node --test` all green, including new tests: heading derivation
  (short first line / long first line / single line) and the `source`
  flag in the normalizer.
- Fresh-profile browser pass: landing, both apps, both samples, the
  Sokqa document sample via its link and via the sample data — import,
  detail rendering (document blocks show line breaks), playback calls
  in order, memo export, delete → empty state.
- Screenshots at 1280px and 375px; no horizontal scrolling anywhere.
