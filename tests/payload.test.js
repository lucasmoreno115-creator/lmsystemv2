import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLeadDocument } from '../src/firebase/leadValidation.js';

test('validateLeadDocument accepts valid payload', () => {
  const payload = {
    name: 'João',
    email: 'joao@example.com',
    whatsapp: '+5511988888888',
    goal: 'performance',
    lmScore: 75,
    classification: 'Avançado disciplinado',
    tags: ['avancado', 'disciplinado', 'alto_valor'],
    leadValue: 'high',
    recommendedOffer: 'presencial',
    dimensions: { adherence: 90 },
    coachSummary: 'Resumo interno',
    status: 'NEW'
  };

  assert.deepEqual(validateLeadDocument(payload), payload);
});

test('validateLeadDocument rejects invalid status', () => {
  assert.throws(() => validateLeadDocument({ status: 'OLD' }));
});
