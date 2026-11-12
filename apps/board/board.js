// Memory Board logic. DOM-free so it can be tested with `node --test`.

/** Milliseconds for an ISO string, or null when absent or unparseable. */
function time(card) {
  if (typeof card.updatedAt !== 'string') return null;
  const t = Date.parse(card.updatedAt);
  return Number.isNaN(t) ? null : t;
}

/** Cards sorted by updatedAt descending; cards without a usable updatedAt go last (original order kept). */
export function sortCards(cards) {
  return cards
    .map((card, index) => ({ card, index, t: time(card) }))
    .sort((a, b) => {
      if (a.t === null && b.t === null) return a.index - b.index;
      if (a.t === null) return 1;
      if (b.t === null) return -1;
      return b.t - a.t || a.index - b.index;
    })
    .map((x) => x.card);
}

/** Distinct non-empty tags on the board, in order of first appearance. */
export function collectTags(cards) {
  const tags = [];
  for (const c of cards) {
    if (typeof c.tag === 'string' && c.tag.trim() && !tags.includes(c.tag)) tags.push(c.tag);
  }
  return tags;
}

/** Cards carrying the given tag; a null tag means "all". */
export function filterByTag(cards, tag) {
  return tag === null ? cards : cards.filter((c) => c.tag === tag);
}

/** Plain-text correction memo of one board. Uses only what the board contains. */
export function buildMemo(board) {
  const lines = [`Board: ${board.title}`];
  for (const c of board.cards ?? []) {
    lines.push(`- ${c.tag ? `[${c.tag}] ` : ''}${c.heading}: ${c.body}`);
  }
  return lines.join('\n') + '\n';
}
