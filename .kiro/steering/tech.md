# Tech Steering — Instruction-Sheet Skeleton

## Stack

- **No build step. Plain HTML/CSS/JS, ES modules.** No framework, no
  bundler. This keeps the skeleton thin and lets a judge open it as-is.
- **Hosting:** GitHub Pages (static files only).
- **Runtime network use:** none after the first load, except opening the
  import link itself. No API calls, no keys, no tracking.

## Core rules

- **Codec:** `?data=` carries JSON as gzip → base64url. Use the browser's
  `CompressionStream` / `DecompressionStream`. Provide the reverse direction
  (JSON → link) for sample links and tests.
- **Validation:** every payload must have top-level `type` and
  `schemaVersion`. Validate against the per-app schema; show the reason and
  refuse invalid data — never import it silently.
- **Storage:** IndexedDB, one store per app, behind a thin hand-written
  Promise wrapper. No external libraries.
- **Separation for testability:** the codec and validation modules must not
  touch the DOM, so they can be imported by both the browser and Node.
  Tests run with `node --test`.
- **Playback:** browser built-in TTS (`speechSynthesis`) only. Item-by-item
  playback, continuous playback, speeds 0.75 / 1.0 / 1.25.

## Kiro usage (this is part of the deliverable)

- Write steering and specs **before** implementation. Kiro implements from
  the spec; never the reverse order — the `/.kiro` trail is judged under
  Technological Implementation (20%).
- **Property-based test (at least 1):** the codec. Properties: any valid JSON
  round-trips through encode → decode unchanged; any corrupt input is always
  rejected by validation.
- **Agent hook (at least 1):** configure one real hook in Kiro (e.g. run
  tests on save) and record only what was actually configured. Do not claim
  a hook that was never set up.
- In the submission text, describe only Kiro features actually used, with
  concrete examples (spec-driven flow, steering, hooks, property test).

## Constraints carried from the execution sheet

- No AI/LLM API inside the app. Generation always happens outside, in the
  user's own AI chat following a public instruction sheet.
- No code reuse from Sokqa / Personal Dashboard.
- `/.kiro` lives at the repo root and is never gitignored. MIT LICENSE at
  the root in a form GitHub detects.
