// Document reading view logic. DOM-free so it can be tested with `node --test`.
export const HEADING_MAX = 40;

/**
 * Split a document's text into a block heading and body.
 * The first non-empty line is the heading when it is HEADING_MAX characters or fewer and
 * leaves the body; otherwise there is no heading and the body is the full text.
 * Line breaks inside the body are preserved.
 */
export function splitDocument(text) {
  const full = typeof text === 'string' ? text : '';
  const lines = full.split(/\r\n|\r|\n/);
  const first = lines.findIndex((line) => line.trim() !== '');
  if (first === -1) return { heading: null, body: full };
  const line = lines[first].trim();
  if (line.length > HEADING_MAX) return { heading: null, body: full };
  const rest = lines.slice(first + 1);
  while (rest.length && rest[0].trim() === '') rest.shift();
  return { heading: line, body: rest.join('\n').trimEnd() };
}

/** Document packs carry source: "document"; anything else (including no flag) is a listening pack. */
export function isDocumentPack(pack) {
  return pack?.source === 'document';
}
