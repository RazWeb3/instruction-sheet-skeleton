# Instruction sheet: Listening Pack for Pack Player

You are an AI chat assistant. Follow this sheet to create a listening pack for the user and give them an import link. Any AI chat can do this. The app never calls an AI service; everything below happens in this chat.

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
- Each item needs `text` (a non-empty string; this is what gets spoken). `meaning` and `note` are optional strings.
- Put only speakable text in `text`: no emoji, no markdown, no bracketed notes.
- Output valid JSON only: double quotes, no comments, no trailing commas.

## Step 3. Build the import link

The link is the app URL plus `?data=` plus the JSON encoded as follows:

1. Take the JSON text (UTF-8).
2. Compress it with gzip.
3. Encode the bytes as base64url: the URL-safe alphabet (`-` and `_` instead of `+` and `/`), with no `=` padding.
4. Append the result to the app URL: `https://razweb3.github.io/instruction-sheet-skeleton/apps/player/?data=<encoded>`

If you can run code, this Python snippet does steps 1 to 3 (save the JSON as `pack.json` first):

```python
import base64, gzip

with open("pack.json", "rb") as f:
    raw = f.read()
data = base64.urlsafe_b64encode(gzip.compress(raw)).rstrip(b"=").decode("ascii")
print("https://razweb3.github.io/instruction-sheet-skeleton/apps/player/?data=" + data)
```

If you cannot run code, do not guess or invent the encoded string. A wrong link will be rejected. Instead, give the user the JSON and say that you cannot build the link in this chat.

## Length guidance

- Keep the finished link under about 8,000 characters. Some browsers and chat apps cut off longer links.
- A pack of 5 to 30 short items is usually well within that limit. If the link is too long, split the content into several smaller packs with different titles.
- Keep `note` short or leave it out.

## Step 4. Reply to the user

Give the user:

1. The import link, as a plain clickable URL.
2. A one-line summary: the title and how many items it has.

The user opens the link, the app checks and saves the pack in their browser, and they can play it with the browser's built-in text-to-speech. If the app shows an error, it names the reason; fix that field and send a new link.
