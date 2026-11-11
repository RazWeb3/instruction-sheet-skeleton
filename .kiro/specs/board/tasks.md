# Tasks — Memory Board (App 2)

- [ ] 1. App shell
  - [ ] 1.1 Build `apps/board/` single screen (list view + detail view)
    on `core/ui.js`, wired to the `board` store
    - _Requirements: 2.1, 2.4_
  - [ ] 1.2 Render cards sorted by `updatedAt` descending (missing values last)
    - _Requirements: 1.4, 2.2_
  - [ ] 1.3 Add tag filter (all tags on the board + "all")
    - _Requirements: 2.3_

- [ ] 2. Export memo
  - [ ] 2.1 Implement plain-text correction-memo export of the open board
    - _Requirements: 3.1, 3.2_

- [ ] 3. Instruction sheet + sample (proves the loop)
  - [ ] 3.1 Draft `instructions/board.md`: data format, generation steps,
    how to build the import link (JSON → gzip → base64url → app URL +
    `?data=`), length guidance. AI-neutral wording — no "Muse only".
    State clearly that the sample person is fictional
    - _Requirements: 1.1_
  - [ ] 3.2 Create `samples/board-sample.json` (fictional person only —
    never Raz's real memory data) by following that sheet, generate its
    import link, and verify import → browse → tag filter end-to-end in a
    fresh browser profile
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_
