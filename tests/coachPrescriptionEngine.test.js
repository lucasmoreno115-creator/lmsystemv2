import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCoachPrescription } from '../src/coach/coachPrescriptionEngine.js';

test('buildCoachPrescription aplica foco por clientState', () => {
  const result = buildCoachPrescription({ clientState: 'HIGH_RISK', goal: 'emagrecimento' });

  assert.match(result.strategicFocus, /Segurança/);
  assert.equal(result.trainingDirection.frequency, '3x/semana');
  assert.match(result.cardioDirection.need, /perda de gordura/i);
  assert.ok(result.alerts.some((item) => item.includes('Priorizar segurança')));
  assert.equal(result.deliveryChecklist.length >= 6, true);
});

test('buildCoachPrescription ajusta cardio quando recovery está baixo', () => {
  const result = buildCoachPrescription({
    clientState: 'PLATEAU',
    goal: 'definicao_muscular',
    dimensions: { recovery: 40 }
  });

  assert.equal(result.cardioDirection.intensity, 'Leve a moderada');
  assert.ok(result.alerts.some((item) => item.includes('recuperação abaixo do ideal')));
});
