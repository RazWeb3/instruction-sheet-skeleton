// Pack Player: one screen (list view + detail view) built on core/.
import { decodePayload, encodePayload } from '../../core/codec.js';
import { validatePayload } from '../../core/validate.js';
import * as store from '../../core/store.js';
import { showNotice, renderEmptyState, renderList } from '../../core/ui.js';
import { buildMemo } from './memo.js';
import { normalizeDocumentPack, speechFor, pickVoice } from './normalize.js';
import { splitDocument, isDocumentPack } from './document.js';
import {
  countItems, loadProgress, saveProgress, clearProgress, newRecord, markStarted, markFinished,
  reconcile, isResumable, isPlayed, nextRepeatMode, resolveNext, loadSpeed, saveSpeed,
} from './progress.js';

const APP = 'player';
const SAMPLE_URL = '../../samples/player-sample.json';
const INSTRUCTION_URL = 'https://raw.githubusercontent.com/RazWeb3/instruction-sheet-skeleton/main/instructions/player.md';
const main = document.getElementById('main');
// Progress and speed live in localStorage (null when the browser blocks it; progress.js then does nothing).
const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();
// Speed selector lives in the playback bar; one element is kept so the chosen value survives view changes.
const speedSelect = h('select', { id: 'speed' });
for (const [value, label] of [['0.75', '0.75'], ['1', '1.0'], ['1.25', '1.25']]) {
  speedSelect.append(h('option', { value }, label));
}
speedSelect.value = String(loadSpeed(storage));
speedSelect.addEventListener('change', () => saveSpeed(storage, Number(speedSelect.value)));

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
    const id = await store.save(APP, pack);
    // Re-import replaces the pack: keep its progress only while the item/block count is unchanged.
    const old = loadProgress(storage, id);
    if (old && !reconcile(old, countItems(pack))) clearProgress(storage, id);
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
let repeatMode = 'off'; // 'off' | 'block' | 'all'
let view = null; // the detail view being shown: { id, pack, rows, progress, refresh }
let playingIndex = null; // index of the item/block being spoken, or null
let chained = false; // true while Play all / Resume is walking through the pack

function speed() {
  return Number(speedSelect.value);
}
function stopPlayback() {
  playToken++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  setHighlight(null);
  playingIndex = null;
  chained = false;
  view?.refresh();
}
function setHighlight(node) {
  highlightEl?.classList.remove('playing');
  highlightEl?.removeAttribute('aria-current');
  highlightEl = node;
  if (node) {
    node.classList.add('playing');
    node.setAttribute('aria-current', 'true');
    node.scrollIntoView?.({ block: 'nearest' }); // keep the playing item clear of the sticky bar
  }
}
function speak(pack, item, onEnd, onError) {
  const { text, lang } = speechFor(pack, item);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = speed();
  try {
    const voice = pickVoice(speechSynthesis.getVoices(), lang);
    if (voice) u.voice = voice;
  } catch {
    // leave the voice unset: playback must never depend on voice choice
  }
  u.onend = onEnd;
  u.onerror = onError;
  speechSynthesis.speak(u);
}
function persist(record) {
  view.progress = saveProgress(storage, view.id, record);
}
// Start item/block i without cancelling first (also used from onend, where nothing is speaking).
function begin(i, chain) {
  const token = ++playToken;
  playingIndex = i;
  chained = chain;
  persist(markStarted(view.progress, i, view.rows.length));
  setHighlight(view.rows[i].node);
  view.refresh();
  const { pack, rows } = view;
  const end = (errored) => () => {
    if (token !== playToken) return;
    // A speech error while repeating would loop forever, so it ends the session instead.
    if (errored && repeatMode !== 'off') return stopPlayback();
    const next = resolveNext(repeatMode, i, rows.length, chain);
    if (next.action === 'play') return begin(next.index, chain);
    if (next.action === 'finish') persist(markFinished(view.progress, rows.length));
    setHighlight(null);
    playingIndex = null;
    chained = false;
    view.refresh();
  };
  speak(pack, rows[i].item, end(false), end(true));
}
function playFrom(i, chain) {
  if (!view?.rows[i]) return;
  if (!('speechSynthesis' in window)) return showNotice('This browser has no speech synthesis.', 'error', main);
  stopPlayback();
  begin(i, chain);
}
function playAll() {
  if (!view) return;
  persist(newRecord(view.rows.length)); // Play all always starts from the beginning with a clean record
  playFrom(0, true);
}
function resume() {
  if (view && isResumable(view.progress)) playFrom(view.progress.index, true);
}

// Space toggles Play all / Stop; ArrowDown / ArrowUp play the next / previous block.
let keyHandler = null;
function onKeydown(e) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || !view) return;
  const tag = e.target?.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  if (e.key === ' ') {
    if (tag === 'BUTTON') return; // a focused button keeps its native Space click
    e.preventDefault();
    if (playingIndex !== null) stopPlayback();
    else playAll();
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const last = view.rows.length - 1;
    const cur = playingIndex ?? (isResumable(view.progress) ? view.progress.index : null);
    const target = cur === null ? 0 : e.key === 'ArrowDown' ? Math.min(cur + 1, last) : Math.max(cur - 1, 0);
    playFrom(target, playingIndex !== null && chained);
  }
}
function leaveDetail() {
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = null;
  stopPlayback();
  view = null;
}

// ---- Views ----
async function showList() {
  leaveDetail();
  const entries = await store.list(APP);
  main.replaceChildren();
  flushNotice();
  if (entries.length === 0) {
    main.append(renderEmptyState(APP, importSample, INSTRUCTION_URL));
    return;
  }
  const list = renderList(
    entries,
    (entry) => showDetail(entry.id),
    async (entry) => {
      await store.remove(APP, entry.id);
      clearProgress(storage, entry.id);
      await showList();
    },
  );
  entries.forEach((entry, k) => addProgressRow(list.children[k], entry));
  main.append(h('h2', {}, 'Your packs'), list);
}

// Progress under a list row. Packs with a progress record get it (plus Resume when resumable);
// packs without one show an empty bar and "Item 0 of N" / "Section 0 of N", no Resume.
function addProgressRow(li, entry) {
  const count = countItems(entry.payload);
  const rec = reconcile(loadProgress(storage, entry.id), count);
  if (count === 0) return;
  const unstarted = !rec;
  if (!unstarted && !(rec.finished || isResumable(rec))) return;
  const unit = isDocumentPack(entry.payload) ? 'Section' : 'Item';
  const done = unstarted ? 0 : rec.finished ? count : rec.index + 1;
  if (!unstarted && isResumable(rec)) {
    const btn = h('button', { type: 'button', class: 'entry-resume', 'aria-label': `Resume ${entry.payload.title}` }, 'Resume');
    btn.addEventListener('click', () => showDetail(entry.id, { resume: true }));
    li.querySelector('.entry-delete')?.before(btn);
  }
  const fill = h('span', { class: 'progress-fill' });
  fill.style.width = `${(done / count) * 100}%`;
  const bar = h('div', {
    class: 'progress-bar', role: 'progressbar', 'aria-label': 'Progress',
    'aria-valuemin': '0', 'aria-valuemax': String(count), 'aria-valuenow': String(done),
  }, fill);
  const text = h('span', { class: unstarted ? 'progress-text is-unstarted' : rec.finished ? 'progress-text is-finished' : 'progress-text' },
    !unstarted && rec.finished ? 'Finished' : `${unit} ${done} of ${count}`);
  li.append(h('div', { class: 'pack-progress' }, bar, text));
}

// Listening pack: headed groups of item rows.
function renderListening(pack, rows) {
  const body = h('div', {});
  for (const section of pack.sections) {
    body.append(h('h3', {}, section.heading));
    const ul = h('ul', { class: 'items' });
    for (const item of section.items) {
      const index = rows.length;
      const btn = h('button', { type: 'button', class: 'item playable' },
        h('span', { class: 'item-played' }, '\u2713 Played'),
        h('span', { class: 'text' }, item.text));
      if (typeof item.note === 'string' && item.note.trim() !== '') {
        btn.append(h('span', { class: 'note' }, item.note));
      }
      if (item.meaning) btn.append(h('span', { class: 'meaning' }, item.meaning));
      btn.addEventListener('click', () => playFrom(index, false));
      rows.push({ item, node: btn });
      ul.append(h('li', {}, btn));
    }
    body.append(ul);
  }
  return body;
}
// Document pack: one block per document; heading derived from a short first line, line breaks kept.
function renderDocuments(pack, rows) {
  const body = h('div', { class: 'docs' });
  for (const section of pack.sections) {
    for (const item of section.items) {
      const index = rows.length;
      const { heading, body: text } = splitDocument(item.text);
      const block = h('button', { type: 'button', class: 'doc-block playable' },
        h('span', { class: 'doc-meta' },
          h('span', { class: 'doc-section' }, `Section ${index + 1}`),
          h('span', { class: 'doc-played' }, '\u2713 Played')));
      if (heading) block.append(h('span', { class: 'doc-heading' }, heading));
      if (text) block.append(h('span', { class: 'doc-body' }, text));
      block.append(h('span', { class: 'doc-play', 'aria-hidden': 'true' }, '\u25B6 Tap to play'));
      block.addEventListener('click', () => playFrom(index, false));
      rows.push({ item, node: block });
      body.append(block);
    }
  }
  return body;
}
async function showDetail(id, { resume: autoResume = false } = {}) {
  leaveDetail();
  const entry = await store.get(APP, id);
  if (!entry) return showList();
  const pack = entry.payload;
  main.replaceChildren();
  flushNotice();
  const rows = [];
  const isDoc = isDocumentPack(pack);
  const body = isDoc ? renderDocuments(pack, rows) : renderListening(pack, rows);
  const unit = isDoc ? 'Section' : 'Item';
  const stored = loadProgress(storage, id);
  const progress = reconcile(stored, rows.length) ?? newRecord(rows.length);
  if (stored && progress !== stored) clearProgress(storage, id);

  const back = h('button', { type: 'button', class: 'back' }, 'Back');
  back.addEventListener('click', showList);
  const play = h('button', { type: 'button', class: 'btn-primary' }, 'Play all');
  play.addEventListener('click', playAll);
  const stop = h('button', { type: 'button' }, 'Stop');
  stop.addEventListener('click', stopPlayback);
  const repeat = h('button', { type: 'button', class: 'toggle' });
  const syncRepeat = () => {
    repeat.textContent = repeatMode === 'off' ? 'Repeat: off' : repeatMode === 'block' ? 'Repeat block' : 'Repeat all';
    repeat.setAttribute('aria-pressed', String(repeatMode !== 'off'));
  };
  repeat.addEventListener('click', () => {
    repeatMode = nextRepeatMode(repeatMode);
    syncRepeat();
  });
  syncRepeat();
  const resumeBtn = h('button', { type: 'button', class: 'resume' });
  resumeBtn.addEventListener('click', resume);
  const speedLabel = h('label', {}, 'Speed ', speedSelect);

  view = {
    id,
    pack,
    rows,
    progress,
    // Re-draw played marks and the Resume button from the current progress.
    refresh() {
      rows.forEach(({ node }, i) => node.classList.toggle('played', isPlayed(this.progress, i)));
      const can = playingIndex === null && isResumable(this.progress);
      resumeBtn.hidden = !can;
      if (can) resumeBtn.textContent = `Resume \u00B7 ${unit} ${this.progress.index + 1}`;
    },
  };
  view.refresh();
  keyHandler = onKeydown;
  document.addEventListener('keydown', keyHandler);

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
    h('h2', { class: 'pack-title' }, pack.title),
    h('div', { class: 'playbar', role: 'group', 'aria-label': 'Playback' }, play, stop, repeat, resumeBtn, speedLabel),
    h('p', { class: 'keys-hint' }, 'Space: Play / Stop \u00B7 \u2191 / \u2193: Previous / Next block'),
    body,
    h('section', { class: 'memo-panel' }, exportBtn, memoOut),
  );
  if (autoResume) resume();
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
