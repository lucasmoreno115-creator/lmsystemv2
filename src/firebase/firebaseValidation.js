import { invariant } from '../utils/guards.js';

const ALLOWED_GOALS = ['fat_loss', 'muscle_gain', 'health'];
const ALLOWED_LEAD_VALUES = ['high', 'medium', 'low'];
const ALLOWED_OFFERS = ['produto_digital', 'consultoria_online', 'presencial'];
const ALLOWED_TAGS = [
  'clinical_attention',
  'pain_or_injury',
  'low_adherence',
  'low_recovery',
  'low_nutrition_adherence',
  'high_stress',
  'low_consistency',
  'high_motivation_low_consistency',
  'high_drop_risk',
  'needs_accountability',
  'low_training_frequency',
  'good_readiness',
  'digital_product_fit',
  'ready_for_consulting'
];

function validateDimensions(dimensions) {
  invariant(dimensions && typeof dimensions === 'object', 'dimensions deve ser objeto');

  const dimensionKeys = ['adherence', 'nutrition', 'training', 'recovery', 'clinical', 'behavior'];
  for (const key of dimensionKeys) {
    invariant(typeof dimensions[key] === 'number', `dimensions.${key} deve ser number`);
    invariant(dimensions[key] >= 0 && dimensions[key] <= 100, `dimensions.${key} deve estar entre 0 e 100`);
  }
}

function validatePriority(priority) {
  invariant(priority === null || typeof priority === 'object', 'priority deve ser objeto ou null');
  if (priority === null) return;

  const allowedKeys = ['score', 'level', 'closeProbability', 'contactAction', 'reasons', 'breakdown'];
  for (const key of Object.keys(priority)) {
    invariant(allowedKeys.includes(key), `priority contém campo inválido: ${key}`);
  }

  invariant(priority.score === null || typeof priority.score === 'number', 'priority.score deve ser número ou null');
  invariant(priority.level === null || typeof priority.level === 'string', 'priority.level deve ser string ou null');
  invariant(priority.closeProbability === null || typeof priority.closeProbability === 'string', 'priority.closeProbability deve ser string ou null');
  invariant(priority.contactAction === null || typeof priority.contactAction === 'string', 'priority.contactAction deve ser string ou null');
  invariant(Array.isArray(priority.reasons), 'priority.reasons deve ser array');
  invariant(priority.reasons.every((reason) => typeof reason === 'string'), 'priority.reasons deve conter apenas strings');

  if (priority.breakdown !== undefined) {
    invariant(priority.breakdown === null || typeof priority.breakdown === 'object', 'priority.breakdown deve ser objeto ou null');
  }
}

export function validateFirestorePayload(payload) {
  const required = [
    'name', 'email', 'whatsapp', 'goal', 'lmScore', 'classification', 'tags',
    'leadValue', 'recommendedOffer', 'dimensions', 'coachSummary', 'status'
  ];

  for (const key of required) invariant(payload[key] !== undefined, `Campo ausente para Firestore: ${key}`);

  invariant(typeof payload.name === 'string' && payload.name.length >= 2, 'name inválido');
  invariant(typeof payload.email === 'string' && payload.email.includes('@'), 'email inválido');
  invariant(typeof payload.whatsapp === 'string' && payload.whatsapp.length >= 10, 'whatsapp inválido');
  invariant(ALLOWED_GOALS.includes(payload.goal), 'goal inválido');
  invariant(Number.isInteger(payload.lmScore) && payload.lmScore >= 0 && payload.lmScore <= 100, 'lmScore inválido');
  invariant(typeof payload.classification === 'string' && payload.classification.length > 0, 'classification inválida');
  invariant(Array.isArray(payload.tags), 'tags deve ser array');
  invariant(payload.tags.length <= 5, 'tags deve ter no máximo 5 itens');
  invariant(payload.tags.every((tag) => ALLOWED_TAGS.includes(tag)), 'tags contém valor inválido');
  invariant(ALLOWED_LEAD_VALUES.includes(payload.leadValue), 'leadValue inválido');
  invariant(ALLOWED_OFFERS.includes(payload.recommendedOffer), 'recommendedOffer inválido');
  validateDimensions(payload.dimensions);
  invariant(typeof payload.coachSummary === 'string' && payload.coachSummary.length > 0, 'coachSummary inválido');
  invariant(payload.status === 'NEW', 'status deve ser NEW');

  if (Object.prototype.hasOwnProperty.call(payload, 'priority')) {
    validatePriority(payload.priority);
  }
}
