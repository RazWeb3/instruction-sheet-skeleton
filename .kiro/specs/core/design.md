# Design — core skeleton

## Overview

Four DOM-free-or-thin modules under `core/`, shared by both apps. The
browser-only parts (IndexedDB, `speechSynthesis`) are isolated so the codec
and validation can be unit-tested in Node with `node --test`.

## Modules

### `core/codec.js` (DOM-free)

- `encodePayload(obj): string` — `JSON.stringify` → `CompressionStream('gzip')`
  → bytes → base64url (URL-safe alphabet, no padding).
- `decodePayload(data: string): object` — reverse; throws a typed error
  (`CodecError` with `reason`) on bad base64url, bad gzip, or bad JSON.
- Both functions are pure: no `window`, no `document`, no storage access.

### `core/validate.js` (DOM-free)

- `validatePayload(obj): { type, schemaVersion, data }` — checks top-level
  `type` and `schemaVersion`, then dispatches to the per-app schema:
  - `listening-pack` v1: `title` string (required); `sections` array of
    `{ heading, items: [{ text (required), meaning?, note? }] }`.
  - `memory-board` v1: `title` string (required); `cards` array of
    `{ heading (required), body (required), tag?, updatedAt? }`.
- Return shape (decided 2026-11-12 during implementation): success is
  `{ ok: true, type, schemaVersion, data }`, failure is
  `{ ok: false, reasons: [...] }`. Never throws for bad data.
- Unknown `type` or unsupported `schemaVersion` is a rejection, not a
  fallback to "best effort".

### `core/store.js`

- Thin Promise wrapper over IndexedDB. One database, one object store per
  app (`player`, `board`), keyed by an id derived from the payload's
  `title` only.
- Operations: `save(app, payload)`, `list(app)`, `get(app, id)`,
  `remove(app, id)`. All return Promises.
- Re-import rule (decided 2026-11-12, recorded in the repo README):
  re-importing the same title REPLACES the existing entry. There is at
  most one entry per title per app; keep this consistent in both apps.

### `core/ui.js`

- `showNotice(message, kind)` — import result banner (success / error).
- `renderEmptyState(app, onImportSample, instructionUrl?)` — instruction-
  sheet hint + "import sample" button. (Signature decided 2026-11-12
  during implementation: importing a sample must run the whole decode →
  validate → save flow, so the UI takes a callback instead of a raw link.
  The app builds the sample link with `encodePayload` from the JSON in
  `samples/` and passes the import handler in.)
- `renderList(entries, onOpen, onDelete)` — list → detail navigation.

## Data flow (import)

```
?data= → codec.decodePayload → validate.validatePayload
  → store.save(app, data) → ui.showNotice("Imported: <title>")
  → list re-renders
```

Any step failing stops the chain, shows the reason, and saves nothing.

## Testing

- Property-based test for the codec (see `tasks.md`): round-trip on
  arbitrary valid JSON; rejection on arbitrary corrupt input.
- Unit tests for `validate.js`: each acceptance criterion in
  `requirements.md` gets at least one case, including missing `type`,
  unknown `type`, missing required fields.
- Run with `node --test`; no browser needed for codec/validation tests.
