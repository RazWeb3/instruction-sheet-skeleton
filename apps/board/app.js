// Memory Board: one screen (list view + detail view) built on core/.
import { decodePayload, encodePayload } from '../../core/codec.js';
import { validatePayload } from '../../core/validate.js';
import * as store from '../../core/store.js';
import { showNotice, renderEmptyState, renderList } from '../../core/ui.js';
import { sortCards, collectTags, filterByTag, buildMemo } from './board.js';

const APP = 'board';
const SAMPLE_URL = '../../samples/board-sample.json';
const INSTRUCTION_URL = 'https://raw.githubusercontent.com/RazWeb3/instruction-sheet-skeleton/main/instructions/board.md';
const main = document.getElementById('main');

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
    if (result.type !== 'memory-board') throw new Error(`This link is for "${result.type}", not a memory board.`);
    await store.save(APP, result.data);
    return { ok: true, title: result.data.title };
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

// ---- Views ----
async function showList() {
  const entries = await store.list(APP);
  main.replaceChildren();
  flushNotice();
  if (entries.length === 0) {
    main.append(renderEmptyState(APP, importSample, INSTRUCTION_URL));
    return;
  }
  main.append(
    h('h2', {}, 'Your boards'),
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
  const entry = await store.get(APP, id);
  if (!entry) return showList();
  const board = entry.payload;
  main.replaceChildren();
  flushNotice();

  const sorted = sortCards(board.cards);
  const tags = collectTags(board.cards);
  let activeTag = null;

  const tagRow = h('div', { class: 'tags', role: 'group', 'aria-label': 'Filter by tag' });
  const cardList = h('ul', { class: 'cards' });

  function renderCards() {
    cardList.replaceChildren(
      ...filterByTag(sorted, activeTag).map((c) => {
        const card = h('article', { class: 'card' }, h('h3', {}, c.heading), h('p', {}, c.body));
        if (c.tag) card.append(h('span', { class: 'tag' }, c.tag));
        return h('li', {}, card);
      }),
    );
    for (const btn of tagRow.children) {
      btn.setAttribute('aria-pressed', String((btn.dataset.tag ?? null) === activeTag));
    }
  }
  for (const tag of [null, ...tags]) {
    const btn = h('button', { type: 'button', 'aria-pressed': 'false' }, tag ?? 'all');
    if (tag !== null) btn.dataset.tag = tag;
    btn.addEventListener('click', () => {
      activeTag = tag;
      renderCards();
    });
    tagRow.append(btn);
  }
  renderCards();

  const back = h('button', { type: 'button' }, 'Back');
  back.addEventListener('click', showList);

  const memoOut = h('div', {});
  const exportBtn = h('button', { type: 'button' }, 'Export correction memo');
  exportBtn.addEventListener('click', () => {
    const area = h('textarea', { readonly: '', 'aria-label': 'Correction memo' });
    area.value = buildMemo(board);
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

  main.append(back, h('h2', {}, board.title), tagRow, cardList, h('footer', {}, exportBtn, memoOut));
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
