# Tasks — Pack Player (App 1)

- [x] 1. App shell
  - [x] 1.1 Build `apps/player/` single screen (list view + detail view)
    on `core/ui.js`, wired to the `player` store
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 1.2 Show section headings with item text + meaning in the detail view
    - _Requirements: 2.2_

- [x] 2. Playback
  - [x] 2.1 Implement per-item playback with `speechSynthesis` in the
    pack's `lang` (default `"en-US"`)
    - _Requirements: 1.4, 3.1_
  - [x] 2.2 Implement continuous playback (all items in order) with
    current-item highlight and stop
    - _Requirements: 3.2, 3.4_
  - [x] 2.3 Add speed selector (0.75 / 1.0 / 1.25)
    - _Requirements: 3.3_

- [x] 3. Export memo
  - [x] 3.1 Implement plain-text learning-memo export of the open pack
    - _Requirements: 4.1, 4.2_

- [x] 4. Instruction sheet + sample (proves the loop)
  - [x] 4.1 Draft `instructions/player.md`: data format, generation steps,
    how to build the import link (JSON → gzip → base64url → app URL +
    `?data=`), length guidance. AI-neutral wording — no "Muse only"
    - _Requirements: 1.1_
  - [x] 4.2 Create `samples/player-sample.json` by following that sheet,
    generate its import link, and verify import → play end-to-end in a
    fresh browser profile
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_
    - Verified 2026-11-12 on localhost in a fresh headless Edge profile (scripted via DevTools protocol). speechSynthesis.speak was stubbed to record calls, so real audio output and the GitHub Pages URL are NOT yet verified.
