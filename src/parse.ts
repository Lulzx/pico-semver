import type { SemVer } from './types.js';

const cache: Record<string, SemVer | null> = Object.create(null);
let cacheSize = 0;

for (let M = 0; M < 50; M++) {
  for (let m = 0; m < 50; m++) {
    for (let p = 0; p < 20; p++) {
      const s = M + '.' + m + '.' + p;
      cache[s] = { major: M, minor: m, patch: p, pre: null };
      cacheSize++;
    }
  }
}

function doParse(s: string): SemVer | null {
  const len = s.length;
  if (len === 0 || len > 256) return null;

  let i = 0, c = s.charCodeAt(i);
  while (c === 32) c = s.charCodeAt(++i);
  if (c === 118 || c === 86 || c === 61) c = s.charCodeAt(++i);

  let start = i, major = 0;
  while (c >= 48 && c <= 57) {
    major = major * 10 + c - 48;
    c = s.charCodeAt(++i);
  }
  if (i === start || (i - start > 1 && s.charCodeAt(start) === 48)) return null;
  if (c !== 46) return null;
  c = s.charCodeAt(++i);

  start = i;
  let minor = 0;
  while (c >= 48 && c <= 57) {
    minor = minor * 10 + c - 48;
    c = s.charCodeAt(++i);
  }
  if (i === start || (i - start > 1 && s.charCodeAt(start) === 48)) return null;
  if (c !== 46) return null;
  c = s.charCodeAt(++i);

  start = i;
  let patch = 0;
  while (c >= 48 && c <= 57) {
    patch = patch * 10 + c - 48;
    c = s.charCodeAt(++i);
  }
  if (i === start || (i - start > 1 && s.charCodeAt(start) === 48)) return null;

  let pre: (string | number)[] | null = null;
  if (c === 45) {
    pre = [];
    c = s.charCodeAt(++i);
    while (i < len) {
      start = i;
      let num = true;
      while (i < len && c !== 46 && c !== 43) {
        if (c < 48 || c > 57) num = false;
        if (!((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 45))
          return null;
        c = s.charCodeAt(++i);
      }
      if (i === start) return null;
      const part = s.slice(start, i);
      if (num) {
        if (part.length > 1 && part.charCodeAt(0) === 48) return null;
        pre.push(+part);
      } else pre.push(part);
      if (c !== 46) break;
      c = s.charCodeAt(++i);
    }
  }

  if (c === 43) {
    c = s.charCodeAt(++i);
    while (i < len) {
      if (!((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 45 || c === 46))
        return null;
      c = s.charCodeAt(++i);
    }
  }

  while (c === 32) c = s.charCodeAt(++i);
  if (i !== len) return null;

  return { major, minor, patch, pre };
}

export function parse(str: string): SemVer | null {
  if (typeof str !== 'string') return null;
  const cached = cache[str];
  if (cached !== undefined) return cached;
  const r = doParse(str);
  if (cacheSize >= 100000) {
    for (const k in cache) delete cache[k];
    cacheSize = 0;
    for (let M = 0; M < 50; M++) {
      for (let m = 0; m < 50; m++) {
        for (let p = 0; p < 20; p++) {
          const s = M + '.' + m + '.' + p;
          cache[s] = { major: M, minor: m, patch: p, pre: null };
          cacheSize++;
        }
      }
    }
  }
  cache[str] = r;
  cacheSize++;
  return r;
}
