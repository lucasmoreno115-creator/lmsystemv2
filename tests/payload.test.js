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
    priority: {
      score: 80,
      level: 'high',
      closeProbability: 'high',
      contactAction: 'contact_today',
      reasons: ['fit de consultoria']
    },
    coachSummary: 'Resumo interno',
    status: 'NEW'
  };

  assert.deepEqual(validateLeadDocument(payload), payload);
});

test('validateLeadDocument rejects invalid status', () => {
  assert.throws(() => validateLeadDocument({ status: 'OLD' }));
});

test('validateLeadDocument rejects invalid priority payload', () => {
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
    priority: {
      score: null,
      level: 'high',
      closeProbability: 'high',
      contactAction: 'contact_today',
      reasons: [123]
    },
    coachSummary: 'Resumo interno',
    status: 'NEW'
  };

  assert.throws(() => validateLeadDocument(payload));
});
