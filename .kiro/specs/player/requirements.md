# Requirements — Pack Player (App 1)

## Introduction

A minimal web version of Sokqa's listening-pack flow: import a pack made by
the user's AI chat from the public instruction sheet, save it locally, and
play it with the browser's built-in TTS. New code only — no Sokqa code reuse.

## Requirements

### Requirement 1 — Data format

**User Story:** As a user, my AI chat can generate a pack from the
instruction sheet and the app accepts it.

#### Acceptance Criteria

1. WHEN a payload has `type: "listening-pack"` and `schemaVersion: 1` THEN
   the app SHALL accept it if it matches the schema in the design doc.
2. WHEN `title` is missing THEN the payload SHALL be rejected with a reason.
3. WHEN an item lacks `text` THEN the payload SHALL be rejected with a reason.
4. WHEN `lang` is absent THEN playback SHALL default to `"en-US"`.

### Requirement 2 — Single-screen browsing

**User Story:** As a user, I see my imported packs, open one, and read its
sections and items.

#### Acceptance Criteria

1. WHEN the app opens THEN it SHALL list imported packs (title and total item count).
2. WHEN the user opens a pack THEN the app SHALL show its sections with
   headings and each item's text and meaning.
3. WHEN the app has no packs THEN it SHALL show the core empty state with
   the sample-import button.

### Requirement 3 — Playback (browser TTS only)

**User Story:** As a learner, I can listen to a pack's items without any
audio file or cloud voice.

#### Acceptance Criteria

1. WHEN the user taps an item THEN the app SHALL speak that item's text
   with `speechSynthesis` in the pack's `lang`.
2. WHEN the user starts continuous playback THEN the app SHALL speak all
   items in order, section by section.
3. WHEN the user changes speed THEN playback SHALL use 0.75, 1.0, or 1.25.
4. WHEN playback is running THEN the app SHALL show which item is playing
   and allow stopping.

### Requirement 4 — Export learning memo

**User Story:** As a learner, I can hand my study note back to my AI chat
as plain text.

#### Acceptance Criteria

1. WHEN the user exports THEN the app SHALL produce a plain-text memo of
   the open pack (title, sections, items) that can be pasted into an AI chat.
2. WHEN the memo is produced THEN it SHALL NOT include anything the user
   did not enter or import.

### Requirement 5 — Sokqa document-pack compatibility

**User Story:** As a Sokqa user, I can open a Sokqa learning pack in the
web player to check it before importing it into the app.

#### Acceptance Criteria

1. WHEN a payload has `type: "document"` and `schemaVersion: 1` THEN the
   app SHALL accept it if it matches the Sokqa document-pack schema in
   the design doc (title and language required; documents non-empty;
   each document has an id and text).
2. WHEN a document has `tts.text` THEN playback SHALL speak `tts.text`;
   WHEN it has no `tts.text` THEN playback SHALL speak the document text.
3. WHEN a document carries `tts.audioUrl` or `tts.audioPath` THEN the app
   SHALL ignore them (the web player is TTS-only).
4. WHEN a document pack is imported THEN it SHALL appear in the list and
   detail views like a listening pack, one section per document.
