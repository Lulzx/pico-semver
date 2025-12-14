import * as pico from './dist/index.js';
import * as semver from 'semver';

const iterations = 1_000_000;
const versions = ['1.0.0', '2.5.3', '10.20.30', '1.0.0-alpha.1', '2.0.0-beta.2+build'];
const ranges = ['^1.0.0', '>=1.0.0 <2.0.0', '~1.2.3', '1.0.0 - 2.0.0', '1.x || 2.x'];
const versionList = ['1.0.0', '1.2.0', '1.5.0', '2.0.0', '2.1.0', '3.0.0'];

function bench(name, fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  const ms = end - start;
  const ops = Math.round(iterations / (ms / 1000));
  return { name, ms: ms.toFixed(2), ops };
}

function formatOps(ops) {
  if (ops >= 1_000_000) return (ops / 1_000_000).toFixed(1) + 'M';
  if (ops >= 1_000) return (ops / 1_000).toFixed(0) + 'K';
  return ops.toString();
}

console.log(`Running ${(iterations / 1_000_000).toFixed(0)}M iterations per benchmark...\n`);

const results = [];

// parse
const picoParseResult = bench('pico parse', () => {
  for (let i = 0; i < iterations; i++) pico.parse(versions[i % versions.length]);
});
const semverParseResult = bench('semver parse', () => {
  for (let i = 0; i < iterations; i++) semver.parse(versions[i % versions.length]);
});
results.push({
  op: 'parse',
  pico: picoParseResult.ops,
  semver: semverParseResult.ops,
  speedup: (picoParseResult.ops / semverParseResult.ops).toFixed(1)
});

// compare
const picoCompareResult = bench('pico compare', () => {
  for (let i = 0; i < iterations; i++) pico.compare('1.2.3', '2.0.0');
});
const semverCompareResult = bench('semver compare', () => {
  for (let i = 0; i < iterations; i++) semver.compare('1.2.3', '2.0.0');
});
results.push({
  op: 'compare',
  pico: picoCompareResult.ops,
  semver: semverCompareResult.ops,
  speedup: (picoCompareResult.ops / semverCompareResult.ops).toFixed(1)
});

// satisfies
const picoSatisfiesResult = bench('pico satisfies', () => {
  for (let i = 0; i < iterations; i++) pico.satisfies('1.5.0', ranges[i % ranges.length]);
});
const semverSatisfiesResult = bench('semver satisfies', () => {
  for (let i = 0; i < iterations; i++) semver.satisfies('1.5.0', ranges[i % ranges.length]);
});
results.push({
  op: 'satisfies',
  pico: picoSatisfiesResult.ops,
  semver: semverSatisfiesResult.ops,
  speedup: (picoSatisfiesResult.ops / semverSatisfiesResult.ops).toFixed(1)
});

// gt
const picoGtResult = bench('pico gt', () => {
  for (let i = 0; i < iterations; i++) pico.gt('2.0.0', '1.0.0');
});
const semverGtResult = bench('semver gt', () => {
  for (let i = 0; i < iterations; i++) semver.gt('2.0.0', '1.0.0');
});
results.push({
  op: 'gt',
  pico: picoGtResult.ops,
  semver: semverGtResult.ops,
  speedup: (picoGtResult.ops / semverGtResult.ops).toFixed(1)
});

// valid
const picoValidResult = bench('pico valid', () => {
  for (let i = 0; i < iterations; i++) pico.valid(versions[i % versions.length]);
});
const semverValidResult = bench('semver valid', () => {
  for (let i = 0; i < iterations; i++) semver.valid(versions[i % versions.length]);
});
results.push({
  op: 'valid',
  pico: picoValidResult.ops,
  semver: semverValidResult.ops,
  speedup: (picoValidResult.ops / semverValidResult.ops).toFixed(1)
});

// maxSatisfying
const maxIterations = 100_000;
const picoMaxResult = bench('pico maxSatisfying', () => {
  for (let i = 0; i < maxIterations; i++) pico.maxSatisfying(versionList, '^1.0.0');
});
picoMaxResult.ops = Math.round(maxIterations / (parseFloat(picoMaxResult.ms) / 1000));
const semverMaxResult = bench('semver maxSatisfying', () => {
  for (let i = 0; i < maxIterations; i++) semver.maxSatisfying(versionList, '^1.0.0');
});
semverMaxResult.ops = Math.round(maxIterations / (parseFloat(semverMaxResult.ms) / 1000));
results.push({
  op: 'maxSatisfying',
  pico: picoMaxResult.ops,
  semver: semverMaxResult.ops,
  speedup: (picoMaxResult.ops / semverMaxResult.ops).toFixed(1)
});

// inc
const picoIncResult = bench('pico inc', () => {
  for (let i = 0; i < iterations; i++) pico.inc('1.2.3', 'minor');
});
const semverIncResult = bench('semver inc', () => {
  for (let i = 0; i < iterations; i++) semver.inc('1.2.3', 'minor');
});
results.push({
  op: 'inc',
  pico: picoIncResult.ops,
  semver: semverIncResult.ops,
  speedup: (picoIncResult.ops / semverIncResult.ops).toFixed(1)
});

// Print results
console.log('| Operation | semver | pico-semver | Speedup |');
console.log('|-----------|--------|-------------|---------|');
for (const r of results) {
  console.log(`| ${r.op.padEnd(9)} | ${formatOps(r.semver).padStart(6)} ops/s | ${formatOps(r.pico).padStart(7)} ops/s | **${r.speedup}x** |`);
}

console.log('\n');
const avgSpeedup = (results.reduce((a, r) => a + parseFloat(r.speedup), 0) / results.length).toFixed(1);
console.log(`Average speedup: ${avgSpeedup}x`);
