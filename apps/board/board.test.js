import test from 'node:test';
import assert from 'node:assert/strict';
import { sortCards, collectTags, filterByTag, buildMemo } from './board.js';

const cards = [
  { heading: 'none', body: 'b' },
  { heading: 'old', body: 'b', tag: 'habit', updatedAt: '2026-01-01T00:00:00Z' },
  { heading: 'new', body: 'b', tag: 'food', updatedAt: '2026-11-11T00:00:00Z' },
  { heading: 'none2', body: 'b', tag: 'habit' },
];

test('sorts newest first, missing updatedAt last in original order', () => {
  assert.deepEqual(sortCards(cards).map((c) => c.heading), ['new', 'old', 'none', 'none2']);
});

test('unparseable updatedAt is treated as missing', () => {
  const out = sortCards([{ heading: 'x', body: 'b', updatedAt: 'nope' }, cards[1]]);
  assert.deepEqual(out.map((c) => c.heading), ['old', 'x']);
});

test('does not mutate the input', () => {
  const copy = [...cards];
  sortCards(cards);
  assert.deepEqual(cards, copy);
});

test('collects distinct tags and filters by tag', () => {
  assert.deepEqual(collectTags(cards), ['habit', 'food']);
  assert.deepEqual(filterByTag(cards, 'habit').map((c) => c.heading), ['old', 'none2']);
  assert.equal(filterByTag(cards, null).length, 4);
});

test('memo lists title and cards only', () => {
  const memo = buildMemo({ title: 'About Aki', cards: [cards[1], cards[0]] });
  assert.equal(memo, 'Board: About Aki\n- [habit] old: b\n- none: b\n');
});

test('memo works for a board without cards', () => {
  assert.equal(buildMemo({ title: 'Empty' }), 'Board: Empty\n');
});
