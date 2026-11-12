# Tasks — core skeleton

- [x] 1. Codec module
  - [x] 1.1 Implement `core/codec.js` (`encodePayload` / `decodePayload`)
    with `CompressionStream` / `DecompressionStream`, base64url output,
    typed errors on corrupt input
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 1.2 Write the codec property-based test: any valid JSON
    round-trips through encode → decode unchanged; corrupt inputs
    (truncated, bad base64url, bad gzip, bad JSON) are always rejected.
    Run with `node --test`
    - _Requirements: 1.1, 1.3_

- [x] 2. Validation module
  - [x] 2.1 Implement `core/validate.js` for `listening-pack` v1 and
    `memory-board` v1 schemas, returning named reasons on failure
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Add unit tests: missing `type` / `schemaVersion`, unknown
    `type`, unsupported version, missing required fields per app
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Storage module
  - [x] 3.1 Implement `core/store.js` (IndexedDB, thin Promise wrapper,
    stores `player` / `board`; save / list / get / remove)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 3.2 Decide and record the re-import rule (same title: replace or
    duplicate) in the repo README; keep it the same in both apps
    - _Requirements: 3.1_
    - Decided 2026-11-12: the same title REPLACES the existing entry, and
      the store key is derived from the title only

- [ ] 4. Common UI
  - [x] 4.1 Implement `core/ui.js` (import notice, empty state with
    sample-import button, list → detail navigation)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ] 4.2 Verify in a desktop browser: import a sample link, see the
    confirmation, delete it, see the empty state again
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5. Agent hook (at least one, real)
  - [ ] 5.1 Configure one Kiro agent hook (e.g. run `node --test` on
    save) through Kiro's hook UI and record exactly what was configured
    in the repo README. Do not claim a hook that was not set up
    - _Requirements: (tech steering: Kiro usage)_
