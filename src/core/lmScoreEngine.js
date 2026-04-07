import { assertNumberInRange, clamp, invariant } from '../utils/guards.js';

function validateInputs(input) {
  const fields = [
    'trainingFrequency', 'trainingExperience', 'foodAdherence', 'sleepQuality',
    'stressLevel', 'painInjury', 'consistencyHistory', 'motivationLevel'
  ];
  for (const field of fields) {
    assertNumberInRange(input[field], 1, 5, field);
  }
}

export function calculateLmScore(input) {
  validateInputs(input);

  const dimensions = {
    adherence: ((input.trainingFrequency + input.consistencyHistory) / 10) * 100,
    nutrition: (input.foodAdherence / 5) * 100,
    training: ((input.trainingExperience + input.trainingFrequency) / 10) * 100,
    recovery: ((input.sleepQuality + (6 - input.stressLevel)) / 10) * 100,
    clinical: ((6 - input.painInjury) / 5) * 100,
    behavior: ((input.motivationLevel + input.consistencyHistory) / 10) * 100
  };

  const rawScore =
    dimensions.adherence * 0.2 +
    dimensions.nutrition * 0.15 +
    dimensions.training * 0.2 +
    dimensions.recovery * 0.15 +
    dimensions.clinical * 0.15 +
    dimensions.behavior * 0.15;

  const lmScore = Math.round(clamp(rawScore, 0, 100));
  invariant(Number.isInteger(lmScore) && lmScore >= 0 && lmScore <= 100, 'LM Score inválido.');

  return { lmScore, dimensions };
}
