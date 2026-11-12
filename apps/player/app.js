// Pack Player: one screen (list view + detail view) built on core/.
import { decodePayload, encodePayload } from '../../core/codec.js';
import { validatePayload } from '../../core/validate.js';
import * as store from '../../core/store.js';
import { showNotice, renderEmptyState, renderList } from '../../core/ui.js';
import { buildMemo } from './memo.js';
import { normalizeDocumentPack, speechFor } from './normalize.js';

const APP = 'player';
const SAMPLE_URL = '../../samples/player-sample.json';
const INSTRUCTION_URL = 'https://raw.githubusercontent.com/RazWeb3/instruction-sheet-skeleton/main/instructions/player.md';
const main = document.getElementById('main');
const speedSelect = document.getElementById('speed');

function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

// ---- Import: decode -> validate -> save -> notice ----
async function importData(data) {
  try {
    const obj = await decodePayload(data);
    const result = validatePayload(obj);
    if (!result.ok) throw new Error(result.reasons.join(' / '));
    if (result.type !== 'listening-pack' && result.type !== 'document') {
      throw new Error(`This link is for "${result.type}", not a listening pack.`);
    }
    // Sokqa document packs are stored in the player's own model.
    const pack = result.type === 'document' ? normalizeDocumentPack(result.data) : result.data;
    await store.save(APP, pack);
    return { ok: true, title: pack.title };
  } catch (err) {
    return { ok: false, reasons: err.reason ? [err.reason] : [err.message] };
  }
}

async function importSample() {
  try {
    const res = await fetch(SAMPLE_URL);
    if (!res.ok) throw new Error(`Could not load the sample (HTTP ${res.status}).`);
    const result = await importData(await encodePayload(await res.json()));
    announce(result);
  } catch (err) {
    announce({ ok: false, reasons: [err.message] });
  }
  await showList();
}

let pendingNotice = null;
function announce(result) {
  pendingNotice = result.ok
    ? { message: `Imported: ${result.title}`, kind: 'success' }
    : { message: ['Import failed. Nothing was saved.', ...result.reasons], kind: 'error' };
}
function flushNotice() {
  if (pendingNotice) showNotice(pendingNotice.message, pendingNotice.kind, main);
  pendingNotice = null;
}

// ---- Playback (speechSynthesis only) ----
let playToken = 0; // bumped on every stop/start so stale onend callbacks are ignored
let highlightEl = null;

function speed() {
  return Number(speedSelect.value);
}
function stopPlayback() {
  playToken++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  setHighlight(null);
}
function setHighlight(node) {
  highlightEl?.classList.remove('playing');
  highlightEl?.removeAttribute('aria-current');
  highlightEl = node;
  if (node) {
    node.classList.add('playing');
    node.setAttribute('aria-current', 'true');
  }
}
function speak(pack, item, onEnd) {
  const { text, lang } = speechFor(pack, item);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = speed();
  u.onend = onEnd;
  u.onerror = onEnd;
  speechSynthesis.speak(u);
}
function playOne(pack, item, node) {
  if (!('speechSynthesis' in window)) return showNotice('This browser has no speech synthesis.', 'error', main);
  stopPlayback();
  const token = playToken;
  setHighlight(node);
  speak(pack, item, () => {
    if (token === playToken) setHighlight(null);
  });
}
function playAll(pack, rows) {
  if (!('speechSynthesis' in window)) return showNotice('This browser has no speech synthesis.', 'error', main);
  stopPlayback();
  const token = playToken;
  let i = 0;
  const next = () => {
    if (token !== playToken) return;
    if (i >= rows.length) return setHighlight(null);
    const { item, node } = rows[i++];
    setHighlight(node);
    speak(pack, item, next);
  };
  next();
}

// ---- Views ----
async function showList() {
  stopPlayback();
  const entries = await store.list(APP);
  main.replaceChildren();
  flushNotice();
  if (entries.length === 0) {
    main.append(renderEmptyState(APP, importSample, INSTRUCTION_URL));
    return;
  }
  main.append(
    h('h2', {}, 'Your packs'),
    renderList(
      entries,
      (entry) => showDetail(entry.id),
      async (entry) => {
        await store.remove(APP, entry.id);
        await showList();
      },
    ),
  );
}

async function showDetail(id) {
  stopPlayback();
  const entry = await store.get(APP, id);
  if (!entry) return showList();
  const pack = entry.payload;
  main.replaceChildren();
  flushNotice();

  const rows = [];
  const body = h('div', {});
  for (const section of pack.sections) {
    body.append(h('h3', {}, section.heading));
    const ul = h('ul', { class: 'items' });
    for (const item of section.items) {
      const btn = h('button', { type: 'button', class: 'item' }, h('span', { class: 'text' }, item.text));
      if (item.meaning) btn.append(h('span', { class: 'meaning' }, item.meaning));
      btn.addEventListener('click', () => playOne(pack, item, btn));
      rows.push({ item, node: btn });
      ul.append(h('li', {}, btn));
    }
    body.append(ul);
  }

  const back = h('button', { type: 'button' }, 'Back');
  back.addEventListener('click', showList);
  const play = h('button', { type: 'button' }, 'Play all');
  play.addEventListener('click', () => playAll(pack, rows));
  const stop = h('button', { type: 'button' }, 'Stop');
  stop.addEventListener('click', stopPlayback);

  const memoOut = h('div', {});
  const exportBtn = h('button', { type: 'button' }, 'Export learning memo');
  exportBtn.addEventListener('click', () => {
    const area = h('textarea', { readonly: '', 'aria-label': 'Learning memo' });
    area.value = buildMemo(pack);
    const copy = h('button', { type: 'button' }, 'Copy');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(area.value);
        showNotice('Memo copied.', 'success', main);
      } catch {
        area.select();
      }
    });
    memoOut.replaceChildren(area, copy);
  });

  main.append(
    back,
    h('h2', {}, pack.title),
    h('div', { class: 'controls' }, play, stop),
    body,
    h('footer', {}, exportBtn, memoOut),
  );
}

// ---- Start ----
async function start() {
  const params = new URLSearchParams(location.search);
  const data = params.get('data');
  if (data) {
    announce(await importData(data));
    history.replaceState(null, '', location.pathname); // keep reloads from re-importing
  }
  await showList();
}
start();
