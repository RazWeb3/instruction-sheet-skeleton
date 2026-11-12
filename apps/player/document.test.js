import test from 'node:test';
import assert from 'node:assert/strict';
import { splitDocument, isDocumentPack, HEADING_MAX } from './document.js';

test('short first line becomes the heading and leaves the body; line breaks are preserved', () => {
  const r = splitDocument('Greetings\nHello there.\nHow are you?\n\nSee you.');
  assert.equal(r.heading, 'Greetings');
  assert.equal(r.body, 'Hello there.\nHow are you?\n\nSee you.');
});

test('a first line of exactly 40 characters is a heading; 41 is not', () => {
  const forty = 'a'.repeat(HEADING_MAX);
  assert.equal(HEADING_MAX, 40);
  assert.deepEqual(splitDocument(`${forty}\nbody`), { heading: forty, body: 'body' });
  const long = `${forty}b`;
  assert.deepEqual(splitDocument(`${long}\nbody`), { heading: null, body: `${long}\nbody` });
});

test('long first line: no heading, full text kept as the body', () => {
  const text = 'Good morning. Could I have a coffee, please? Thank you very much.\nSecond line.';
  assert.deepEqual(splitDocument(text), { heading: null, body: text });
});

test('single short line: it is the heading and the body is empty', () => {
  assert.deepEqual(splitDocument('Merci beaucoup'), { heading: 'Merci beaucoup', body: '' });
});

test('single long line: no heading, full text', () => {
  const text = 'x'.repeat(60);
  assert.deepEqual(splitDocument(text), { heading: null, body: text });
});

test('leading blank lines are skipped when finding the first line; CRLF is handled', () => {
  assert.deepEqual(splitDocument('\n\nTitle\r\nLine one\r\nLine two'), { heading: 'Title', body: 'Line one\nLine two' });
});

test('blank or non-string text has no heading', () => {
  assert.deepEqual(splitDocument('  \n '), { heading: null, body: '  \n ' });
  assert.deepEqual(splitDocument(undefined), { heading: null, body: '' });
});

test('isDocumentPack: only source "document"; absent or listening-pack flag renders as listening', () => {
  assert.equal(isDocumentPack({ source: 'document' }), true);
  assert.equal(isDocumentPack({}), false);
  assert.equal(isDocumentPack({ source: 'listening-pack' }), false);
  assert.equal(isDocumentPack(undefined), false);
});
