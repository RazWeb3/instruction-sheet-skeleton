# Requirements — core skeleton

## Introduction

The shared skeleton used by both apps: decode an import link, validate the
payload, save it locally, and show common UI. Four functions only — nothing
app-specific lives here.

## Requirements

### Requirement 1 — Codec (encode / decode)

**User Story:** As a user, I can open an import link and the app recovers
the exact JSON my AI chat generated, so the data survives the trip through
a URL.

#### Acceptance Criteria

1. WHEN a URL carries `?data=<gzip+base64url JSON>` THEN the codec SHALL
   decode it to JSON identical to the encoded input.
2. WHEN encoding JSON THEN the codec SHALL produce a URL-safe string with
   no `+`, `/`, or `=` characters.
3. WHEN the `?data=` value is truncated, not base64url, or not valid gzip
   THEN the codec SHALL fail with a human-readable error and SHALL NOT
   throw an uncaught exception.
4. WHEN the codec module is imported in Node THEN it SHALL work without
   any DOM API.

### Requirement 2 — Validation

**User Story:** As a user, I get a clear reason when an import is bad,
instead of broken data silently entering the app.

#### Acceptance Criteria

1. WHEN a payload lacks top-level `type` or `schemaVersion` THEN validation
   SHALL reject it with a named reason.
2. WHEN `type` is `listening-pack` THEN validation SHALL check the player
   schema (title required; sections with heading and items; item text
   required). WHEN `type` is `memory-board` THEN it SHALL check the board
   schema (title required; cards with heading and body required).
3. WHEN `type` is unknown or `schemaVersion` is unsupported THEN validation
   SHALL reject it with a named reason.
4. WHEN validation fails THEN the app SHALL display the reason and SHALL
   NOT save anything.

### Requirement 3 — Storage

**User Story:** As a user, imported packs and boards persist in my browser
so I can reopen them later without the link.

#### Acceptance Criteria

1. WHEN valid data is saved THEN the store SHALL persist it in IndexedDB
   under a store named for its app (`player` / `board`).
2. WHEN the app lists saved data THEN the store SHALL return all entries
   for that app only.
3. WHEN the user deletes an entry THEN the store SHALL remove exactly that
   entry.
4. WHEN storage is implemented THEN it SHALL use a thin hand-written
   Promise wrapper with no external library.

### Requirement 4 — Common UI

**User Story:** As a user, I always understand what just happened after
opening an import link, and I know what to do when the app is empty.

#### Acceptance Criteria

1. WHEN an import succeeds THEN the UI SHALL show a confirmation naming
   the imported title.
2. WHEN an import fails THEN the UI SHALL show the validation reason.
3. WHEN an app has no saved data THEN the UI SHALL show an empty state
   telling the user to load an instruction-sheet URL into their AI chat,
   plus a button that imports the sample.
4. WHEN the user opens a saved entry THEN the UI SHALL navigate from the
   list to its detail view.
