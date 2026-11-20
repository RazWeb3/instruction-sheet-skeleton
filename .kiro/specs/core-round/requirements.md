# Requirements: Core round (core.md and presentation)

## Background
The skeleton's premise is that an AI chat reads an instruction sheet and
produces data plus an import link. Today the repo has only per-app sheets
(instructions/player.md, instructions/board.md), and the shared parts
(envelope, codec, link recipe) are duplicated in each. There is no single
canonical "core" document, so the project's foundation is implicit.
Separately, import links have been delivered as bare long URLs, and a
Sokqa-format pack was about to be delivered with a GitHub Pages player URL
even though Sokqa's canonical import host is convly.jp.

Decisions (Raz, 2026-11-21):
- The project stands on a core MD: one canonical AI-facing document that
  carries the shared contract; per-type sheets hang off it.
- Links are presented as anchor text or buttons, never as bare URLs.
- Sokqa-side import links use https://convly.jp/import?data= (same codec).

## Requirements
1. New file instructions/core.md: the canonical core document (content per
   design.md; final text supplied with the implementation task).
   It is served at
   https://razweb3.github.io/instruction-sheet-skeleton/instructions/core.md
2. instructions/player.md and instructions/board.md are refactored to
   reference the core for the shared parts (envelope, codec, link recipe,
   delivery rules) instead of duplicating them. Per-type schema, field
   guidance, content guidance and examples stay in each sheet.
3. Landing page (index.html): the instruction-sheet anchors point to the
   raw Pages .md URLs (what a user pastes into an AI chat), and a link to
   the core sheet is added ("Start with the core"). No bare long URLs.
4. README.md: links to core.md prominently; presentation uses anchors only.
5. No changes to core/, apps/ JS or CSS, or theme.css. Existing tests must
   pass unchanged (61/61).
6. The Sokqa demo pack's import link is generated in the convly.jp form
   (handled in the sample side chat, not in this repo round).

## Out of scope
- App behavior changes of any kind.
- New data types.
