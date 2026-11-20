# Design: Core round

## instructions/core.md (new)
AI-facing, English, in the voice of the existing sheets ("You are an AI
chat assistant..."). Sections:
1. What this is — the model: small local web apps + one instruction sheet
   per data type; the apps never call an AI service; generation happens in
   the user's own AI chat; data travels in a link and lives only in the
   browser's local storage. No accounts, no server, no tracking.
2. How to use it — read this core, then the sheet for the data type you
   are making (index in section 7). The sheet defines the fields; this
   core defines everything shared.
3. The envelope — payload is a JSON object; `type` and `schemaVersion`
   (currently 1) are always required; each sheet defines the rest;
   unknown fields are preserved by the apps, never stripped.
4. The codec — UTF-8 JSON -> gzip -> base64url (URL-safe alphabet, no `=`
   padding); import link = the app URL + `?data=` + the encoded string.
   Includes the same Python snippet the sheets carry today (moved here,
   not duplicated). One link carries one payload; importing a payload
   whose title matches an existing entry replaces that entry.
5. Delivery rules — present the import link as a tappable anchor or
   button with a short human label, never as a bare encoded string in
   prose; if the environment cannot produce anchors, also attach the
   link as a plain .txt file and state the link's length and ending, so
   truncation is detectable.
6. If import fails — the app reports reasons; fix the JSON against the
   sheet's schema and regenerate the link. Do not change the codec.
7. Index of data types — table: type / app / app URL / sheet URL.
   listening-pack -> Pack Player; memory-board -> Memory Board.
8. Compatibility — Pack Player also accepts Sokqa document packs
   (type "document"). Sokqa, the author's production app, imports packs
   through https://convly.jp/import?data= using the same codec, so a
   Sokqa document pack travels between Sokqa and this skeleton.
9. Adding a new data type — a new sheet must state: the type name and
   schemaVersion, required/optional fields with defaults, content
   guidance with one minimal example, the app URL, and a link step that
   uses this core's codec unchanged. App-side work (validator + renderer)
   is separate; the core codec and storage do not change per type.

## Sheet refactor (player.md / board.md)
- Opening gains: "First read the core: <core.md URL>. This sheet defines
  only what is specific to this data type."
- Remove the numbered codec steps and the Python snippet; the link step
  becomes one short paragraph referencing core section 4 and giving this
  app's URL.
- Keep: schema, field guidance (including note and speakText for the
  player), content guidance, minimal example, failure notes specific to
  the type.

## Landing (index.html)
- Instruction-sheet anchors: href changes from the github.com blob URL to
  the raw Pages URL (…/instructions/player.md, …/instructions/board.md);
  label gains "(for your AI chat)".
- Add one anchor to …/instructions/core.md in the steps area, labelled
  "Start with the core sheet".
- No layout or CSS changes; existing classes only.

## README.md
- Add the core.md link near the top (anchor text, Pages URL).
- Check the whole file for bare URLs and convert to anchors.

## Untouched
core/, apps/ (JS/CSS), theme.css, landing.css, samples/, tests.
Test expectation: `node --test` still 61/61.
