import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLmScore } from '../src/core/lmScoreEngine.js';

test('calculateLmScore returns integer score and dimensions', () => {
  const result = calculateLmScore({
    trainingFrequency: 4,
    trainingExperience: 3,
    foodAdherence: 4,
    sleepQuality: 3,
    stressLevel: 2,
    painInjury: 1,
    consistencyHistory: 4,
    motivationLevel: 5
  });

  assert.equal(Number.isInteger(result.lmScore), true);
  assert.equal(result.lmScore >= 0 && result.lmScore <= 100, true);
  assert.equal(typeof result.dimensions.adherence, 'number');
});

test('calculateLmScore throws on invalid input', () => {
  assert.throws(() => calculateLmScore({ trainingFrequency: 10 }));
});
