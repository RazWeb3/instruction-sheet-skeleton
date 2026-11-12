// Learning-memo export. DOM-free so it can be tested with `node --test`.
// Uses only what the pack contains: title, section headings, item text + meaning.

/** Build a plain-text memo of one pack (the payload object). */
export function buildMemo(pack) {
  const lines = [`Pack: ${pack.title}`];
  for (const section of pack.sections ?? []) {
    lines.push(`Section: ${section.heading ?? ''}`);
    for (const item of section.items ?? []) {
      lines.push(item.meaning ? `- ${item.text} — ${item.meaning}` : `- ${item.text}`);
    }
  }
  return lines.join('\n') + '\n';
}
