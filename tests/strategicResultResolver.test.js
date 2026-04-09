import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStrategicResult } from '../src/core/lmStrategicResultResolver.js';

test('buildStrategicResult returns expected score meaning ranges', () => {
  const low = buildStrategicResult({ lmScore: 30, goal: 'fat_loss' });
  const medium = buildStrategicResult({ lmScore: 55, goal: 'muscle_gain' });
  const high = buildStrategicResult({ lmScore: 85, goal: 'maintenance' });

  assert.match(low.scoreMeaningText, /cenário/);
  assert.match(medium.scoreMeaningText, /pontos positivos/);
  assert.match(high.scoreMeaningText, /base muito boa/);
});

test('buildStrategicResult keeps nutritional ranges qualitative by default', () => {
  const result = buildStrategicResult({ lmScore: 65, goal: 'fat_loss' });
  assert.equal(result.nutritionGuidance.kcalRangeLabel, null);
  assert.equal(result.nutritionGuidance.proteinRangeLabel, null);
});

test('buildStrategicResult sets training chips and configurable CTA link', () => {
  const result = buildStrategicResult({
    lmScore: 70,
    goal: 'muscle_gain',
    ctaHref: 'https://example.com/planos',
    ctaButtonLabel: 'Quero isso organizado'
  });

  assert.equal(result.trainingGuidance.strengthFrequencyLabel, 'Musculação: 3–5x/semana');
  assert.equal(result.trainingGuidance.cardioFrequencyLabel, 'Cardio: 2–3x/semana');
  assert.equal(result.cta.href, 'https://example.com/planos');
  assert.equal(result.cta.buttonLabel, 'Quero isso organizado');
});
