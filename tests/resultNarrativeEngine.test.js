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
  'ctaSupportText'
];

test('buildResultNarrative returns required fields for all states', () => {
  const states = ['HIGH_RISK', 'LOW_ADHERENCE', 'INCONSISTENT', 'PLATEAU', 'BEGINNER_LOST', 'HIGH_PERFORMER'];

  for (const state of states) {
    const narrative = buildResultNarrative({ clientState: state, recommendedOffer: 'consultoria_online' });

    for (const key of requiredFields) {
      assert.ok(typeof narrative[key] === 'string' && narrative[key].length > 0, `${state} should include ${key}`);
    }
  }
});

test('buildResultNarrative resolves href by offer and keeps emotional CTA label by state', () => {
  const lowAdherence = buildResultNarrative({ clientState: 'LOW_ADHERENCE', recommendedOffer: 'produto_digital' });
  const highPerformer = buildResultNarrative({ clientState: 'HIGH_PERFORMER', recommendedOffer: 'presencial' });

  assert.equal(lowAdherence.ctaLabel, 'Começar com o plano certo para mim agora');
  assert.equal(lowAdherence.ctaHref, './planos.html#produto-digital');

  assert.equal(highPerformer.ctaLabel, 'Avançar com uma estratégia no meu nível');
  assert.equal(highPerformer.ctaHref, './planos.html#presencial');
});
