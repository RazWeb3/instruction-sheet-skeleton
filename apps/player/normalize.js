// Normalize a Sokqa document pack into the player's own model. DOM-free.
// Audio fields (tts.audioUrl / tts.audioPath) are deliberately dropped: web playback is TTS-only.

const present = (v) => (typeof v === 'string' && v.trim() ? v : undefined);

/** Convert a validated `document` payload into a listening-pack-shaped payload. */
export function normalizeDocumentPack(pack) {
  return {
    type: 'listening-pack',
    schemaVersion: 1,
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
