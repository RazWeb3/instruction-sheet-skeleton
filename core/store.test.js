import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as store from './store.js';

// IndexedDB is browser-only; real persistence is verified in the browser (task 4.2).
// These tests cover what runs before any IndexedDB access.

test('store exports exactly save / list / get / remove', () => {
  assert.deepEqual(Object.keys(store).sort(), ['get', 'list', 'remove', 'save']);
});

test('save rejects a payload without a title before touching IndexedDB', async () => {
  await assert.rejects(() => store.save('player', {}), /no title/);
  await assert.rejects(() => store.save('player', { title: '   ' }), /no title/);
});

test('unknown app name is rejected', async () => {
  await assert.rejects(() => store.list('other'), /Unknown app/);
});
