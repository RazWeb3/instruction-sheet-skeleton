# Requirements — UI Overhaul (landing + both apps)

## Introduction

A presentation-layer overhaul of the landing page, Pack Player, and
Memory Board. The current UI was built for short word items; it cannot
present Sokqa document packs (long, multi-line scripts) readably, and it
looks plain in the demo video. Features, flows, and data semantics do
NOT change: import (link and sample), storage, validation, playback
order and languages, and memo export all behave exactly as before.
Only markup structure, styling, and the player's rendering of document
packs change.

## Requirements

### Requirement 1 — Shared shell and design system

**User Story:** As a visitor, all three pages feel like one designed
product.

#### Acceptance Criteria

1. WHEN any page opens THEN it SHALL show the shared shell: a top bar
   with the product name (linking to the landing page), a clear page
   title area, and a single content column.
2. WHEN styles are applied THEN they SHALL come from the shared
   `theme.css` design tokens (palette, type scale, spacing), keeping
   the bone/skeleton motif, with app `style.css` files holding only
   app-specific rules.

### Requirement 2 — Landing page

**User Story:** As a judge, I understand the project in seconds and can
reach both apps.

#### Acceptance Criteria

1. WHEN the landing page opens THEN it SHALL show a hero (project name,
   one-line pitch, short explanation), two app cards with primary
   "Open the app" actions, and a "How it works" strip (instruction
   sheet → your AI chat → import link → local app).
2. WHEN the viewport is narrow THEN the layout SHALL stack without
   horizontal scrolling.

### Requirement 3 — Player reading view (listening packs)

**User Story:** As a learner, a word pack reads cleanly and playback
controls are always at hand.

#### Acceptance Criteria

1. WHEN a listening pack is open THEN sections SHALL render as headed
   groups of item rows (text + meaning), restyled under the new design
   system.
2. WHEN a pack is open THEN a playback bar (Play all, Stop, speed)
   SHALL be visible without scrolling away from the content, and the
   currently playing item SHALL be clearly highlighted.

### Requirement 4 — Player document view (Sokqa document packs)

**User Story:** As a Sokqa user checking a pack on the web, I can read
each document as it is written and play it block by block.

#### Acceptance Criteria

1. WHEN a pack imported from a Sokqa document pack is open THEN each
   document SHALL render as its own block, with line breaks in the
   document text preserved.
2. WHEN a document's first line is short (40 characters or fewer) THEN
   that line SHALL be used as the block heading and removed from the
   body; OTHERWISE the block SHALL have no heading and show the full
   text.
3. WHEN the user taps a block's play control THEN playback SHALL speak
   that document (its `tts.text` when present, else its text, in its
   speak language) — playback behavior itself is unchanged.
4. WHEN continuous playback runs THEN the current block SHALL be
   highlighted like a current item.

### Requirement 5 — Board view

**User Story:** As a user, memory cards are easy to scan.

#### Acceptance Criteria

1. WHEN a board is open THEN cards SHALL render in a responsive grid
   (one column on narrow screens, more on wide screens) and tag
   filtering SHALL appear as selectable chips.
2. WHEN a tag chip is selected THEN filtering behavior SHALL be
   identical to before.

### Requirement 6 — Compatibility and quality bars

#### Acceptance Criteria

1. WHEN a pack was stored before this overhaul (no `source` flag) THEN
   it SHALL still render and play (as a listening pack).
2. WHEN `node --test` runs THEN all existing tests SHALL pass, plus new
   tests for the document heading rule and the `source` flag.
3. WHEN any page is viewed at 375px width THEN there SHALL be no
   horizontal scrolling, tap targets SHALL be at least 44px, and
   `prefers-reduced-motion` SHALL be respected.
