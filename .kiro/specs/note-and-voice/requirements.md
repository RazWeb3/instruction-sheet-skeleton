# Requirements — Note (reading) display + voice preference

Approved by Raz on 2026-11-20 after trying the demo pack on a real machine:
a listening pack for learners who cannot read the target script needs the
reading (e.g. romaji) shown, and playback should prefer a natural voice
over the OS default when the browser offers one.

## Requirement 1 — Note line in the listening view

1. When a listening-pack item has a non-empty `note`, the item SHALL render
   it as its own line between the item text and the meaning, with the class
   `note`. Items without a note render exactly as before.
2. The note is display-only: it is never spoken, and it does not affect
   validation, storage, progress or the memo export.
3. `instructions/player.md` SHALL describe `note` as the optional reading /
   pronunciation line (e.g. romaji for Japanese), so future packs include
   it where the audience needs it.

## Requirement 2 — Voice preference

1. When speaking, the player SHALL choose a voice from
   `speechSynthesis.getVoices()` for the utterance language using
   `pickVoice` (design.md): among voices whose language matches (exact, or
   same primary subtag), prefer a Google voice, then the browser default,
   then the first match. No match → leave the voice unset (current
   behavior).
2. Voice choice SHALL never throw and never block playback; an empty voice
   list (voices not yet loaded) simply means no explicit voice.
3. Document packs use the same speaking path, so they get the same
   preference through `speechFor`'s language.

## Requirement 3 — Tests and verification

1. `pickVoice` is a pure exported function with `node --test` coverage
   (Google preferred, default next, primary-subtag match, no match,
   empty list).
2. All existing tests stay green (57).
3. E2E in a fresh profile: import a pack whose items carry notes, confirm
   the note line renders between text and meaning and is absent for
   note-less items; screenshots at 1280px and 375px. Actual voice quality
   is verified by a human on a real machine, not by the automated test.
