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
    goal: 'ganho_massa_muscular',
    trainingFrequency: '4',
    trainingExperience: '3',
    foodAdherence: '4',
    sleepQuality: '4',
    stressLevel: '4',
    painInjury: '1',
    consistencyHistory: '3',
    motivationLevel: '5'
  }));

  assert.equal(payload.goal, 'muscle_gain');
  assert.equal(payload.trainingFrequency, 4);
  assert.equal(payload.stressLevel, 2);
});

test('parseAndValidateForm fails for invalid email', () => {
  assert.throws(() => parseAndValidateForm(makeFormData({
    name: 'Maria',
    email: 'bad',
    whatsapp: '+5511999999999',
    goal: 'ganho_massa_muscular',
    trainingFrequency: '4',
    trainingExperience: '3',
    foodAdherence: '4',
    sleepQuality: '4',
    stressLevel: '4',
    painInjury: '1',
    consistencyHistory: '3',
    motivationLevel: '5'
  })));
});

test('parseAndValidateForm maps UI goals to legacy objective buckets', () => {
  const payload = parseAndValidateForm(makeFormData({
    name: 'Maria',
    email: 'maria@example.com',
    whatsapp: '+5511999999999',
    goal: 'definicao_muscular',
    trainingFrequency: '3',
    trainingExperience: '3',
    foodAdherence: '3',
    sleepQuality: '3',
    stressLevel: '3',
    painInjury: '1',
    consistencyHistory: '3',
    motivationLevel: '3'
  }));

  assert.equal(payload.goal, 'fat_loss');
});

test('parseAndValidateForm keeps stress mapping compatible with score engine', () => {
  const payload = parseAndValidateForm(makeFormData({
    name: 'Maria',
    email: 'maria@example.com',
    whatsapp: '+5511999999999',
    goal: 'outro',
    trainingFrequency: '3',
    trainingExperience: '3',
    foodAdherence: '3',
    sleepQuality: '3',
    stressLevel: '1',
    painInjury: '1',
    consistencyHistory: '3',
    motivationLevel: '3'
  }));

  assert.equal(payload.stressLevel, 5);
});
