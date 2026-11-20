import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDocumentPack, speechFor, pickVoice } from './normalize.js';
import { validatePayload } from '../../core/validate.js';

const pack = () => ({
  type: 'document',
  schemaVersion: 1,
  title: 'T',
  language: 'fr-FR',
  documents: [
    { id: 'a', text: 'Bonjour' },
    { id: 'b', text: 'Un cafe', tts: { text: 'Un café', textLanguage: 'fr-CA', audioUrl: 'http://x/a.mp3', audioPath: 'a.mp3' } },
    { id: 'c', text: 'Merci', tts: { audioUrl: 'http://x/c.mp3' } },
  ],
});

test('one section per document with 1-based headings; title and lang mapped', () => {
  const n = normalizeDocumentPack(pack());
  assert.equal(n.title, 'T');
  assert.equal(n.lang, 'fr-FR');
  assert.deepEqual(n.sections.map((s) => s.heading), ['Section 1', 'Section 2', 'Section 3']);
  assert.deepEqual(n.sections.map((s) => s.items.map((i) => i.text)), [['Bonjour'], ['Un cafe'], ['Merci']]);
});

test('tts.text / tts.textLanguage become speak text / lang; audio fields are dropped', () => {
  const n = normalizeDocumentPack(pack());
  assert.deepEqual(n.sections[0].items[0], { text: 'Bonjour' });
  assert.deepEqual(n.sections[1].items[0], { text: 'Un cafe', speakText: 'Un café', speakLang: 'fr-CA' });
  assert.deepEqual(n.sections[2].items[0], { text: 'Merci' });
  assert.ok(!JSON.stringify(n).includes('audio'));
});

test('normalized pack carries source: "document"', () => {
  assert.equal(normalizeDocumentPack(pack()).source, 'document');
});
test('normalized output is a valid listening-pack', () => {
  assert.equal(validatePayload(normalizeDocumentPack(pack())).ok, true);
});

test('speechFor: speak text wins, falls back to display text and pack lang', () => {
  const n = normalizeDocumentPack(pack());
  assert.deepEqual(speechFor(n, n.sections[0].items[0]), { text: 'Bonjour', lang: 'fr-FR' });
  assert.deepEqual(speechFor(n, n.sections[1].items[0]), { text: 'Un café', lang: 'fr-CA' });
  assert.deepEqual(speechFor({ title: 'x' }, { text: 'a' }), { text: 'a', lang: 'en-US' });
});

const voice = (name, lang, def = false) => ({ name, lang, default: def });

test('pickVoice prefers a Google voice', () => {
  const v = [voice('Microsoft Haruka', 'ja-JP', true), voice('Google Japanese', 'ja-JP')];
  assert.equal(pickVoice(v, 'ja-JP').name, 'Google Japanese');
});

test('pickVoice falls back to the default voice, then the first match', () => {
  const a = [voice('A', 'en-US'), voice('B', 'en-US', true)];
  assert.equal(pickVoice(a, 'en-US').name, 'B');
  const b = [voice('A', 'en-US'), voice('B', 'en-US')];
  assert.equal(pickVoice(b, 'en-US').name, 'A');
});

test('pickVoice matches on the primary subtag and prefers an exact match', () => {
  const v = [voice('Google UK English', 'en-GB'), voice('Plain US', 'en-US')];
  assert.equal(pickVoice(v, 'en-US').name, 'Plain US');
  assert.equal(pickVoice(v, 'en-AU').name, 'Google UK English');
  assert.equal(pickVoice([voice('Plain US', 'en-US')], 'en').name, 'Plain US');
});

test('pickVoice returns null for no match or an empty list', () => {
  assert.equal(pickVoice([voice('A', 'fr-FR')], 'ja-JP'), null);
  assert.equal(pickVoice([], 'en-US'), null);
  assert.equal(pickVoice(undefined, 'en-US'), null);
});
