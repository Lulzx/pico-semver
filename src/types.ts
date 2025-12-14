export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  pre: (string | number)[] | null;
}

export type ReleaseType =
  | 'major'
  | 'minor'
  | 'patch'
  | 'premajor'
  | 'preminor'
  | 'prepatch'
  | 'prerelease';

export type Comparator = (M: number, m: number, p: number, pr: (string | number)[] | null) => boolean;
