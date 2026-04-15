import { assertNumberInRange, invariant } from '../utils/guards.js';
import { normalizeText } from '../utils/strings.js';

export const GOALS = [
  'emagrecimento',
  'definicao_muscular',
  'ganho_massa_muscular',
  'saude_condicionamento',
  'outro'
];

const CANONICAL_GOAL_BY_UI_GOAL = {
  emagrecimento: 'fat_loss',
  definicao_muscular: 'fat_loss',
  ganho_massa_muscular: 'muscle_gain',
  saude_condicionamento: 'health',
  outro: 'health'
};

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
  const uiGoal = normalizeText(formData.get('goal'));

  const payload = {
    name: normalizeText(formData.get('name')),
    email: normalizeText(formData.get('email')).toLowerCase(),
    whatsapp: normalizeText(formData.get('whatsapp')),
    goal: CANONICAL_GOAL_BY_UI_GOAL[uiGoal]
  };

  invariant(payload.name.length >= 2, 'Nome inválido.');
  invariant(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email), 'E-mail inválido.');
  invariant(/^\+?[0-9\s()-]{10,20}$/.test(payload.whatsapp), 'WhatsApp inválido.');
  invariant(GOALS.includes(uiGoal), 'Objetivo inválido.');

  for (const field of numericFields) {
    const raw = Number(formData.get(field));
    assertNumberInRange(raw, 1, 5, field);
    payload[field] = raw;
  }

  return payload;
}
