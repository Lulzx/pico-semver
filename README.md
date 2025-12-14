# pico-semver

Tiny, fast semver parsing and comparison. Drop-in replacement for `semver`.

## Features

- **Fast**: Up to 37x faster than `semver`
- **Tiny**: Zero dependencies, 6.4 kB gzipped
- **Tree-shakeable**: Modular ESM with subpath exports
- **TypeScript**: Full type definitions included

## Performance

| Operation | semver | pico-semver | Speedup |
|-----------|--------|-------------|---------|
| `parse` | 6M ops/s | 184M ops/s | **30x** |
| `compare` | 7M ops/s | 106M ops/s | **15x** |
| `satisfies` | 2.4M ops/s | 66M ops/s | **28x** |
| `gt` | 7M ops/s | 109M ops/s | **15x** |
| `valid` | 6M ops/s | 225M ops/s | **37x** |
| `maxSatisfying` | 700K ops/s | 19M ops/s | **28x** |
| `inc` | 11M ops/s | 64M ops/s | **6x** |

Run `node benchmark.js` to reproduce.

## Install

```
npm install pico-semver
```

## Usage

```js
import { parse, satisfies, compare, gt, lt, maxSatisfying } from 'pico-semver';

parse('1.2.3');           // { major: 1, minor: 2, patch: 3, pre: null }
satisfies('1.5.0', '^1.0.0');  // true
compare('1.2.3', '1.2.4');     // -1
gt('2.0.0', '1.0.0');          // true
maxSatisfying(['1.0.0', '1.5.0', '2.0.0'], '^1.0.0');  // '1.5.0'
```

## Tree-Shaking

Import only what you need for smaller bundles:

```js
import { parse } from 'pico-semver/parse';
import { satisfies } from 'pico-semver/range';
import { compare, gt, lt } from 'pico-semver/compare';
import { inc } from 'pico-semver/inc';
import { valid, coerce, sort } from 'pico-semver/utils';
```

## API

### Parsing

- `parse(version)` - Parse a version string into `{ major, minor, patch, pre }`
- `valid(version)` - Return cleaned version string or `null`
- `clean(version)` - Alias for `valid()`
- `coerce(version)` - Coerce a string or number to a valid semver

### Comparison

- `compare(a, b)` - Returns `-1`, `0`, `1`, or `null` for invalid
- `gt(a, b)` - `a > b`
- `gte(a, b)` - `a >= b`
- `lt(a, b)` - `a < b`
- `lte(a, b)` - `a <= b`
- `eq(a, b)` - `a === b`
- `neq(a, b)` - `a !== b`

### Ranges

- `satisfies(version, range)` - Check if version satisfies range
- `maxSatisfying(versions, range)` - Find highest matching version
- `minSatisfying(versions, range)` - Find lowest matching version

Supported range syntax:
- Exact: `1.2.3`
- Comparators: `>1.0.0`, `>=1.0.0`, `<2.0.0`, `<=2.0.0`
- Caret: `^1.2.3` (compatible with version)
- Tilde: `~1.2.3` (patch-level changes)
- Hyphen: `1.0.0 - 2.0.0`
- OR: `1.x || 2.x`
- Wildcard: `*`, `x`, `X`

### Increment

- `inc(version, release, preid?)` - Increment version by release type

Release types: `major`, `minor`, `patch`, `premajor`, `preminor`, `prepatch`, `prerelease`

```js
inc('1.2.3', 'major');           // '2.0.0'
inc('1.2.3', 'minor');           // '1.3.0'
inc('1.2.3', 'patch');           // '1.2.4'
inc('1.2.3', 'prerelease', 'alpha');  // '1.2.4-alpha.0'
inc('1.0.0-alpha.1', 'prerelease');   // '1.0.0-alpha.2'
```

### Utilities

- `major(version)` - Extract major version
- `minor(version)` - Extract minor version
- `patch(version)` - Extract patch version
- `prerelease(version)` - Extract prerelease array or `null`
- `diff(a, b)` - Returns difference type or `null`
- `sort(versions)` - Sort versions ascending
- `rsort(versions)` - Sort versions descending

## Types

```ts
interface SemVer {
  major: number;
  minor: number;
  patch: number;
  pre: (string | number)[] | null;
}

type ReleaseType = 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease';
```

## License

MIT
