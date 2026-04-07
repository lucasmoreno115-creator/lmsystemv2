import { assertNumberInRange, invariant } from '../utils/guards.js';
import { normalizeText } from '../utils/strings.js';

export const GOALS = ['emagrecimento', 'hipertrofia', 'performance', 'saude'];

const numericFields = [
  'trainingFrequency',
  'trainingExperience',
  'foodAdherence',
  'sleepQuality',
  'stressLevel',
  'painInjury',
  'consistencyHistory',
  'motivationLevel'
];

export function parseAndValidateForm(formData) {
  const payload = {
    name: normalizeText(formData.get('name')),
    email: normalizeText(formData.get('email')).toLowerCase(),
    whatsapp: normalizeText(formData.get('whatsapp')),
    goal: normalizeText(formData.get('goal'))
  };

  invariant(payload.name.length >= 2, 'Nome inválido.');
  invariant(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email), 'E-mail inválido.');
  invariant(/^\+?[0-9\s()-]{10,20}$/.test(payload.whatsapp), 'WhatsApp inválido.');
  invariant(GOALS.includes(payload.goal), 'Objetivo inválido.');

  for (const field of numericFields) {
    const raw = Number(formData.get(field));
    assertNumberInRange(raw, 1, 5, field);
    payload[field] = raw;
  }

  return payload;
}
