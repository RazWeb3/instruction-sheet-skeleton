import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync, gunzipSync } from 'node:zlib';
import { encodePayload, decodePayload, CodecError } from './codec.js';

// Small deterministic PRNG (mulberry32) so failures are reproducible.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHARS = ['a', 'Z', '0', ' ', '"', '\\', '\n', '/', '+', '=', 'é', '日', '本', '😀', '\u0000'];

function genString(r) {
  const len = Math.floor(r() * 12);
  let s = '';
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(r() * CHARS.length)];
  return s;
}

function genJson(r, depth = 0) {
  const k = Math.floor(r() * (depth > 3 ? 5 : 7));
  switch (k) {
    case 0: return null;
    case 1: return r() < 0.5;
    case 2: return Math.round((r() - 0.5) * 1e6) / 100;
    case 3: return Math.floor(r() * 2 ** 31) - 2 ** 30;
    case 4: return genString(r);
    case 5: return Array.from({ length: Math.floor(r() * 5) }, () => genJson(r, depth + 1));
    default: {
      const o = {};
      const n = Math.floor(r() * 5);
      for (let i = 0; i < n; i++) o[genString(r) || `k${i}`] = genJson(r, depth + 1);
      return o;
    }
  }
}

const RUNS = 300;

async function rejects(input) {
  await assert.rejects(() => decodePayload(input), (e) => {
    assert.ok(e instanceof CodecError, `expected CodecError, got ${e}`);
    assert.ok(e.reason && e.reason.length > 0);
    return true;
  });
}

test('property: any JSON value round-trips unchanged', async () => {
  const r = rng(12345);
  for (let i = 0; i < RUNS; i++) {
    const value = genJson(r);
    const link = await encodePayload(value);
    assert.match(link, /^[A-Za-z0-9_-]+$/, 'must be URL-safe without padding');
    assert.deepEqual(await decodePayload(link), value);
  }
});

test('property: truncated links are always rejected', async () => {
  const r = rng(777);
  for (let i = 0; i < RUNS; i++) {
    const link = await encodePayload(genJson(r));
    const cut = Math.floor(r() * link.length); // strictly shorter
    await rejects(link.slice(0, cut));
  }
});

test('property: strings with characters outside base64url are always rejected', async () => {
  const r = rng(99);
  const bad = ['+', '/', '=', ' ', '%', '!', 'é', '\n'];
  for (let i = 0; i < RUNS; i++) {
    const link = await encodePayload(genJson(r));
    const at = Math.floor(r() * (link.length + 1));
    const ch = bad[Math.floor(r() * bad.length)];
    await rejects(link.slice(0, at) + ch + link.slice(at));
  }
});

test('property: random bytes (not gzip) are always rejected', async () => {
  const r = rng(2024);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  for (let i = 0; i < RUNS; i++) {
    const len = 1 + Math.floor(r() * 60);
    let s = '';
    for (let j = 0; j < len; j++) s += alphabet[Math.floor(r() * alphabet.length)];
    // A random string is gzip only if it starts with the magic 1f 8b ("H4s"); skip that.
    if (s.startsWith('H4s')) continue;
    await rejects(s);
  }
});

test('valid gzip that is not JSON is rejected', async () => {
  const link = gzipSync(Buffer.from('not json {')).toString('base64url');
  await rejects(link);
});

test('empty and non-string input is rejected', async () => {
  await rejects('');
  await rejects(undefined);
  await rejects(null);
  await rejects(42);
});

test('encodePayload output is deterministic-decodable for unicode', async () => {
  const value = { title: '日本語のタイトル 😀', items: ['a/b+c=d'] };
  assert.deepEqual(await decodePayload(await encodePayload(value)), value);
});

test('interoperates with standard gzip + base64url', async () => {
  const value = { type: 'x', schemaVersion: 1 };
  const link = gzipSync(Buffer.from(JSON.stringify(value))).toString('base64url');
  assert.deepEqual(await decodePayload(link), value);
  const ours = await encodePayload(value);
  assert.deepEqual(JSON.parse(gunzipSync(Buffer.from(ours, 'base64url')).toString()), value);
});
