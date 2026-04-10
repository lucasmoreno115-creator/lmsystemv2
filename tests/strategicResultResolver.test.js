import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStrategicResult } from '../src/core/lmStrategicResultResolver.js';

test('buildStrategicResult returns expected score meaning ranges', () => {
  const low = buildStrategicResult({ lmScore: 30, goal: 'fat_loss', tags: [] });
  const medium = buildStrategicResult({ lmScore: 55, goal: 'muscle_gain', tags: [] });
  const high = buildStrategicResult({ lmScore: 85, goal: 'maintenance', tags: [] });

  assert.equal(low.classificationLabel, 'Base em construção');
  assert.equal(medium.classificationLabel, 'Em evolução');
  assert.equal(high.classificationLabel, 'Nível avançado');
  assert.match(low.tensionText, /sair do lugar/);
  assert.match(medium.tensionText, /mais lenta e instável/);
  assert.match(high.tensionText, /continuar evoluindo sem estagnar/);
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
    lmScore: 50,
    goal: 'muscle_gain',
    tags: ['pain_limitation']
  });

  assert.match(result.tensionText, /intensificar sem ajustar a base/);
  assert.equal(result.cta.buttonLabel, 'Quero uma estratégia mais segura');
});

test('buildStrategicResult uses low_consistency tension and CTA for score 48', () => {
  const result = buildStrategicResult({
    lmScore: 48,
    goal: 'fat_loss',
    tags: ['low_consistency']
  });

  assert.match(result.tensionText, /rotina que encaixe de verdade/);
  assert.equal(result.cta.title, 'Seu próximo passo é criar uma rotina possível de manter');
  assert.equal(result.cta.buttonLabel, 'Quero mais consistência');
});

test('buildStrategicResult uses high motivation low consistency tension and CTA for score 55', () => {
  const result = buildStrategicResult({
    lmScore: 55,
    goal: 'fat_loss',
    tags: ['high_motivation_low_consistency']
  });

  assert.match(result.tensionText, /estrutura que ajude essa motivação/);
  assert.equal(result.cta.title, 'Seu próximo passo é transformar motivação em constância');
  assert.equal(result.cta.buttonLabel, 'Quero manter isso na prática');
});

test('buildStrategicResult uses good readiness tension and CTA for score 72', () => {
  const result = buildStrategicResult({
    lmScore: 72,
    goal: 'muscle_gain',
    tags: ['good_readiness']
  });

  assert.match(result.tensionText, /potencial pode continuar sendo desperdiçada/);
  assert.equal(result.cta.title, 'Seu próximo passo é aproveitar melhor seu potencial');
  assert.equal(result.cta.buttonLabel, 'Quero otimizar meu resultado');
});
