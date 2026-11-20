# Tasks — Practical-Use Round + Design Polish

Branch: `feature/practical-round` from main. PR to main; do not merge
before review. Reference mock: `mock/practical-round-v2/` on branch
`feature/practical-round-mock` (its `mock-additions.css` is the style
starting point for the new elements; do not copy the mock's static HTML).

- [ ] 1. progress.js: DOM-free progress + speed persistence (localStorage
      keys `player-progress:<id>`, `player-speed`), with node --test suite
- [ ] 2. document.js: single-line documents return no heading; update the
      single-line heading test; all other tests green
- [ ] 3. app.js playback: onItemStart hook (highlight + progress + played),
      playAll(startIndex), repeat modes (off / block / all) with the bar
      toggle button, stop/finish semantics per design
- [ ] 4. app.js views: list-row progress bar + label + Resume button
      (aligned to the row), detail Resume button (`Resume · Section N`),
      Played labels/muting in both renderers, keyboard operation + hint
      line, speed restore on load and save on change, delete clears
      progress, re-import count check
- [ ] 5. style.css: port the mock's addition styles (progress, repeat,
      played, keys hint, doc-section counter), doc-block padding step,
      4px playing edge; theme.css: soften --playing-bg to a pale tint
- [ ] 6. Landing polish: hero scale/pitch/primary actions, card hierarchy
      (index.html + landing.css only; no new sections, URLs unchanged)
- [ ] 7. Full test run: node --test all green (43 existing with 1 updated
      expectation + new progress suite)
- [ ] 8. Fresh-profile E2E incl. reload-resume, repeat, speed restore,
      keyboard, delete-clears-progress; screenshots at 1280px and 375px;
      no horizontal scroll at 375px
- [ ] 9. Commit, push branch, open PR to main with a summary and the
      screenshot set noted; report in Japanese
