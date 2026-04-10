import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStrategicResult } from '../src/core/lmStrategicResultResolver.js';

test('buildStrategicResult returns expected score meaning ranges', () => {
  const low = buildStrategicResult({ lmScore: 30, goal: 'fat_loss', tags: ['low_consistency'] });
  const medium = buildStrategicResult({ lmScore: 55, goal: 'muscle_gain', tags: ['high_motivation_low_consistency'] });
  const high = buildStrategicResult({ lmScore: 85, goal: 'maintenance', tags: ['good_readiness'] });

  assert.equal(low.classificationLabel, 'Base em construção');
  assert.equal(medium.classificationLabel, 'Em evolução');
  assert.equal(high.classificationLabel, 'Nível avançado');
  assert.equal(low.behaviorInsights.length, 1);
  assert.equal(medium.behaviorInsights.length, 1);
  assert.equal(high.behaviorInsights.length, 1);
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
    tags: ['good_readiness'],
    ctaHref: 'https://example.com/planos',
    ctaButtonLabel: 'Quero isso organizado'
  });

  assert.equal(result.trainingGuidance.strengthFrequencyLabel, 'Musculação: 3–5x/semana');
  assert.equal(result.trainingGuidance.cardioFrequencyLabel, 'Cardio: 2–3x/semana');
  assert.equal(result.cta.href, 'https://example.com/planos');
  assert.equal(result.cta.buttonLabel, 'Quero isso organizado');
});

test('buildStrategicResult limits behavior insights to two messages', () => {
  const result = buildStrategicResult({
    lmScore: 52,
    goal: 'fat_loss',
    tags: ['low_consistency', 'high_stress', 'needs_accountability']
  });

  assert.equal(result.behaviorInsights.length, 2);
});

test('buildStrategicResult handles pain limitation scenario', () => {
  const result = buildStrategicResult({
    lmScore: 62,
    goal: 'muscle_gain',
    tags: ['pain_limitation']
  });

  assert.match(result.behaviorInsights[0], /respeitar seu momento atual/);
  assert.match(result.tension, /ajustes de estratégia|rotina/);
});
