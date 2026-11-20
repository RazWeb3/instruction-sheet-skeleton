# Core: Instruction-Sheet Skeleton

You are an AI chat assistant. This document is the core of the
Instruction-Sheet Skeleton. Read it first, then read the instruction
sheet for the data type you are asked to make. Any AI chat can do this
work. The apps never call an AI service; everything happens in this chat
and in the user's browser.

## 1. The model

The skeleton is a set of small web apps that share one core. Each app
handles one data type. For each data type there is one instruction sheet
that tells an AI chat how to create data for it.

- You (the AI chat) create the data as JSON, following the sheet.
- You hand the user a single import link that carries the data.
- The user opens the link; the app stores the data in the browser's
  local storage and works entirely on the device.
- No accounts, no server, no tracking. Nothing is uploaded anywhere.

## 2. The envelope

Every payload is one JSON object with these shared rules:

- `type` (string, required): the data type, exactly as its sheet names it.
- `schemaVersion` (number, required): currently always `1`.
- Each sheet defines the remaining fields, which are required, and their
  defaults.
- Fields a sheet does not define are preserved by the apps, never
  stripped. A sheet may rely on this for optional extras.

## 3. The codec

An import link is the app's URL plus `?data=` plus the payload encoded
as follows:

1. Serialize the JSON object as UTF-8 text.
2. Compress it with gzip.
3. Encode the bytes as base64url: the URL-safe alphabet (`-` and `_`
   instead of `+` and `/`), with no `=` padding.
4. Append the result to the app URL from the sheet:
   `<app URL>?data=<encoded>`

```python
import base64, gzip, json

payload = { ... }  # the object you built from the sheet
raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
data = base64.urlsafe_b64encode(gzip.compress(raw)).rstrip(b"=").decode("ascii")
print(APP_URL + "?data=" + data)  # APP_URL comes from the sheet
```

One link carries one payload. If the user imports a payload whose title
matches an entry they already have, the app replaces that entry.

## 4. How to deliver the link

- Present the import link as a tappable anchor or button with a short
  human label (for example, the payload's title). Never paste the bare
  encoded string into prose as plain text.
- If your environment cannot produce anchors, also attach the link as a
  plain text file, and state the link's total length and its last few
  characters, so the user can tell if it was truncated.
- If the app reports that the import failed, it shows the reasons. Fix
  the JSON against the sheet's schema and regenerate the link. Never
  change the codec to work around a data problem.

## 5. Data types

| type | app | app URL | instruction sheet |
| --- | --- | --- | --- |
| `listening-pack` | Pack Player | https://razweb3.github.io/instruction-sheet-skeleton/apps/player/ | https://razweb3.github.io/instruction-sheet-skeleton/instructions/player.md |
| `memory-board` | Memory Board | https://razweb3.github.io/instruction-sheet-skeleton/apps/board/ | https://razweb3.github.io/instruction-sheet-skeleton/instructions/board.md |

## 6. Compatibility with Sokqa

Pack Player also accepts document packs from Sokqa, the author's
production learning app (payload `type`: `"document"`). Sokqa imports
packs through `https://convly.jp/import?data=` using the same codec as
section 3, so a Sokqa document pack travels between Sokqa and this
skeleton unchanged. When the destination is Sokqa itself, the link's
host must be `convly.jp`; when it is Pack Player, use the app URL above.

## 7. Adding a new data type

A new instruction sheet must state:

- the `type` name and `schemaVersion`,
- every field: required or optional, with defaults,
- content guidance, with one minimal complete example,
- the app URL the data is for,
- a link step that uses this core's codec unchanged.

Building the app side (a validator and a renderer for the new type) is
separate work. The codec, the envelope, and local storage do not change
per data type — that stability is the point of the skeleton.
