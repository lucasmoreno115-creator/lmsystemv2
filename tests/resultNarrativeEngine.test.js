import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResultNarrative } from '../src/core/resultNarrativeEngine.js';

const requiredFields = [
  'eyebrow',
  'title',
  'diagnosis',
  'explanation',
  'beliefBreak',
  'consequence',
  'strategicDirection',
  'bridge',
  'ctaLabel',
  'ctaHref',
  'ctaSupportText',
  'variant'
];

test('buildResultNarrative returns required fields for all states in both variants', () => {
  const states = ['HIGH_RISK', 'LOW_ADHERENCE', 'INCONSISTENT', 'PLATEAU', 'BEGINNER_LOST', 'HIGH_PERFORMER'];

  for (const state of states) {
    for (const variant of ['A', 'B']) {
      const narrative = buildResultNarrative({
        clientState: state,
        variant,
        recommendedOffer: 'consultoria_online'
      });

      for (const key of requiredFields) {
        assert.ok(
          typeof narrative[key] === 'string' && narrative[key].length > 0,
          `${state}/${variant} should include ${key}`
        );
      }
    }
  }
});

test('buildResultNarrative keeps clientState specificity and offer CTA href by variant', () => {
  const lowAdherenceA = buildResultNarrative({
    clientState: 'LOW_ADHERENCE',
    variant: 'A',
    recommendedOffer: 'produto_digital'
  });
  const lowAdherenceB = buildResultNarrative({
    clientState: 'LOW_ADHERENCE',
    variant: 'B',
    recommendedOffer: 'produto_digital'
  });

  assert.notEqual(lowAdherenceA.diagnosis, lowAdherenceB.diagnosis);
  assert.match(lowAdherenceA.ctaLabel, /agora|corrigir|jogo/i);
  assert.match(lowAdherenceB.ctaLabel, /plano|momento|organizar/i);
  assert.equal(lowAdherenceA.ctaHref, './planos.html#produto-digital');
  assert.equal(lowAdherenceB.ctaHref, './planos.html#produto-digital');
});
