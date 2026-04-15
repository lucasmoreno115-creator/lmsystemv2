import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStrategicResult } from '../src/core/lmStrategicResultResolver.js';

test('buildStrategicResult resolves state and premium narrative based on dimensions', () => {
  const highRisk = buildStrategicResult({
    lmScore: 42,
    dimensions: { clinical: 30, adherence: 80, behavior: 75 },
    recommendedOffer: 'presencial'
  });
  const plateau = buildStrategicResult({
    lmScore: 60,
    dimensions: { clinical: 70, adherence: 60, behavior: 70 },
    recommendedOffer: 'consultoria_online'
  });

  assert.equal(highRisk.clientState, 'HIGH_RISK');
  assert.match(highRisk.diagnosis, /segurança, controle e ajuste/);
  assert.equal(highRisk.cta.href, './planos.html#presencial');

  assert.equal(plateau.clientState, 'PLATEAU');
  assert.match(plateau.strategicDirection, /estratégia melhor ajustada/);
  assert.equal(plateau.cta.href, './planos.html#consultoria-online');
});

test('buildStrategicResult preserves score classification and cta structure', () => {
  const result = buildStrategicResult({
    lmScore: 85,
    dimensions: { clinical: 80, adherence: 85, behavior: 75 },
    recommendedOffer: 'produto_digital'
  });

  assert.equal(result.classificationLabel, 'Nível avançado');
  assert.equal(result.clientState, 'HIGH_PERFORMER');
  assert.equal(result.cta.buttonLabel, 'Avançar com uma estratégia no meu nível');
  assert.equal(result.cta.href, './planos.html#produto-digital');
  assert.ok(result.cta.supportText.length > 0);
});
