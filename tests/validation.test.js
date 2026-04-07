import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateForm } from '../src/ui/validation.js';

function makeFormData(map) {
  return { get: (key) => map[key] };
}

test('parseAndValidateForm validates and parses payload', () => {
  const payload = parseAndValidateForm(makeFormData({
    name: 'Maria',
    email: 'maria@example.com',
    whatsapp: '+5511999999999',
    goal: 'hipertrofia',
    trainingFrequency: '4',
    trainingExperience: '3',
    foodAdherence: '4',
    sleepQuality: '4',
    stressLevel: '2',
    painInjury: '1',
    consistencyHistory: '3',
    motivationLevel: '5'
  }));

  assert.equal(payload.goal, 'hipertrofia');
  assert.equal(payload.trainingFrequency, 4);
});

test('parseAndValidateForm fails for invalid email', () => {
  assert.throws(() => parseAndValidateForm(makeFormData({
    name: 'Maria',
    email: 'bad',
    whatsapp: '+5511999999999',
    goal: 'hipertrofia',
    trainingFrequency: '4',
    trainingExperience: '3',
    foodAdherence: '4',
    sleepQuality: '4',
    stressLevel: '2',
    painInjury: '1',
    consistencyHistory: '3',
    motivationLevel: '5'
  })));
});
