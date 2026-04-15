import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendOffer } from '../src/core/lmOfferEngine.js';
import { buildLeadPriority } from '../src/core/lmLeadPriorityEngine.js';

test('recommendOffer prioritizes presencial on clinical attention', () => {
  const offer = recommendOffer({
    lmScore: 72,
    leadValue: 'high',
    dimensions: { adherence: 70, behavior: 70, recovery: 65, clinical: 28 },
    tags: ['clinical_attention']
  });

  assert.equal(offer, 'presencial');
});

test('buildLeadPriority aligns consulting readiness with high priority', () => {
  const priority = buildLeadPriority({
    lmScore: 67,
    recommendedOffer: 'consultoria_online',
    leadValue: 'medium',
    dimensions: { adherence: 65, clinical: 60 },
    tags: ['ready_for_consulting']
  });

  assert.equal(priority.priorityLevel, 'high');
  assert.equal(priority.contactAction, 'contact_today');
});
