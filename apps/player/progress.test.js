import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countItems, loadProgress, saveProgress, clearProgress, newRecord, markStarted, markFinished,
  reconcile, isResumable, isPlayed, nextRepeatMode, resolveNext, loadSpeed, saveSpeed,
} from './progress.js';

function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    keys: () => [...m.keys()],
  };
}

test('countItems flattens sections; non-packs count 0', () => {
  assert.equal(countItems({ sections: [{ items: [1, 2] }, { items: [3] }] }), 3);
  assert.equal(countItems({}), 0);
  assert.equal(countItems(undefined), 0);
});

test('save / load round-trip under the player-progress: key, with updatedAt', () => {
  const s = memoryStorage();
  const saved = saveProgress(s, 'Pack A', markStarted(newRecord(5), 2, 5));
  assert.deepEqual(s.keys(), ['player-progress:Pack A']);
  assert.ok(saved.updatedAt);
  const loaded = loadProgress(s, 'Pack A');
  assert.equal(loaded.index, 2);
  assert.deepEqual(loaded.played, [2]);
  assert.equal(loaded.finished, false);
  assert.equal(loaded.count, 5);
});

test('no record, malformed JSON and wrong shape all load as null', () => {
  const s = memoryStorage();
  assert.equal(loadProgress(s, 'x'), null);
  s.setItem('player-progress:x', '{nope');
  assert.equal(loadProgress(s, 'x'), null);
  s.setItem('player-progress:x', JSON.stringify({ index: 'a', played: [], finished: false, count: 1 }));
  assert.equal(loadProgress(s, 'x'), null);
});

test('clearProgress removes only that pack', () => {
  const s = memoryStorage();
  saveProgress(s, 'a', newRecord(1));
  saveProgress(s, 'b', newRecord(1));
  clearProgress(s, 'a');
  assert.equal(loadProgress(s, 'a'), null);
  assert.ok(loadProgress(s, 'b'));
});

test('markStarted sets the resume point and accumulates played indices in order', () => {
  let r = markStarted(null, 3, 6);
  r = markStarted(r, 1, 6);
  r = markStarted(r, 3, 6);
  assert.equal(r.index, 3);
  assert.deepEqual(r.played, [1, 3]);
});

test('markFinished sets finished, clears the resume point, keeps played full', () => {
  const r = markFinished(markStarted(null, 1, 3), 3);
  assert.equal(r.finished, true);
  assert.equal(r.index, null);
  assert.deepEqual(r.played, [0, 1, 2]);
  assert.equal(isResumable(r), false);
});

test('isResumable needs a resume point and an unfinished pack', () => {
  assert.equal(isResumable(null), false);
  assert.equal(isResumable(newRecord(3)), false);
  assert.equal(isResumable(markStarted(null, 0, 3)), true);
});

test('count mismatch resets the record on re-import; same count keeps it', () => {
  const r = markStarted(null, 2, 5);
  assert.equal(reconcile(r, 5), r);
  assert.equal(reconcile(r, 6), null);
  assert.equal(reconcile(null, 5), null);
  assert.deepEqual(markStarted(r, 0, 7).played, [0]); // stale record is dropped by markStarted too
});

test('isPlayed: before the resume point or played earlier; the resume item itself is not marked', () => {
  const r = { index: 3, played: [0, 1, 2, 3, 5], finished: false, count: 8 };
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((i) => isPlayed(r, i)), [true, true, true, false, false, true, false]);
  assert.equal(isPlayed(markFinished(r, 8), 7), true);
  assert.equal(isPlayed(null, 0), false);
});

test('repeat mode cycles off -> block -> all -> off', () => {
  assert.equal(nextRepeatMode('off'), 'block');
  assert.equal(nextRepeatMode('block'), 'all');
  assert.equal(nextRepeatMode('all'), 'off');
});

test('resolveNext: block replays; all wraps after the last; off finishes after the last', () => {
  assert.deepEqual(resolveNext('block', 2, 5, true), { action: 'play', index: 2 });
  assert.deepEqual(resolveNext('block', 4, 5, false), { action: 'play', index: 4 });
  assert.deepEqual(resolveNext('all', 4, 5, true), { action: 'play', index: 0 });
  assert.deepEqual(resolveNext('off', 4, 5, true), { action: 'finish' });
  assert.deepEqual(resolveNext('off', 4, 5, false), { action: 'finish' });
});

test('resolveNext: before the last, a chained session continues and a single item stops', () => {
  assert.deepEqual(resolveNext('off', 1, 5, true), { action: 'play', index: 2 });
  assert.deepEqual(resolveNext('all', 1, 5, true), { action: 'play', index: 2 });
  assert.deepEqual(resolveNext('off', 1, 5, false), { action: 'stop' });
  assert.deepEqual(resolveNext('all', 1, 5, false), { action: 'stop' });
});

test('speed: defaults to 1, restores a saved offered value, ignores junk', () => {
  const s = memoryStorage();
  assert.equal(loadSpeed(s), 1);
  saveSpeed(s, 1.25);
  assert.equal(s.getItem('player-speed'), '1.25');
  assert.equal(loadSpeed(s), 1.25);
  s.setItem('player-speed', '3');
  assert.equal(loadSpeed(s), 1);
  s.setItem('player-speed', 'fast');
  assert.equal(loadSpeed(s), 1);
});

test('storage that throws never breaks loading or saving', () => {
  const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  assert.equal(loadProgress(bad, 'a'), null);
  assert.doesNotThrow(() => saveProgress(bad, 'a', newRecord(1)));
  assert.doesNotThrow(() => clearProgress(bad, 'a'));
  assert.equal(loadSpeed(bad), 1);
  assert.doesNotThrow(() => saveSpeed(bad, 1.25));
});
