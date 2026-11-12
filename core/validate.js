// Payload validation. DOM-free. Never throws for bad data; returns named reasons.

const SUPPORTED = {
  'listening-pack': [1],
  'memory-board': [1],
};

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v) => typeof v === 'string' && v.trim().length > 0;

function optionalString(obj, key, path, reasons) {
  if (obj[key] !== undefined && typeof obj[key] !== 'string') {
    reasons.push(`${path}.${key} must be a string when present`);
  }
}

function checkListeningPack(p, reasons) {
  if (!isText(p.title)) reasons.push('title is required (non-empty string)');
  if (!Array.isArray(p.sections)) {
    reasons.push('sections is required (array)');
    return;
  }
  p.sections.forEach((s, i) => {
    const sp = `sections[${i}]`;
    if (!isObject(s)) return reasons.push(`${sp} must be an object`);
    if (!isText(s.heading)) reasons.push(`${sp}.heading is required (non-empty string)`);
    if (!Array.isArray(s.items)) return reasons.push(`${sp}.items is required (array)`);
    s.items.forEach((it, j) => {
      const ip = `${sp}.items[${j}]`;
      if (!isObject(it)) return reasons.push(`${ip} must be an object`);
      if (!isText(it.text)) reasons.push(`${ip}.text is required (non-empty string)`);
      optionalString(it, 'meaning', ip, reasons);
      optionalString(it, 'note', ip, reasons);
    });
  });
}

function checkMemoryBoard(p, reasons) {
  if (!isText(p.title)) reasons.push('title is required (non-empty string)');
  if (!Array.isArray(p.cards)) {
    reasons.push('cards is required (array)');
    return;
  }
  p.cards.forEach((c, i) => {
    const cp = `cards[${i}]`;
    if (!isObject(c)) return reasons.push(`${cp} must be an object`);
    if (!isText(c.heading)) reasons.push(`${cp}.heading is required (non-empty string)`);
    if (!isText(c.body)) reasons.push(`${cp}.body is required (non-empty string)`);
    optionalString(c, 'tag', cp, reasons);
    optionalString(c, 'updatedAt', cp, reasons);
  });
}

const CHECKS = {
  'listening-pack': checkListeningPack,
  'memory-board': checkMemoryBoard,
};

/**
 * Validate a decoded payload.
 * Success: { ok: true, type, schemaVersion, data }
 * Failure: { ok: false, reasons: string[] }
 */
export function validatePayload(obj) {
  if (!isObject(obj)) {
    return { ok: false, reasons: ['payload must be a JSON object'] };
  }
  const reasons = [];
  if (obj.type === undefined) reasons.push('type is missing');
  if (obj.schemaVersion === undefined) reasons.push('schemaVersion is missing');
  if (reasons.length) return { ok: false, reasons };

  if (typeof obj.type !== 'string' || !Object.hasOwn(SUPPORTED, obj.type)) {
    return { ok: false, reasons: [`unknown type: ${JSON.stringify(obj.type)}`] };
  }
  if (!SUPPORTED[obj.type].includes(obj.schemaVersion)) {
    return {
      ok: false,
      reasons: [`unsupported schemaVersion ${JSON.stringify(obj.schemaVersion)} for type ${obj.type}`],
    };
  }

  CHECKS[obj.type](obj, reasons);
  if (reasons.length) return { ok: false, reasons };
  return { ok: true, type: obj.type, schemaVersion: obj.schemaVersion, data: obj };
}
