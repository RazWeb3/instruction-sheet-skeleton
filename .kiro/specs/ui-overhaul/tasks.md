# Tasks — UI Overhaul

- [x] 1. Design system and shell
  - [x] 1.1 Rework `theme.css` into the shared token set and shell
    (top bar, title area, content column, shared components)
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Apply the shell to `index.html`, `apps/player/index.html`,
    and `apps/board/index.html` (markup only at this step)
    - _Requirements: 1.1_

- [x] 2. Landing page
  - [x] 2.1 Rebuild the landing page: hero, app cards, "How it works"
    strip, footer
    - _Requirements: 2.1, 2.2_

- [x] 3. Player views
  - [x] 3.1 Add `source: "document"` in `apps/player/normalize.js`
    with a unit test
    - _Requirements: 4.1, 6.2_
  - [x] 3.2 Implement the document reading view (block per document,
    heading derivation per the design doc, line breaks preserved,
    block tap = play that document, highlight while playing) with
    unit tests for the heading rule
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 3.3 Restyle the listening-pack view and add the sticky
    playback bar (Play all / Stop / speed)
    - _Requirements: 3.1, 3.2_

- [x] 4. Board view
  - [x] 4.1 Cards in a responsive grid; tag filter as chips
    - _Requirements: 5.1, 5.2_

- [x] 5. Verification
  - [x] 5.1 `node --test` all green (existing + new)
    - _Requirements: 6.2_
  - [x] 5.2 Fresh-profile browser pass over every flow (landing, both
    apps, both samples, the Sokqa document sample by link), with
    screenshots at 1280px and 375px and no horizontal scrolling
    - _Requirements: 2.2, 4.1, 6.1, 6.3_
