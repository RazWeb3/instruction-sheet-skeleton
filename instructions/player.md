# Instruction sheet: Listening Pack for Pack Player

You are an AI chat assistant. Follow this sheet to create a listening pack for the user and give them an import link. Any AI chat can do this. The app never calls an AI service; everything below happens in this chat.

First read the core: <https://razweb3.github.io/instruction-sheet-skeleton/instructions/core.md>. This sheet defines only what is specific to this data type.

App URL: `https://razweb3.github.io/instruction-sheet-skeleton/apps/player/`

## Step 1. Ask the user (briefly)

- Topic or theme (for example, "fruits", "airport phrases").
- Language to be spoken (default: English, `en-US`). Use a BCP 47 code such as `en-US`, `en-GB`, `fr-FR`, `ja-JP`.
- The language for the `meaning` field (for example, Japanese).
- How many items. If the user does not say, use 5 to 20 items.

## Step 2. Write the pack as JSON

```json
{
  "type": "listening-pack",
  "schemaVersion": 1,
  "title": "Fruits",
  "lang": "en-US",
  "sections": [
    {
      "heading": "Common fruits",
      "items": [
        { "text": "apple", "meaning": "りんご", "note": "an apple a day" }
      ]
    }
  ]
}
```

Rules:

- `type` must be exactly `"listening-pack"` and `schemaVersion` must be the number `1`.
- `title` is required, a non-empty string. Importing the same title again replaces the earlier pack.
- `lang` is optional (default `"en-US"`). It is the language the text is spoken in.
- `sections` is an array. Each section has a non-empty `heading` and an `items` array.
- Each item needs `text` (a non-empty string; this is what gets spoken). `meaning` and `note` are optional strings. `note` is the optional reading / pronunciation line. It is shown under the text and is never spoken. Include it when the audience cannot read the script of `text` (for example, romaji for Japanese phrases aimed at English speakers).
- Put only speakable text in `text`: no emoji, no markdown, no bracketed notes.
- Output valid JSON only: double quotes, no comments, no trailing commas.

## Step 3. Build the import link

Build the link with the core's codec (core section 3, unchanged). This app's URL is `https://razweb3.github.io/instruction-sheet-skeleton/apps/player/`. If you cannot run code, do not guess or invent the encoded string; give the user the JSON and say that you cannot build the link in this chat.

## Sokqa document packs

The player also imports Sokqa document packs ("type": "document", "schemaVersion": 1) directly, using the same link steps. Each document becomes one section, and playback speaks `tts.text` when present, otherwise `text`. Audio fields are ignored; the web player uses the browser's text-to-speech only.

## Length guidance

- Keep the finished link under about 8,000 characters. Some browsers and chat apps cut off longer links.
- A pack of 5 to 30 short items is usually well within that limit. If the link is too long, split the content into several smaller packs with different titles.
- Keep `note` short or leave it out.

## Step 4. Reply to the user

Give the user:

1. The import link, as a tappable anchor or button with a short label (see core section 4).
2. A one-line summary: the title and how many items it has.

The user opens the link, the app checks and saves the pack in their browser, and they can play it with the browser's built-in text-to-speech. If the app shows an error, it names the reason; fix that field and send a new link.
