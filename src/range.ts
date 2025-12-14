import type { Comparator } from './types.js';
import { parse } from './parse.js';
import { cmpPre, cmpVer } from './compare.js';

const rangeCache: Record<string, Comparator> = Object.create(null);
let rangeCacheSize = 0;

function buildComp(s: string): Comparator | null {
  let i = 0, op = 0, c = s.charCodeAt(0);
  if (c === 62) {
    op = s.charCodeAt(1) === 61 ? (i = 2, 2) : (i = 1, 1);
  } else if (c === 60) {
    op = s.charCodeAt(1) === 61 ? (i = 2, 4) : (i = 1, 3);
  } else if (c === 61) {
    i = s.charCodeAt(1) === 61 ? 2 : 1;
  } else if (c === 94) {
    op = 5; i = 1;
  } else if (c === 126) {
    op = 6; i = 1;
  }

  while (s.charCodeAt(i) === 32) i++;
  const pv = parse(s.slice(i));
  if (!pv) return null;
  const rM = pv.major, rm = pv.minor, rp = pv.patch, rPre = pv.pre;

  switch (op) {
    case 0: return (M, m, p, pr) => M === rM && m === rm && p === rp && cmpPre(pr, rPre) === 0;
    case 1: return (M, m, p, pr) => { const d = (M - rM) || (m - rm) || (p - rp); return d !== 0 ? d > 0 : cmpPre(pr, rPre) > 0; };
    case 2: return (M, m, p, pr) => { const d = (M - rM) || (m - rm) || (p - rp); return d !== 0 ? d > 0 : cmpPre(pr, rPre) >= 0; };
    case 3: return (M, m, p, pr) => { const d = (M - rM) || (m - rm) || (p - rp); return d !== 0 ? d < 0 : cmpPre(pr, rPre) < 0; };
    case 4: return (M, m, p, pr) => { const d = (M - rM) || (m - rm) || (p - rp); return d !== 0 ? d < 0 : cmpPre(pr, rPre) <= 0; };
    case 5:
      if (rM === 0) {
        if (rm === 0) return (M, m, p, pr) => !pr && M === 0 && m === 0 && p === rp;
        return (M, m, p, pr) => !pr && M === 0 && m === rm && p >= rp;
      }
      return (M, m, p, pr) => !pr && M === rM && ((m - rm) || (p - rp)) >= 0;
    case 6: return (M, m, p, pr) => !pr && M === rM && m === rm && p >= rp;
  }
  return null;
}

function buildRange(s: string): Comparator {
  if (s.indexOf('||') !== -1) {
    const br = s.split('||').map(x => range(x.trim()));
    return (M, m, p, pr) => { for (let i = 0; i < br.length; i++) if (br[i](M, m, p, pr)) return true; return false; };
  }

  const h = s.indexOf(' - ');
  if (h !== -1) {
    const lo = parse(s.slice(0, h)), hi = parse(s.slice(h + 3));
    if (!lo || !hi) return () => false;
    const loM = lo.major, lom = lo.minor, lop = lo.patch, loPre = lo.pre;
    const hiM = hi.major, him = hi.minor, hip = hi.patch, hiPre = hi.pre;
    return (M, m, p, pr) => {
      const dLo = (M - loM) || (m - lom) || (p - lop);
      const dHi = (M - hiM) || (m - him) || (p - hip);
      return (dLo !== 0 ? dLo >= 0 : cmpPre(pr, loPre) >= 0) && (dHi !== 0 ? dHi <= 0 : cmpPre(pr, hiPre) <= 0);
    };
  }

  const parts: string[] = [];
  let start = 0;
  for (let i = 0, len = s.length; i <= len; i++) {
    const c = i < len ? s.charCodeAt(i) : 32;
    if (c === 32 || c === 9) {
      if (i > start) {
        const part = s.slice(start, i);
        if (part !== '*' && part !== 'x' && part !== 'X') parts.push(part);
      }
      start = i + 1;
    }
  }

  if (!parts.length) return () => true;
  const comps: Comparator[] = [];
  for (let i = 0; i < parts.length; i++) {
    const c = buildComp(parts[i]);
    if (!c) return () => false;
    comps.push(c);
  }
  if (comps.length === 1) return comps[0];
  return (M, m, p, pr) => { for (let i = 0; i < comps.length; i++) if (!comps[i](M, m, p, pr)) return false; return true; };
}

function range(str: string): Comparator {
  let r = rangeCache[str];
  if (r) return r;
  r = buildRange(str.trim());
  if (rangeCacheSize >= 2048) {
    for (const k in rangeCache) delete rangeCache[k];
    rangeCacheSize = 0;
  }
  rangeCache[str] = r;
  rangeCacheSize++;
  return r;
}

export function satisfies(version: string, r: string): boolean {
  const v = parse(version);
  return v ? range(r)(v.major, v.minor, v.patch, v.pre) : false;
}

export function maxSatisfying(versions: string[], r: string): string | null {
  const test = range(r);
  let max: string | null = null, mp = null as ReturnType<typeof parse>;
  for (let i = 0; i < versions.length; i++) {
    const ver = versions[i], p = parse(ver);
    if (!p || !test(p.major, p.minor, p.patch, p.pre)) continue;
    if (!max || cmpVer(p, mp!) > 0) { max = ver; mp = p; }
  }
  return max;
}

export function minSatisfying(versions: string[], r: string): string | null {
  const test = range(r);
  let min: string | null = null, mp = null as ReturnType<typeof parse>;
  for (let i = 0; i < versions.length; i++) {
    const ver = versions[i], p = parse(ver);
    if (!p || !test(p.major, p.minor, p.patch, p.pre)) continue;
    if (!min || cmpVer(p, mp!) < 0) { min = ver; mp = p; }
  }
  return min;
}
