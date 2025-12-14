import type { ReleaseType } from './types.js';
import { parse } from './parse.js';

export function inc(version: string, release: ReleaseType, preid?: string): string | null {
  const p = parse(version);
  if (!p) return null;
  const { major: M, minor: m, patch: pt, pre } = p;

  switch (release) {
    case 'major':
      return pre && m === 0 && pt === 0 ? `${M}.0.0` : `${M + 1}.0.0`;
    case 'minor':
      return pre && pt === 0 ? `${M}.${m}.0` : `${M}.${m + 1}.0`;
    case 'patch':
      return pre ? `${M}.${m}.${pt}` : `${M}.${m}.${pt + 1}`;
    case 'premajor':
      return `${M + 1}.0.0-${preid ? preid + '.0' : '0'}`;
    case 'preminor':
      return `${M}.${m + 1}.0-${preid ? preid + '.0' : '0'}`;
    case 'prepatch':
      return `${M}.${m}.${pt + 1}-${preid ? preid + '.0' : '0'}`;
    case 'prerelease':
      if (!pre) return `${M}.${m}.${pt + 1}-${preid ? preid + '.0' : '0'}`;
      const last = pre[pre.length - 1];
      if (typeof last === 'number') {
        const newPre = [...pre];
        newPre[newPre.length - 1] = (last as number) + 1;
        return `${M}.${m}.${pt}-${newPre.join('.')}`;
      }
      return `${M}.${m}.${pt}-${pre.join('.')}.0`;
  }
  return null;
}
