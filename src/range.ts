import type { Comparator } from './types.js';
import { parse } from './parse.js';
import { cmpPre, cmpVer } from './compare.js';

const rangeCache = new Map<string, Comparator>();

function buildComp(s: string): Comparator | null {
  let i = 0,
    op = '=',
    c = s.charCodeAt(0);
  if (c === 62) {
    op = s.charCodeAt(1) === 61 ? ((i = 2), '>=') : ((i = 1), '>');
  } else if (c === 60) {
    op = s.charCodeAt(1) === 61 ? ((i = 2), '<=') : ((i = 1), '<');
  } else if (c === 61) {
    i = s.charCodeAt(1) === 61 ? 2 : 1;
  } else if (c === 94) {
    op = '^';
    i = 1;
  } else if (c === 126) {
    op = '~';
    i = 1;
  }

  while (s.charCodeAt(i) === 32) i++;
  const pv = parse(s.slice(i));
  if (!pv) return null;
  const { major: rM, minor: rm, patch: rp, pre: rPre } = pv;

  if (op === '=')
    return (M, m, p, pr) => M === rM && m === rm && p === rp && cmpPre(pr, rPre) === 0;
  if (op === '>')
    return (M, m, p, pr) => {
      const d = (M - rM) || (m - rm) || (p - rp);
      return d !== 0 ? d > 0 : cmpPre(pr, rPre) > 0;
    };
  if (op === '>=')
    return (M, m, p, pr) => {
      const d = (M - rM) || (m - rm) || (p - rp);
      return d !== 0 ? d > 0 : cmpPre(pr, rPre) >= 0;
    };
  if (op === '<')
    return (M, m, p, pr) => {
      const d = (M - rM) || (m - rm) || (p - rp);
      return d !== 0 ? d < 0 : cmpPre(pr, rPre) < 0;
    };
  if (op === '<=')
    return (M, m, p, pr) => {
      const d = (M - rM) || (m - rm) || (p - rp);
      return d !== 0 ? d < 0 : cmpPre(pr, rPre) <= 0;
    };

  if (op === '^') {
    if (rM === 0) {
      if (rm === 0) return (M, m, p, pr) => !pr && M === 0 && m === 0 && p === rp;
      return (M, m, p, pr) => !pr && M === 0 && m === rm && p >= rp;
    }
    return (M, m, p, pr) => !pr && M === rM && ((m - rm) || (p - rp)) >= 0;
  }

  if (op === '~') return (M, m, p, pr) => !pr && M === rM && m === rm && p >= rp;
  return null;
}

function buildRange(s: string): Comparator {
  if (s.includes('||')) {
    const br = s.split('||').map((x) => range(x.trim()));
    return (M, m, p, pr) => {
      for (const b of br) if (b(M, m, p, pr)) return true;
      return false;
    };
  }

  const h = s.indexOf(' - ');
  if (h !== -1) {
    const lo = parse(s.slice(0, h)),
      hi = parse(s.slice(h + 3));
    if (!lo || !hi) return () => false;
    return (M, m, p, pr) => {
      const dLo = (M - lo.major) || (m - lo.minor) || (p - lo.patch);
      const dHi = (M - hi.major) || (m - hi.minor) || (p - hi.patch);
      const cLo = dLo !== 0 ? dLo : cmpPre(pr, lo.pre);
      const cHi = dHi !== 0 ? dHi : cmpPre(pr, hi.pre);
      return cLo >= 0 && cHi <= 0;
    };
  }

  const parts = s.split(/\s+/).filter((x) => x && x !== '*' && x !== 'x' && x !== 'X');
  if (!parts.length) return () => true;
  const comps = parts.map(buildComp);
  if (comps.includes(null)) return () => false;
  if (comps.length === 1) return comps[0]!;
  return (M, m, p, pr) => {
    for (const c of comps) if (!c!(M, m, p, pr)) return false;
    return true;
  };
}

function range(str: string): Comparator {
  let r = rangeCache.get(str);
  if (r) return r;
  r = buildRange(str.trim());
  if (rangeCache.size >= 1024) rangeCache.clear();
  rangeCache.set(str, r);
  return r;
}

export function satisfies(version: string, r: string): boolean {
  const v = parse(version);
  return v ? range(r)(v.major, v.minor, v.patch, v.pre) : false;
}

export function maxSatisfying(versions: string[], r: string): string | null {
  const test = range(r);
  let max: string | null = null,
    mp = null as ReturnType<typeof parse>;
  for (const ver of versions) {
    const p = parse(ver);
    if (!p || !test(p.major, p.minor, p.patch, p.pre)) continue;
    if (!max || cmpVer(p, mp!) > 0) {
      max = ver;
      mp = p;
    }
  }
  return max;
}

export function minSatisfying(versions: string[], r: string): string | null {
  const test = range(r);
  let min: string | null = null,
    mp = null as ReturnType<typeof parse>;
  for (const ver of versions) {
    const p = parse(ver);
    if (!p || !test(p.major, p.minor, p.patch, p.pre)) continue;
    if (!min || cmpVer(p, mp!) < 0) {
      min = ver;
      mp = p;
    }
  }
  return min;
}
