import { invariant } from '../utils/guards.js';

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
  invariant(payload.status === 'NEW', 'status deve ser NEW');
  invariant(Array.isArray(payload.tags), 'tags deve ser array');
  invariant(payload.tags.length <= 5, 'tags deve ter no máximo 5 itens');

  if (Object.prototype.hasOwnProperty.call(payload, 'priority')) {
    validatePriority(payload.priority);
  }
}
