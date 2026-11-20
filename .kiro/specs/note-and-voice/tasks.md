# Tasks — Note display + voice preference

Branch: `feature/note-and-voice` from main. PR to main; do not merge
before review.

- [ ] 1. normalize.js: add pure `pickVoice(voices, lang)` per design;
      normalize.test.js cases (Google preferred, default fallback,
      primary-subtag match, no match, empty list)
- [ ] 2. app.js: speak() applies pickVoice (never throws); renderListening
      renders the note line between text and meaning when present
- [ ] 3. style.css: `.item .note` style per design
- [ ] 4. instructions/player.md: document `note` as the optional reading /
      pronunciation line with the audience guidance
- [ ] 5. node --test: all green (57 existing + new pickVoice cases)
- [ ] 6. Fresh-profile E2E: pack with notes renders the note line; pack
      without notes unchanged; screenshots at 1280px and 375px
- [ ] 7. Commit, push branch, open PR to main; report in Japanese
