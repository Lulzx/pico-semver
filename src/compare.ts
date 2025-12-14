import type { SemVer } from './types.js';
import { parse } from './parse.js';

export function cmpPre(a: (string | number)[] | null, b: (string | number)[] | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const len = a.length < b.length ? a.length : b.length;
  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) continue;
    const an = typeof a[i] === 'number', bn = typeof b[i] === 'number';
    if (an !== bn) return an ? -1 : 1;
    return a[i] < b[i] ? -1 : 1;
  }
  return a.length - b.length;
}

export function cmpVer(a: SemVer, b: SemVer): number {
  const d = (a.major - b.major) || (a.minor - b.minor) || (a.patch - b.patch);
  if (d) return d < 0 ? -1 : 1;
  const ap = a.pre, bp = b.pre;
  if (!ap && !bp) return 0;
  if (!ap) return 1;
  if (!bp) return -1;
  const len = ap.length < bp.length ? ap.length : bp.length;
  for (let i = 0; i < len; i++) {
    if (ap[i] === bp[i]) continue;
    const an = typeof ap[i] === 'number', bn = typeof bp[i] === 'number';
    if (an !== bn) return an ? -1 : 1;
    return ap[i] < bp[i] ? -1 : 1;
  }
  return ap.length - bp.length;
}

export function compare(a: string, b: string): number | null {
  if (a === b) return 0;
  const pa = parse(a), pb = parse(b);
  if (!pa || !pb) return null;
  const d = (pa.major - pb.major) || (pa.minor - pb.minor) || (pa.patch - pb.patch);
  if (d) return d < 0 ? -1 : 1;
  const ap = pa.pre, bp = pb.pre;
  if (!ap && !bp) return 0;
  if (!ap) return 1;
  if (!bp) return -1;
  const len = ap.length < bp.length ? ap.length : bp.length;
  for (let i = 0; i < len; i++) {
    if (ap[i] === bp[i]) continue;
    const an = typeof ap[i] === 'number', bn = typeof bp[i] === 'number';
    if (an !== bn) return an ? -1 : 1;
    return ap[i] < bp[i] ? -1 : 1;
  }
  return ap.length - bp.length;
}

export function gt(a: string, b: string): boolean {
  if (a === b) return false;
  const pa = parse(a), pb = parse(b);
  if (!pa || !pb) return false;
  const d = (pa.major - pb.major) || (pa.minor - pb.minor) || (pa.patch - pb.patch);
  if (d) return d > 0;
  const ap = pa.pre, bp = pb.pre;
  if (!ap && !bp) return false;
  if (!ap) return true;
  if (!bp) return false;
  const len = ap.length < bp.length ? ap.length : bp.length;
  for (let i = 0; i < len; i++) {
    if (ap[i] === bp[i]) continue;
    const an = typeof ap[i] === 'number', bn = typeof bp[i] === 'number';
    if (an !== bn) return !an;
    return ap[i] > bp[i];
  }
  return ap.length > bp.length;
}

export function gte(a: string, b: string): boolean {
  if (a === b) return true;
  const pa = parse(a), pb = parse(b);
  if (!pa || !pb) return false;
  const d = (pa.major - pb.major) || (pa.minor - pb.minor) || (pa.patch - pb.patch);
  if (d) return d > 0;
  const ap = pa.pre, bp = pb.pre;
  if (!ap && !bp) return true;
  if (!ap) return true;
  if (!bp) return false;
  const len = ap.length < bp.length ? ap.length : bp.length;
  for (let i = 0; i < len; i++) {
    if (ap[i] === bp[i]) continue;
    const an = typeof ap[i] === 'number', bn = typeof bp[i] === 'number';
    if (an !== bn) return !an;
    return ap[i] > bp[i];
  }
  return ap.length >= bp.length;
}

export function lt(a: string, b: string): boolean {
  if (a === b) return false;
  const pa = parse(a), pb = parse(b);
  if (!pa || !pb) return false;
  const d = (pa.major - pb.major) || (pa.minor - pb.minor) || (pa.patch - pb.patch);
  if (d) return d < 0;
  const ap = pa.pre, bp = pb.pre;
  if (!ap && !bp) return false;
  if (!ap) return false;
  if (!bp) return true;
  const len = ap.length < bp.length ? ap.length : bp.length;
  for (let i = 0; i < len; i++) {
    if (ap[i] === bp[i]) continue;
    const an = typeof ap[i] === 'number', bn = typeof bp[i] === 'number';
    if (an !== bn) return an;
    return ap[i] < bp[i];
  }
  return ap.length < bp.length;
}

export function lte(a: string, b: string): boolean {
  if (a === b) return true;
  const pa = parse(a), pb = parse(b);
  if (!pa || !pb) return false;
  const d = (pa.major - pb.major) || (pa.minor - pb.minor) || (pa.patch - pb.patch);
  if (d) return d < 0;
  const ap = pa.pre, bp = pb.pre;
  if (!ap && !bp) return true;
  if (!ap) return false;
  if (!bp) return true;
  const len = ap.length < bp.length ? ap.length : bp.length;
  for (let i = 0; i < len; i++) {
    if (ap[i] === bp[i]) continue;
    const an = typeof ap[i] === 'number', bn = typeof bp[i] === 'number';
    if (an !== bn) return an;
    return ap[i] < bp[i];
  }
  return ap.length <= bp.length;
}

export function eq(a: string, b: string): boolean {
  return compare(a, b) === 0;
}

export function neq(a: string, b: string): boolean {
  const c = compare(a, b);
  return c !== null && c !== 0;
}
