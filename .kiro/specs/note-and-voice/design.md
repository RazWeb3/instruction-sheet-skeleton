# Design — Note display + voice preference

## Note rendering (apps/player/app.js, style.css)

- In `renderListening`, after the text span and before the meaning span,
  append `h('span', { class: 'note' }, item.note)` when
  `typeof item.note === 'string' && item.note.trim() !== ''`.
- style.css: `.item .note { display: block; color: var(--ink-soft); font-size: 1rem; }`
  (between the 1.1rem text and the 0.95rem meaning). No other style change.

## Voice preference (apps/player/normalize.js, app.js)

`pickVoice(voices, lang)` — pure, exported from normalize.js next to
`speechFor`:

```
const primary = (l) => (l || '').toLowerCase().split('-')[0];
matches = voices.filter(v => v.lang && primary(v.lang) === primary(lang));
exact = matches.filter(v => v.lang.toLowerCase() === lang.toLowerCase());
pool = exact.length ? exact : matches;
return pool.find(v => /google/i.test(v.name)) ?? pool.find(v => v.default) ?? pool[0] ?? null;
```

In `speak()` (app.js): after setting lang and rate,
`const voice = pickVoice(speechSynthesis.getVoices(), lang); if (voice) u.voice = voice;`
Wrapped so any error leaves the voice unset.

## Instruction sheet

`instructions/player.md`: add `note` to the item field list as the optional
reading/pronunciation line (shown under the text, never spoken), with one
line of guidance: include it when the audience cannot read the script of
`text` (e.g. romaji for Japanese phrases aimed at English speakers).

## Out of scope

- No core changes. No document-view change (documents have no per-item
  note). No voice settings UI. No change to speeds or repeat/progress.
