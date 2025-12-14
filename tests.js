import {
  parse,
  compare,
  gt,
  gte,
  lt,
  lte,
  eq,
  neq,
  satisfies,
  maxSatisfying,
  minSatisfying,
  inc,
  valid,
  clean,
  major,
  minor,
  patch,
  prerelease,
  coerce,
  diff,
  sort,
  rsort,
} from './dist/index.js';

let passed = 0;
let failed = 0;

function test(name, actual, expected) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL: ${name}`);
    console.log(`  Expected: ${expectedStr}`);
    console.log(`  Actual:   ${actualStr}`);
  }
}

function section(name) {
  console.log(`\n--- ${name} ---`);
}

section('parse');
test('parse valid', parse('1.2.3'), { major: 1, minor: 2, patch: 3, pre: null });
test('parse with v prefix', parse('v1.2.3'), { major: 1, minor: 2, patch: 3, pre: null });
test('parse with V prefix', parse('V1.2.3'), { major: 1, minor: 2, patch: 3, pre: null });
test('parse with = prefix', parse('=1.2.3'), { major: 1, minor: 2, patch: 3, pre: null });
test('parse with spaces', parse('  1.2.3  '), { major: 1, minor: 2, patch: 3, pre: null });
test('parse prerelease', parse('1.2.3-alpha'), { major: 1, minor: 2, patch: 3, pre: ['alpha'] });
test('parse prerelease numeric', parse('1.2.3-0'), { major: 1, minor: 2, patch: 3, pre: [0] });
test('parse prerelease mixed', parse('1.2.3-alpha.1'), { major: 1, minor: 2, patch: 3, pre: ['alpha', 1] });
test('parse with build', parse('1.2.3+build'), { major: 1, minor: 2, patch: 3, pre: null });
test('parse prerelease with build', parse('1.2.3-alpha+build'), { major: 1, minor: 2, patch: 3, pre: ['alpha'] });
test('parse invalid empty', parse(''), null);
test('parse invalid string', parse('invalid'), null);
test('parse invalid leading zero major', parse('01.2.3'), null);
test('parse invalid leading zero minor', parse('1.02.3'), null);
test('parse invalid leading zero patch', parse('1.2.03'), null);
test('parse invalid leading zero prerelease', parse('1.2.3-01'), null);
test('parse invalid non-string', parse(123), null);

section('compare');
test('compare equal', compare('1.2.3', '1.2.3'), 0);
test('compare less major', compare('1.0.0', '2.0.0'), -1);
test('compare greater major', compare('2.0.0', '1.0.0'), 1);
test('compare less minor', compare('1.1.0', '1.2.0'), -1);
test('compare greater minor', compare('1.2.0', '1.1.0'), 1);
test('compare less patch', compare('1.2.1', '1.2.2'), -1);
test('compare greater patch', compare('1.2.2', '1.2.1'), 1);
test('compare prerelease less than release', compare('1.0.0-alpha', '1.0.0'), -1);
test('compare prerelease order', compare('1.0.0-alpha', '1.0.0-beta'), -1);
test('compare prerelease numeric', compare('1.0.0-1', '1.0.0-2'), -1);
test('compare prerelease mixed', compare('1.0.0-alpha.1', '1.0.0-alpha.2'), -1);
test('compare invalid', compare('invalid', '1.0.0'), null);
test('compare same string', compare('1.0.0', '1.0.0'), 0);

section('comparison operators');
test('gt true', gt('2.0.0', '1.0.0'), true);
test('gt false', gt('1.0.0', '2.0.0'), false);
test('gt equal', gt('1.0.0', '1.0.0'), false);
test('gt invalid', gt('invalid', '1.0.0'), false);

test('gte true greater', gte('2.0.0', '1.0.0'), true);
test('gte true equal', gte('1.0.0', '1.0.0'), true);
test('gte false', gte('1.0.0', '2.0.0'), false);
test('gte invalid', gte('invalid', '1.0.0'), false);

test('lt true', lt('1.0.0', '2.0.0'), true);
test('lt false', lt('2.0.0', '1.0.0'), false);
test('lt equal', lt('1.0.0', '1.0.0'), false);
test('lt invalid', lt('invalid', '1.0.0'), false);

test('lte true less', lte('1.0.0', '2.0.0'), true);
test('lte true equal', lte('1.0.0', '1.0.0'), true);
test('lte false', lte('2.0.0', '1.0.0'), false);
test('lte invalid', lte('invalid', '1.0.0'), false);

test('eq true', eq('1.0.0', '1.0.0'), true);
test('eq false', eq('1.0.0', '2.0.0'), false);
test('eq invalid', eq('invalid', '1.0.0'), false);

test('neq true', neq('1.0.0', '2.0.0'), true);
test('neq false', neq('1.0.0', '1.0.0'), false);
test('neq invalid', neq('invalid', '1.0.0'), false);

section('satisfies');
test('satisfies exact', satisfies('1.2.3', '1.2.3'), true);
test('satisfies exact no match', satisfies('1.2.4', '1.2.3'), false);
test('satisfies gt', satisfies('2.0.0', '>1.0.0'), true);
test('satisfies gt no match', satisfies('1.0.0', '>1.0.0'), false);
test('satisfies gte', satisfies('1.0.0', '>=1.0.0'), true);
test('satisfies lt', satisfies('0.9.0', '<1.0.0'), true);
test('satisfies lte', satisfies('1.0.0', '<=1.0.0'), true);
test('satisfies caret', satisfies('1.5.0', '^1.0.0'), true);
test('satisfies caret no match', satisfies('2.0.0', '^1.0.0'), false);
test('satisfies tilde', satisfies('1.2.5', '~1.2.0'), true);
test('satisfies tilde no match', satisfies('1.3.0', '~1.2.0'), false);
test('satisfies or', satisfies('2.0.0', '1.0.0 || 2.0.0'), true);
test('satisfies hyphen', satisfies('1.5.0', '1.0.0 - 2.0.0'), true);
test('satisfies hyphen no match', satisfies('2.5.0', '1.0.0 - 2.0.0'), false);
test('satisfies wildcard', satisfies('1.2.3', '*'), true);
test('satisfies range', satisfies('1.5.0', '>=1.0.0 <2.0.0'), true);
test('satisfies prerelease gt', satisfies('1.0.0', '>1.0.0-alpha'), true);
test('satisfies prerelease lt', satisfies('1.0.0-alpha', '<1.0.0'), true);
test('satisfies hyphen prerelease upper', satisfies('2.0.0', '1.0.0 - 2.0.0-alpha'), false);
test('satisfies hyphen prerelease lower', satisfies('1.0.0-alpha', '1.0.0-alpha - 2.0.0'), true);
test('satisfies invalid version', satisfies('invalid', '^1.0.0'), false);

section('maxSatisfying');
test('maxSatisfying basic', maxSatisfying(['1.0.0', '1.5.0', '2.0.0'], '^1.0.0'), '1.5.0');
test('maxSatisfying with prerelease', maxSatisfying(['1.0.0-alpha', '1.0.0', '1.0.0-beta'], '>=1.0.0-alpha'), '1.0.0');
test('maxSatisfying no match', maxSatisfying(['1.0.0', '1.5.0'], '^2.0.0'), null);
test('maxSatisfying empty', maxSatisfying([], '^1.0.0'), null);

section('minSatisfying');
test('minSatisfying basic', minSatisfying(['1.0.0', '1.5.0', '2.0.0'], '^1.0.0'), '1.0.0');
test('minSatisfying with prerelease', minSatisfying(['1.0.0-alpha', '1.0.0', '1.0.0-beta'], '>=1.0.0-alpha'), '1.0.0-alpha');
test('minSatisfying no match', minSatisfying(['1.0.0', '1.5.0'], '^2.0.0'), null);

section('inc');
test('inc major', inc('1.2.3', 'major'), '2.0.0');
test('inc minor', inc('1.2.3', 'minor'), '1.3.0');
test('inc patch', inc('1.2.3', 'patch'), '1.2.4');
test('inc patch on prerelease', inc('1.2.3-alpha', 'patch'), '1.2.3');
test('inc premajor', inc('1.2.3', 'premajor'), '2.0.0-0');
test('inc preminor', inc('1.2.3', 'preminor'), '1.3.0-0');
test('inc prepatch', inc('1.2.3', 'prepatch'), '1.2.4-0');
test('inc premajor with preid', inc('1.2.3', 'premajor', 'alpha'), '2.0.0-alpha.0');
test('inc preminor with preid', inc('1.2.3', 'preminor', 'alpha'), '1.3.0-alpha.0');
test('inc prepatch with preid', inc('1.2.3', 'prepatch', 'alpha'), '1.2.4-alpha.0');
test('inc prerelease', inc('1.2.3', 'prerelease'), '1.2.4-0');
test('inc prerelease with preid', inc('1.2.3', 'prerelease', 'alpha'), '1.2.4-alpha.0');
test('inc prerelease on prerelease', inc('1.2.3-alpha.1', 'prerelease'), '1.2.3-alpha.2');
test('inc prerelease on string prerelease', inc('1.2.3-alpha', 'prerelease'), '1.2.3-alpha.0');
test('inc major on prerelease', inc('1.0.0-alpha', 'major'), '1.0.0');
test('inc minor on prerelease', inc('1.1.0-alpha', 'minor'), '1.1.0');
test('inc major on prerelease not at boundary', inc('1.2.3-alpha', 'major'), '2.0.0');
test('inc invalid', inc('invalid', 'major'), null);

section('valid');
test('valid basic', valid('1.2.3'), '1.2.3');
test('valid with v', valid('v1.2.3'), '1.2.3');
test('valid with prerelease', valid('1.2.3-alpha'), '1.2.3-alpha');
test('valid with build strips build', valid('1.2.3+build'), '1.2.3');
test('valid invalid', valid('invalid'), null);

section('clean');
test('clean basic', clean('  v1.2.3  '), '1.2.3');
test('clean invalid', clean('invalid'), null);

section('major/minor/patch/prerelease');
test('major', major('1.2.3'), 1);
test('minor', minor('1.2.3'), 2);
test('patch', patch('1.2.3'), 3);
test('prerelease', prerelease('1.2.3-alpha.1'), ['alpha', 1]);
test('prerelease none', prerelease('1.2.3'), null);
test('major invalid', major('invalid'), null);
test('minor invalid', minor('invalid'), null);
test('patch invalid', patch('invalid'), null);

section('coerce');
test('coerce basic', coerce('1.2.3'), '1.2.3');
test('coerce partial', coerce('1.2'), '1.2.0');
test('coerce major only', coerce('1'), '1.0.0');
test('coerce from text', coerce('v1.2.3-alpha'), '1.2.3');
test('coerce number', coerce(42), '42.0.0');
test('coerce invalid', coerce('abc'), null);

section('diff');
test('diff major', diff('1.0.0', '2.0.0'), 'major');
test('diff minor', diff('1.0.0', '1.1.0'), 'minor');
test('diff patch', diff('1.0.0', '1.0.1'), 'patch');
test('diff prerelease', diff('1.0.0-alpha', '1.0.0-beta'), 'prerelease');
test('diff premajor', diff('1.0.0-alpha', '2.0.0'), 'premajor');
test('diff preminor', diff('1.0.0-alpha', '1.1.0'), 'preminor');
test('diff prepatch', diff('1.0.0-alpha', '1.0.1'), 'prepatch');
test('diff same', diff('1.0.0', '1.0.0'), null);
test('diff invalid', diff('invalid', '1.0.0'), null);

section('sort');
test('sort basic', sort(['2.0.0', '1.0.0', '1.5.0']), ['1.0.0', '1.5.0', '2.0.0']);
test('sort with prerelease', sort(['1.0.0', '1.0.0-alpha', '1.0.0-beta']), ['1.0.0-alpha', '1.0.0-beta', '1.0.0']);
test('sort with invalid', sort(['2.0.0', 'invalid', '1.0.0']), ['1.0.0', '2.0.0', 'invalid']);

section('rsort');
test('rsort basic', rsort(['1.0.0', '2.0.0', '1.5.0']), ['2.0.0', '1.5.0', '1.0.0']);
test('rsort with invalid', rsort(['2.0.0', 'invalid', '1.0.0']), ['2.0.0', '1.0.0', 'invalid']);

section('cache mutation regression');
test('inc does not mutate cache', (() => {
  parse('1.0.0-beta.1');
  inc('1.0.0-beta.1', 'prerelease');
  return parse('1.0.0-beta.1').pre;
})(), ['beta', 1]);

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
