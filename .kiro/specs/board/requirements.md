# Requirements — Memory Board (App 2)

## Introduction

A minimal version of Personal Dashboard: import a board of cards made by
the user's AI chat from the public instruction sheet, save it locally, and
browse it with tag filtering. New code only — no Personal Dashboard code reuse.

## Requirements

### Requirement 1 — Data format

**User Story:** As a user, my AI chat can generate a board from the
instruction sheet and the app accepts it.

#### Acceptance Criteria

1. WHEN a payload has `type: "memory-board"` and `schemaVersion: 1` THEN
   the app SHALL accept it if it matches the schema in the design doc.
2. WHEN `title` is missing THEN the payload SHALL be rejected with a reason.
3. WHEN a card lacks `heading` or `body` THEN the payload SHALL be
   rejected with a reason.
4. WHEN `updatedAt` is absent THEN the card SHALL sort to the end.

### Requirement 2 — Single-screen browsing

**User Story:** As a user, I see my imported boards, open one, and read its
cards newest first, optionally filtered by tag.

#### Acceptance Criteria

1. WHEN the app opens THEN it SHALL list imported boards (title only).
2. WHEN the user opens a board THEN the app SHALL show its cards sorted by
   `updatedAt` descending, cards without it last.
3. WHEN the user picks a tag THEN the app SHALL show only cards with that tag.
4. WHEN the app has no boards THEN it SHALL show the core empty state with
   the sample-import button.

### Requirement 3 — Export correction memo

**User Story:** As a user, I can hand a correction note back to my AI chat
as plain text.

#### Acceptance Criteria

1. WHEN the user exports THEN the app SHALL produce a plain-text memo of
   the open board (title, cards) that can be pasted into an AI chat.
2. WHEN the memo is produced THEN it SHALL NOT include anything the user
   did not enter or import.
