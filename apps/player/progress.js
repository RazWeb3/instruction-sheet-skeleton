// Pack Player progress and speed persistence. DOM-free: the storage object is injected
// (anything with getItem / setItem / removeItem, e.g. window.localStorage), so it runs under `node --test`.

export const PROGRESS_PREFIX = 'player-progress:';
export const SPEED_KEY = 'player-speed';
export const SPEEDS = [0.75, 1, 1.25];
export const DEFAULT_SPEED = 1;
export const REPEAT_MODES = ['off', 'block', 'all'];

const key = (packId) => `${PROGRESS_PREFIX}${packId}`;

/** Total item/block count of a pack payload (sections flattened, as the player lists them). */
export function countItems(pack) {
  if (!Array.isArray(pack?.sections)) return 0;
  return pack.sections.reduce((n, s) => n + (Array.isArray(s?.items) ? s.items.length : 0), 0);
}

function isValid(rec) {
  return (
    rec &&
    typeof rec === 'object' &&
    (rec.index === null || Number.isInteger(rec.index)) &&
    Array.isArray(rec.played) &&
    rec.played.every(Number.isInteger) &&
    typeof rec.finished === 'boolean' &&
    Number.isInteger(rec.count)
  );
}

/** Stored record for a pack, or null when absent or malformed. Never throws. */
export function loadProgress(storage, packId) {
  try {
    const raw = storage.getItem(key(packId));
    if (raw == null) return null;
    const rec = JSON.parse(raw);
    return isValid(rec) ? rec : null;
  } catch {
    return null;
  }
}

/** Save a record (adds updatedAt). Returns the saved record, or the input when storage is unavailable. */
export function saveProgress(storage, packId, record) {
  const saved = { ...record, updatedAt: new Date().toISOString() };
  try {
    storage.setItem(key(packId), JSON.stringify(saved));
  } catch {
    /* storage full or blocked: progress is a convenience, playback goes on */
  }
  return saved;
}

export function clearProgress(storage, packId) {
  try {
    storage.removeItem(key(packId));
  } catch {
    /* ignore */
  }
}

/** A fresh record: nothing played, no resume point. */
export function newRecord(count) {
  return { index: null, played: [], finished: false, count };
}

/** Item/block `i` starts playing: it becomes the resume point and joins the played set. */
export function markStarted(record, i, count) {
  const base = record && record.count === count ? record : newRecord(count);
  const played = base.played.includes(i) ? base.played : [...base.played, i].sort((a, b) => a - b);
  return { ...base, index: i, played, finished: false, count };
}

/** Natural completion of the last item/block: finished, resume point cleared, played kept full. */
export function markFinished(record, count) {
  return { index: null, played: Array.from({ length: count }, (_, i) => i), finished: true, count };
}

/** Keep a record only while the pack's item count is unchanged (re-import check). */
export function reconcile(record, count) {
  return record && record.count === count ? record : null;
}

/** True when the pack can be resumed: a resume point exists and the pack is not finished. */
export function isResumable(record) {
  return !!record && !record.finished && Number.isInteger(record.index);
}

/** Played mark for display: before the resume point, or played earlier. The resume item itself is not marked. */
export function isPlayed(record, i) {
  if (!record) return false;
  if (record.finished) return true;
  if (Number.isInteger(record.index)) {
    if (i < record.index) return true;
    if (i === record.index) return false;
  }
  return record.played.includes(i);
}

/** Off -> block -> all -> off. */
export function nextRepeatMode(mode) {
  return REPEAT_MODES[(REPEAT_MODES.indexOf(mode) + 1) % REPEAT_MODES.length];
}

/**
 * What happens when item `i` ends naturally.
 * block: play it again. all and last: restart at 0. off and last: finish.
 * Otherwise a chained session (Play all / Resume) continues; a single tapped item stops.
 */
export function resolveNext(mode, i, count, chain) {
  if (mode === 'block') return { action: 'play', index: i };
  const last = i >= count - 1;
  if (last) return mode === 'all' ? { action: 'play', index: 0 } : { action: 'finish' };
  return chain ? { action: 'play', index: i + 1 } : { action: 'stop' };
}

/** Saved speed when it is one of the offered speeds, else the default. */
export function loadSpeed(storage) {
  try {
    const n = Number(storage.getItem(SPEED_KEY));
    return SPEEDS.includes(n) ? n : DEFAULT_SPEED;
  } catch {
    return DEFAULT_SPEED;
  }
}

export function saveSpeed(storage, rate) {
  try {
    storage.setItem(SPEED_KEY, String(rate));
  } catch {
    /* ignore */
  }
}
