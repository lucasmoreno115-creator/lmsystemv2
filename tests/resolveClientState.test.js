import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveClientState } from '../src/core/resolveClientState.js';

test('resolveClientState covers all strategic states', () => {
  assert.equal(resolveClientState({ lmScore: 30, dimensions: { clinical: 35, adherence: 70, behavior: 70 } }), 'HIGH_RISK');
  assert.equal(resolveClientState({ lmScore: 45, dimensions: { clinical: 80, adherence: 35, behavior: 45 } }), 'LOW_ADHERENCE');
  assert.equal(resolveClientState({ lmScore: 60, dimensions: { clinical: 80, adherence: 60, behavior: 45 } }), 'INCONSISTENT');
  assert.equal(resolveClientState({ lmScore: 76, dimensions: { clinical: 80, adherence: 75, behavior: 80 } }), 'HIGH_PERFORMER');
  assert.equal(resolveClientState({ lmScore: 55, dimensions: { clinical: 80, adherence: 55, behavior: 70 } }), 'PLATEAU');
  assert.equal(resolveClientState({ lmScore: 44, dimensions: { clinical: 80, adherence: 45, behavior: 55 } }), 'BEGINNER_LOST');
});

test('resolveClientState handles missing dimensions safely', () => {
  assert.equal(resolveClientState({ lmScore: 10, dimensions: {} }), 'HIGH_RISK');
});
