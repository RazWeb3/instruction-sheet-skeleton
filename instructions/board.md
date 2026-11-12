# Instruction sheet: Memory Board

You are an AI chat assistant. Follow this sheet to create a memory board for the user and give them an import link. Any AI chat can do this. The app never calls an AI service; everything below happens in this chat.

A memory board is a small set of cards about one subject (a person, a project, a place, a topic). The user reads the cards in the app and can filter them by tag.

Note: the sample board that ships with the app is about a fictional person ("Aki"). It is made-up example data and does not describe a real person. Use only what the user tells you in this chat; never invent facts about real people.

App URL: `https://razweb3.github.io/instruction-sheet-skeleton/apps/board/`

## Step 1. Ask the user (briefly)

- The subject of the board (who or what it is about).
- What the user wants to remember or keep track of.
- Optional: a few tag names to group cards (for example, `habit`, `food`, `work`). If the user has none, choose a few short ones yourself.
- Optional: roughly when each fact was last true or last updated.

Use only information the user gives you in this chat. If something is unknown, leave it out instead of guessing.

## Step 2. Write the board as JSON

```json
{
  "type": "memory-board",
  "schemaVersion": 1,
  "title": "About Aki (sample)",
  "cards": [
    {
      "heading": "Morning routine",
      "body": "Starts the day with a walk.",
      "tag": "habit",
      "updatedAt": "2026-11-11T00:00:00Z"
    }
  ]
}
```

Rules:

- `type` must be exactly `"memory-board"` and `schemaVersion` must be the number `1`.
- `title` is required, a non-empty string. Importing the same title again replaces the earlier board.
- `cards` is an array. Each card needs a non-empty `heading` and a non-empty `body`.
- `tag` is optional, a short string. Reuse the same spelling for cards that belong together, because the app filters by exact match.
- `updatedAt` is optional, an ISO 8601 date-time string such as `2026-11-11T00:00:00Z`. Cards are shown newest first; cards without `updatedAt` are shown last.
- Output valid JSON only: double quotes, no comments, no trailing commas.

## Step 3. Build the import link

The link is the app URL plus `?data=` plus the JSON encoded as follows:

1. Take the JSON text (UTF-8).
2. Compress it with gzip.
3. Encode the bytes as base64url: the URL-safe alphabet (`-` and `_` instead of `+` and `/`), with no `=` padding.
4. Append the result to the app URL: `https://razweb3.github.io/instruction-sheet-skeleton/apps/board/?data=<encoded>`

If you can run code, this Python snippet does steps 1 to 3 (save the JSON as `board.json` first):

```python
import base64, gzip

with open("board.json", "rb") as f:
    raw = f.read()
data = base64.urlsafe_b64encode(gzip.compress(raw)).rstrip(b"=").decode("ascii")
print("https://razweb3.github.io/instruction-sheet-skeleton/apps/board/?data=" + data)
```

If you cannot run code, do not guess or invent the encoded string. A wrong link will be rejected. Instead, give the user the JSON and say that you cannot build the link in this chat.

## Length guidance

- Keep the finished link under about 8,000 characters. Some browsers and chat apps cut off longer links.
- A board of 5 to 20 cards with one or two sentences each is usually well within that limit. If the link is too long, split the content into several smaller boards with different titles.
- Keep each `body` short.

## Step 4. Reply to the user

Give the user:

1. The import link, as a plain clickable URL.
2. A one-line summary: the title and how many cards it has.

The user opens the link, the app checks and saves the board in their browser, and they can browse it and filter by tag. If the app shows an error, it names the reason; fix that field and send a new link. To correct the board, the user can export a correction memo from the app and paste it back into this chat.
