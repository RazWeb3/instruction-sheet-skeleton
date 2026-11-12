// Shared UI parts. Browser-only; builds DOM with textContent (never innerHTML).

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

/** Show an import result banner. kind: 'success' | 'error'. Replaces any previous notice. */
export function showNotice(message, kind = 'success', container = document.body) {
  container.querySelector(':scope > .notice')?.remove();
  const isError = kind === 'error';
  const lines = Array.isArray(message) ? message : [message];
  const notice = el(
    'div',
    { class: `notice notice-${isError ? 'error' : 'success'}`, role: isError ? 'alert' : 'status' },
    ...lines.map((line) => el('p', {}, line)),
  );
  container.prepend(notice);
  return notice;
}

/**
 * Empty state: tells the user to load the instruction-sheet URL into their AI chat,
 * plus a button that imports the sample. Returns the element; caller mounts it.
 * onImportSample is called when the button is pressed.
 */
export function renderEmptyState(app, onImportSample, instructionUrl) {
  const hint = el(
    'p',
    {},
    'Nothing saved yet. Paste the instruction-sheet URL into your AI chat, then open the import link it gives you.',
  );
  const box = el('section', { class: 'empty-state', 'aria-label': `No saved data in ${app}` }, hint);
  if (instructionUrl) {
    box.append(el('p', {}, 'Instruction sheet: ', el('a', { href: instructionUrl }, instructionUrl)));
  }
  const button = el('button', { type: 'button' }, 'Import sample');
  button.addEventListener('click', () => onImportSample());
  box.append(button);
  return box;
}

/** Total items across all sections of a listening-pack payload; null for other payload types. */
function totalItems(payload) {
  if (!Array.isArray(payload?.sections)) return null;
  return payload.sections.reduce((n, s) => n + (Array.isArray(s.items) ? s.items.length : 0), 0);
}
/**
 * List of saved entries (as returned by store.list). onOpen(entry) navigates to the
 * detail view; onDelete(entry) removes it. Returns the element; caller mounts it.
 */
export function renderList(entries, onOpen, onDelete) {
  const ul = el('ul', { class: 'entry-list' });
  for (const entry of entries) {
    const title = entry.payload.title;
    const open = el('button', { type: 'button', class: 'entry-open' }, title);
    const count = totalItems(entry.payload);
    if (count !== null) open.append(el('span', { class: 'entry-count' }, `  (${count} ${count === 1 ? 'item' : 'items'})`));
    open.addEventListener('click', () => onOpen(entry));
    const del = el('button', { type: 'button', class: 'entry-delete', 'aria-label': `Delete ${title}` }, 'Delete');
    del.addEventListener('click', () => onDelete(entry));
    ul.append(el('li', {}, open, del));
  }
  return ul;
}
