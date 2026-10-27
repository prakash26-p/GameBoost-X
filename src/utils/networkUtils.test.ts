import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyLatency,
  calculateJitter,
  calculateAverage,
  formatBytes,
  formatSpeed,
  getLatencyDescription
} from './networkUtils.ts';

test('classifyLatency returns correct quality categories based on spec', () => {
  assert.equal(classifyLatency(15), 'Excellent');
  assert.equal(classifyLatency(29), 'Excellent');
  assert.equal(classifyLatency(30), 'Good');
  assert.equal(classifyLatency(50), 'Good');
  assert.equal(classifyLatency(51), 'Fair');
  assert.equal(classifyLatency(100), 'Fair');
  assert.equal(classifyLatency(101), 'Poor');
  assert.equal(classifyLatency(250), 'Poor');
  assert.equal(classifyLatency(null), 'Not measured');
  assert.equal(classifyLatency(NaN), 'Not measured');
});

test('calculateJitter calculates correct average deviation between successive samples', () => {
  // Empty or single sample has 0 jitter
  assert.equal(calculateJitter([]), 0);
  assert.equal(calculateJitter([40]), 0);

  // Consecutive samples: [30, 40, 35] -> diffs: |40-30|=10, |35-40|=5. Average = 15/2 = 7.5
  assert.equal(calculateJitter([30, 40, 35]), 7.5);
});

test('calculateAverage calculates rounded arithmetic mean', () => {
  assert.equal(calculateAverage([]), 0);
  assert.equal(calculateAverage([20, 30, 40]), 30);
  assert.equal(calculateAverage([20, 25]), 23); // 22.5 rounded to 23
});

test('formatSpeed and formatBytes output consistent strings', () => {
  assert.equal(formatSpeed(null), '—');
  assert.equal(formatSpeed(45.67), '45.7 Mbps');
  assert.equal(formatSpeed(0.05), '< 0.1 Mbps');

  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 2.5), '2.5 MB');
});

test('getLatencyDescription returns appropriate advice', () => {
  assert.match(getLatencyDescription('Excellent'), /Tournament Grade/);
  assert.match(getLatencyDescription('Poor'), /High Latency/);
  assert.match(getLatencyDescription('Not measured'), /No active network measurement/);
});
