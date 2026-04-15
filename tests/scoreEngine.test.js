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

test('calculateLmScore inverts stress only in score engine', () => {
  const lowStress = calculateLmScore({
    trainingFrequency: 3,
    trainingExperience: 3,
    foodAdherence: 3,
    sleepQuality: 3,
    stressLevel: 5,
    painInjury: 2,
    consistencyHistory: 3,
    motivationLevel: 3
  });

  const highStress = calculateLmScore({
    trainingFrequency: 3,
    trainingExperience: 3,
    foodAdherence: 3,
    sleepQuality: 3,
    stressLevel: 1,
    painInjury: 2,
    consistencyHistory: 3,
    motivationLevel: 3
  });

  assert.ok(lowStress.dimensions.recovery < highStress.dimensions.recovery);
});

test('calculateLmScore treats higher clinical dimension as better', () => {
  const noPain = calculateLmScore({
    trainingFrequency: 3,
    trainingExperience: 3,
    foodAdherence: 3,
    sleepQuality: 3,
    stressLevel: 3,
    painInjury: 1,
    consistencyHistory: 3,
    motivationLevel: 3
  });

  const highPain = calculateLmScore({
    trainingFrequency: 3,
    trainingExperience: 3,
    foodAdherence: 3,
    sleepQuality: 3,
    stressLevel: 3,
    painInjury: 5,
    consistencyHistory: 3,
    motivationLevel: 3
  });

  assert.ok(noPain.dimensions.clinical > highPain.dimensions.clinical);
});

test('calculateLmScore throws on invalid input', () => {
  assert.throws(() => calculateLmScore({ trainingFrequency: 10 }));
});
