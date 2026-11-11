# Product Steering — Instruction-Sheet Skeleton (Kiroween 2026, Skeleton Crew)

## What this is

A thin, reusable skeleton that Raz proved with Sokqa and Personal Dashboard:
a **public AI instruction sheet + import link + a fully local, on-device web app**.
This project rebuilds that pattern from scratch with Kiro as one shared core
plus two small apps that use it. It is not a clone of Sokqa or Personal
Dashboard — only the idea and the data-format thinking carry over; all code
is new (reusing their code would violate the hackathon's new-project rule).

## The two apps

1. **Pack Player** — a minimal web version of Sokqa's listening-pack flow.
   An AI chat reads a public instruction sheet, generates a listening pack,
   and the user opens an import link to save and play it in the browser.
2. **Memory Board** — a minimal version of Personal Dashboard. An AI chat
   reads its instruction sheet, generates a board of cards, and the user
   imports it the same way.

Both apps share the same core: decode `?data=`, validate, save to IndexedDB,
show it. One skeleton, many apps — that is the point to demonstrate.

## Who it is for

Anyone whose AI chat can generate structured data but who has nowhere to
keep using it after the chat ends. The user pastes an instruction-sheet URL
into their own AI chat; the app itself never calls any AI or LLM API.

## Non-goals (do not build these)

- No in-app AI/LLM integration, no API keys, no server, no tracking.
- No accounts, no sync, no cloud storage. Data lives in the user's browser.
- No audio files, no cloud voices. Playback is the browser's built-in TTS only.
- No features beyond the execution sheet §3. Scope is frozen: core = 4
  functions only; each app = one screen, read-focused.

## Success criteria (Step 1, Nov 12–16)

Both apps complete one full loop: instruction sheet → AI generates data →
import link → app saves it → user can use it (play / browse). Verified in a
fresh browser profile, not just the developer's own.

## Tone and language

- All shipped artefacts are in English (README, Devpost text, video, specs).
- Instruction sheets must not name a specific AI. They work with any AI chat.
- Sample data is fictional. Never use Raz's real personal-memory data in
  the board sample.
