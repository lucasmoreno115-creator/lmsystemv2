import { invariant } from '../utils/guards.js';

export function validateFirestorePayload(payload) {
  const required = [
    'name', 'email', 'whatsapp', 'goal', 'lmScore', 'classification', 'tags',
    'leadValue', 'recommendedOffer', 'dimensions', 'coachSummary', 'status'
  ];

  for (const key of required) invariant(payload[key] !== undefined, `Campo ausente para Firestore: ${key}`);
  invariant(payload.status === 'NEW', 'status deve ser NEW');
  invariant(Array.isArray(payload.tags), 'tags deve ser array');
  invariant(payload.tags.length <= 5, 'tags deve ter no máximo 5 itens');
}
