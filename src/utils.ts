import { parse } from './parse.js';
import { compare, eq } from './compare.js';

export function valid(v: string): string | null {
  const p = parse(v);
  return p
    ? p.pre
      ? `${p.major}.${p.minor}.${p.patch}-${p.pre.join('.')}`
      : `${p.major}.${p.minor}.${p.patch}`
    : null;
}

export function clean(v: string): string | null {
  return valid(v);
}

export function major(v: string): number | null {
  const p = parse(v);
  return p ? p.major : null;
}

export function minor(v: string): number | null {
  const p = parse(v);
  return p ? p.minor : null;
}

export function patch(v: string): number | null {
  const p = parse(v);
  return p ? p.patch : null;
}

export function prerelease(v: string): (string | number)[] | null {
  const p = parse(v);
  return p?.pre || null;
}

export function coerce(v: string | number): string | null {
  if (typeof v === 'number') v = String(v);
  if (typeof v !== 'string') return null;
  const match = v.match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  return match ? `${match[1]}.${match[2] || 0}.${match[3] || 0}` : null;
}

export function diff(
  a: string,
  b: string
): 'major' | 'premajor' | 'minor' | 'preminor' | 'patch' | 'prepatch' | 'prerelease' | null {
  const pa = parse(a),
    pb = parse(b);
  if (!pa || !pb || eq(a, b)) return null;
  if (pa.major !== pb.major) return pa.pre || pb.pre ? 'premajor' : 'major';
  if (pa.minor !== pb.minor) return pa.pre || pb.pre ? 'preminor' : 'minor';
  if (pa.patch !== pb.patch) return pa.pre || pb.pre ? 'prepatch' : 'patch';
  return 'prerelease';
}

export function sort(versions: string[]): string[] {
  return [...versions].sort((a, b) => {
    const c = compare(a, b);
    return c === null ? (parse(a) ? -1 : parse(b) ? 1 : 0) : c;
  });
}

export function rsort(versions: string[]): string[] {
  return [...versions].sort((a, b) => {
    const c = compare(b, a);
    return c === null ? (parse(a) ? -1 : parse(b) ? 1 : 0) : c;
  });
}
