# Tasks — Pack Player (App 1)

- [ ] 1. App shell
  - [ ] 1.1 Build `apps/player/` single screen (list view + detail view)
    on `core/ui.js`, wired to the `player` store
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 1.2 Show section headings with item text + meaning in the detail view
    - _Requirements: 2.2_

- [ ] 2. Playback
  - [ ] 2.1 Implement per-item playback with `speechSynthesis` in the
    pack's `lang` (default `"en-US"`)
    - _Requirements: 1.4, 3.1_
  - [ ] 2.2 Implement continuous playback (all items in order) with
    current-item highlight and stop
    - _Requirements: 3.2, 3.4_
  - [ ] 2.3 Add speed selector (0.75 / 1.0 / 1.25)
    - _Requirements: 3.3_

- [ ] 3. Export memo
  - [ ] 3.1 Implement plain-text learning-memo export of the open pack
    - _Requirements: 4.1, 4.2_

- [ ] 4. Instruction sheet + sample (proves the loop)
  - [ ] 4.1 Draft `instructions/player.md`: data format, generation steps,
    how to build the import link (JSON → gzip → base64url → app URL +
    `?data=`), length guidance. AI-neutral wording — no "Muse only"
    - _Requirements: 1.1_
  - [ ] 4.2 Create `samples/player-sample.json` by following that sheet,
    generate its import link, and verify import → play end-to-end in a
    fresh browser profile
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_

- [ ] 5. Sokqa document-pack compatibility
  - [ ] 5.1 Add the `document` schema to `core/validate.js` with tests
    (valid pack accepted; missing language, empty documents, a document
    without id or text rejected with reasons)
    - _Requirements: 5.1_
  - [ ] 5.2 Normalize document packs on import in the player
    (documents → sections, speak text/lang per the design table) with
    unit tests for the normalizer
    - _Requirements: 5.1, 5.4_
  - [ ] 5.3 Playback and display use the normalized form (speak text
    wins over display text; audio fields ignored)
    - _Requirements: 5.2, 5.3_
  - [ ] 5.4 Create `samples/sokqa-document-sample.json` (3 documents:
    one with `tts.text` different from `text`, one without `tts`),
    generate its import link into `samples/`, and verify import → detail
    → playback calls end-to-end in a fresh browser profile
    - _Requirements: 5.1, 5.2, 5.4_
  - [ ] 5.5 Add a short note to `instructions/player.md` that Sokqa
    document packs can be imported directly
    - _Requirements: 5.1_
