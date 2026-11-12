// Thin Promise wrapper over IndexedDB. One database, one object store per app.
// Browser-only: nothing here runs at import time, so importing in Node is harmless.

const DB_NAME = 'instruction-sheet-skeleton';
const DB_VERSION = 1;
const APPS = ['player', 'board'];

let dbPromise = null;

function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        for (const app of APPS) {
          if (!req.result.objectStoreNames.contains(app)) {
            req.result.createObjectStore(app, { keyPath: 'id' });
          }
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

function checkApp(app) {
  if (!APPS.includes(app)) throw new Error(`Unknown app: ${app}`);
}

// The key is derived from the title only: same title => same entry (re-import replaces).
function idFromTitle(title) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('Cannot save: payload has no title.');
  }
  return title.trim().normalize('NFC');
}

async function open(app, mode) {
  checkApp(app);
  const db = await openDb();
  const tx = db.transaction(app, mode);
  return { tx, os: tx.objectStore(app) };
}

/** Save a validated payload. Replaces any existing entry with the same title. Returns the id. */
export async function save(app, payload) {
  const id = idFromTitle(payload?.title);
  const { tx, os } = await open(app, 'readwrite');
  os.put({ id, savedAt: new Date().toISOString(), payload });
  await done(tx);
  return id;
}

/** All entries for this app only, newest first. */
export async function list(app) {
  const { os } = await open(app, 'readonly');
  const entries = await request(os.getAll());
  return entries.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

/** One entry by id, or undefined. */
export async function get(app, id) {
  const { os } = await open(app, 'readonly');
  return request(os.get(id));
}

/** Remove exactly the entry with this id. */
export async function remove(app, id) {
  const { tx, os } = await open(app, 'readwrite');
  os.delete(id);
  await done(tx);
}
