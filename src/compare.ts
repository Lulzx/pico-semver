import type { SemVer } from './types.js';
import { parse } from './parse.js';

export function cmpPre(a: (string | number)[] | null, b: (string | number)[] | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const len = a.length < b.length ? a.length : b.length;
  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) continue;
    const an = typeof a[i] === 'number',
      bn = typeof b[i] === 'number';
    if (an !== bn) return an ? -1 : 1;
    return a[i] < b[i] ? -1 : 1;
  }
  return a.length - b.length;
}

export function cmpVer(a: SemVer, b: SemVer): number {
  const d = (a.major - b.major) || (a.minor - b.minor) || (a.patch - b.patch);
  if (d) return d < 0 ? -1 : 1;
  return cmpPre(a.pre, b.pre);
}

export function compare(a: string, b: string): number | null {
  if (a === b) return 0;
  const pa = parse(a),
    pb = parse(b);
  if (!pa || !pb) return null;
  const d = (pa.major - pb.major) || (pa.minor - pb.minor) || (pa.patch - pb.patch);
  if (d) return d < 0 ? -1 : 1;
  return cmpPre(pa.pre, pb.pre);
}

export const gt = (a: string, b: string): boolean => compare(a, b) === 1;

export const gte = (a: string, b: string): boolean => {
  const c = compare(a, b);
  return c !== null && c >= 0;
};

export const lt = (a: string, b: string): boolean => compare(a, b) === -1;

export const lte = (a: string, b: string): boolean => {
  const c = compare(a, b);
  return c !== null && c <= 0;
};

export const eq = (a: string, b: string): boolean => compare(a, b) === 0;

export const neq = (a: string, b: string): boolean => {
  const c = compare(a, b);
  return c !== null && c !== 0;
};
