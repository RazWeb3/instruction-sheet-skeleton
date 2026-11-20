// Normalize a Sokqa document pack into the player's own model. DOM-free.
// Audio fields (tts.audioUrl / tts.audioPath) are deliberately dropped: web playback is TTS-only.

const present = (v) => (typeof v === 'string' && v.trim() ? v : undefined);

/** Convert a validated `document` payload into a listening-pack-shaped payload. */
export function normalizeDocumentPack(pack) {
  return {
    type: 'listening-pack',
    schemaVersion: 1,
    source: 'document', // selects the document reading view; packs without it render as listening packs
    title: pack.title,
    lang: pack.language,
    sections: pack.documents.map((doc, i) => {
      const item = { text: doc.text };
      const speakText = present(doc.tts?.text);
      const speakLang = present(doc.tts?.textLanguage);
      if (speakText) item.speakText = speakText;
      if (speakLang) item.speakLang = speakLang;
      return { heading: `Section ${i + 1}`, items: [item] };
    }),
  };
}

/** What to speak for an item: speak text wins over display text; speak lang over pack lang. */
export function speechFor(pack, item) {
  return { text: item.speakText ?? item.text, lang: item.speakLang ?? pack.lang ?? 'en-US' };
}

const primaryTag = (l) => (l || '').toLowerCase().split('-')[0];

/** Pick the preferred voice for a language: Google, then browser default, then first match. Pure. */
export function pickVoice(voices, lang) {
  if (!Array.isArray(voices) || !lang) return null;
  const matches = voices.filter((v) => v && v.lang && primaryTag(v.lang) === primaryTag(lang));
  const exact = matches.filter((v) => v.lang.toLowerCase() === lang.toLowerCase());
  const pool = exact.length ? exact : matches;
  return pool.find((v) => /google/i.test(v.name)) ?? pool.find((v) => v.default) ?? pool[0] ?? null;
}
