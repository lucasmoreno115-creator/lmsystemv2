import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStrategicResult } from '../src/core/lmStrategicResultResolver.js';
import { DEFAULT_VARIANT, EXPERIMENT_KEY } from '../src/core/experiments/resultExperimentConfig.js';

test('buildStrategicResult resolves state and narrative with variant support', () => {
  const highRisk = buildStrategicResult({
    lmScore: 42,
    dimensions: { clinical: 30, adherence: 80, behavior: 75 },
    recommendedOffer: 'presencial',
    forcedVariant: 'A'
  });
  const plateau = buildStrategicResult({
    lmScore: 60,
    dimensions: { clinical: 70, adherence: 60, behavior: 70 },
    recommendedOffer: 'consultoria_online',
    forcedVariant: 'B'
  });

  assert.equal(highRisk.clientState, 'HIGH_RISK');
  assert.equal(highRisk.variant, 'A');
  assert.equal(highRisk.variantSource, 'forced');
  assert.equal(highRisk.experimentKey, EXPERIMENT_KEY);
  assert.equal(highRisk.cta.href, './planos.html#presencial');

  assert.equal(plateau.clientState, 'PLATEAU');
  assert.equal(plateau.variant, 'B');
  assert.equal(plateau.cta.href, './planos.html#consultoria-online');
});

test('buildStrategicResult preserves score classification and cta structure with fallback', () => {
  const result = buildStrategicResult({
    lmScore: 85,
    dimensions: { clinical: 80, adherence: 85, behavior: 75 },
    recommendedOffer: 'produto_digital',
    experimentEnabled: false,
    forcedVariant: 'A'
  });

  assert.equal(result.classificationLabel, 'Nível avançado');
  assert.equal(result.clientState, 'HIGH_PERFORMER');
  assert.equal(result.variant, DEFAULT_VARIANT);
  assert.equal(result.variantSource, 'disabled');
  assert.equal(result.cta.href, './planos.html#produto-digital');
  assert.ok(result.cta.supportText.length > 0);
});
