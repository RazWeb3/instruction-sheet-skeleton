import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePayload } from './validate.js';

const pack = () => ({
  type: 'listening-pack',
  schemaVersion: 1,
  title: 'Cafe phrases',
  sections: [{ heading: 'Ordering', items: [{ text: 'A coffee, please.', meaning: 'x', note: 'y' }] }],
});
const board = () => ({
  type: 'memory-board',
  schemaVersion: 1,
  title: 'Trip',
  cards: [{ heading: 'Day 1', body: 'Arrive', tag: 'travel', updatedAt: '2026-01-01' }],
});

const fails = (obj, pattern) => {
  const r = validatePayload(obj);
  assert.equal(r.ok, false);
  assert.ok(r.reasons.some((m) => pattern.test(m)), `reasons: ${r.reasons.join(' | ')}`);
};

test('accepts valid listening-pack and memory-board', () => {
  const p = validatePayload(pack());
  assert.equal(p.ok, true);
  assert.equal(p.type, 'listening-pack');
  assert.equal(p.schemaVersion, 1);
  assert.equal(p.data.title, 'Cafe phrases');
  assert.equal(validatePayload(board()).ok, true);
});

test('optional fields may be omitted', () => {
  const p = pack();
  p.sections[0].items = [{ text: 'Hi' }];
  assert.equal(validatePayload(p).ok, true);
  const b = board();
  b.cards = [{ heading: 'h', body: 'b' }];
  assert.equal(validatePayload(b).ok, true);
});

test('rejects non-object payloads without throwing', () => {
  for (const v of [null, undefined, 1, 'x', [], true]) fails(v, /JSON object/);
});

test('rejects missing type / schemaVersion with named reasons', () => {
  const a = pack(); delete a.type;
  fails(a, /type is missing/);
  const b = pack(); delete b.schemaVersion;
  fails(b, /schemaVersion is missing/);
});

test('rejects unknown type and unsupported version', () => {
  fails({ ...pack(), type: 'other' }, /unknown type/);
  fails({ ...pack(), type: 'toString' }, /unknown type/);
  fails({ ...pack(), type: 5 }, /unknown type/);
  fails({ ...pack(), schemaVersion: 2 }, /unsupported schemaVersion/);
  fails({ ...pack(), schemaVersion: '1' }, /unsupported schemaVersion/);
});

test('listening-pack: required fields', () => {
  fails({ ...pack(), title: '' }, /title is required/);
  const noTitle = pack(); delete noTitle.title;
  fails(noTitle, /title is required/);
  fails({ ...pack(), sections: 'x' }, /sections is required/);
  fails({ ...pack(), sections: [{ items: [] }] }, /sections\[0\]\.heading/);
  fails({ ...pack(), sections: [{ heading: 'h' }] }, /sections\[0\]\.items/);
  fails({ ...pack(), sections: [{ heading: 'h', items: [{}] }] }, /items\[0\]\.text/);
  fails({ ...pack(), sections: [{ heading: 'h', items: [{ text: 'a', note: 3 }] }] }, /note must be a string/);
});

test('memory-board: required fields', () => {
  fails({ ...board(), title: undefined }, /title is required/);
  fails({ ...board(), cards: null }, /cards is required/);
  fails({ ...board(), cards: [{ body: 'b' }] }, /cards\[0\]\.heading/);
  fails({ ...board(), cards: [{ heading: 'h' }] }, /cards\[0\]\.body/);
  fails({ ...board(), cards: [{ heading: 'h', body: 'b', tag: 1 }] }, /tag must be a string/);
});

test('reports multiple reasons at once', () => {
  const r = validatePayload({ ...board(), title: '', cards: [{}] });
  assert.equal(r.ok, false);
  assert.ok(r.reasons.length >= 3);
});
