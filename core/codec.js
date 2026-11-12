// Import-link codec: JSON <-> gzip <-> base64url. DOM-free; works in browsers and Node.

export class CodecError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'CodecError';
    this.reason = reason;
  }
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const LOOKUP = new Map([...ALPHABET].map((c, i) => [c, i]));

function bytesToBase64url(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += ALPHABET[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += ALPHABET[n & 63];
  }
  return out;
}

function base64urlToBytes(text) {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) {
    throw new CodecError('The link data is not valid base64url (unexpected characters).');
  }
  if (text.length % 4 === 1) {
    throw new CodecError('The link data looks truncated (invalid base64url length).');
  }
  const bytes = new Uint8Array(Math.floor((text.length * 3) / 4));
  let pos = 0;
  for (let i = 0; i < text.length; i += 4) {
    const chunk = text.slice(i, i + 4);
    let n = 0;
    for (let j = 0; j < 4; j++) n = (n << 6) | (LOOKUP.get(chunk[j]) ?? 0);
    bytes[pos++] = (n >> 16) & 255;
    if (chunk.length > 2) bytes[pos++] = (n >> 8) & 255;
    if (chunk.length > 3) bytes[pos++] = n & 255;
  }
  return bytes;
}

async function pipeBytes(bytes, transform) {
  const stream = new Blob([bytes]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Encode a JSON-serializable value into a URL-safe string (no +, /, =). */
export async function encodePayload(obj) {
  const json = JSON.stringify(obj);
  if (json === undefined) {
    throw new CodecError('The payload cannot be represented as JSON.');
  }
  const gz = await pipeBytes(new TextEncoder().encode(json), new CompressionStream('gzip'));
  return bytesToBase64url(gz);
}

/** Decode a `?data=` value back to the original object. Throws CodecError on bad input. */
export async function decodePayload(data) {
  if (typeof data !== 'string' || data.length === 0) {
    throw new CodecError('The link has no data.');
  }
  const gz = base64urlToBytes(data);
  let raw;
  try {
    raw = await pipeBytes(gz, new DecompressionStream('gzip'));
  } catch {
    throw new CodecError('The link data is corrupt or truncated (not valid gzip).');
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
  } catch {
    throw new CodecError('The link data does not contain valid JSON.');
  }
}
