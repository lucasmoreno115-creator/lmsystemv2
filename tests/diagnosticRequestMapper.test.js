import test from 'node:test';
import assert from 'node:assert/strict';
import { mapUserInputToDiagnosticRequest } from '../src/ui/diagnosticRequestMapper.js';

test('mapUserInputToDiagnosticRequest builds remote contract payload', () => {
  const payload = mapUserInputToDiagnosticRequest({
    name: 'Ana',
    email: 'ana@example.com',
    whatsapp: '+5511911111111',
    goal: 'fat_loss',
    trainingFrequency: 4,
    trainingExperience: 2,
    foodAdherence: 3,
    sleepQuality: 4,
    stressLevel: 2,
    painInjury: 1,
    consistencyHistory: 3,
    motivationLevel: 5
  }, { variant: 'B' });

  assert.deepEqual(payload, {
    lead: {
      name: 'Ana',
      email: 'ana@example.com',
      whatsapp: '+5511911111111',
      goal: 'fat_loss'
    },
    answers: {
      trainingFrequency: 4,
      trainingExperience: 2,
      sleepQuality: 4,
      stressLevel: 2,
      painInjury: 1,
      nutritionConsistency: 3,
      foodAdherence: 3,
      routineStability: 3,
      consistencyHistory: 3,
      motivation: 5,
      motivationLevel: 5
    },
    meta: {
      source: 'diagnostic_form',
      variant: 'B'
    }
  });
});
