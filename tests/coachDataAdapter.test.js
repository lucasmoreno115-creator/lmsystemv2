import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptCoachData } from '../src/coach/coachDataAdapter.js';

test('adaptCoachData normaliza payload completo', () => {
  const adapted = adaptCoachData({
    rawResult: {
      lmScore: 62,
      classification: 'Em evolução',
      tags: ['needs_accountability'],
      leadPayload: {
        name: 'Ana',
        email: 'ana@mail.com',
        whatsapp: '+5511999999999',
        goal: 'emagrecimento',
        recommendedOffer: 'consultoria_online',
        priority: { level: 'high' },
        dimensions: { clinical: 70, adherence: 30, behavior: 40 }
      }
    },
    rawInput: { name: 'Ana' },
    rawTimestamp: String(Date.parse('2026-01-10T10:00:00Z')),
    selectedPlan: 'LM Premium Coach'
  });

  assert.equal(adapted.hasData, true);
  assert.equal(adapted.student.name, 'Ana');
  assert.equal(adapted.diagnosis.clientState, 'LOW_ADHERENCE');
  assert.equal(adapted.context.selectedPlan, 'LM Premium Coach');
});

test('adaptCoachData tolera ausência parcial', () => {
  const adapted = adaptCoachData({ rawInput: { name: 'Sem resultado', goal: 'outro' } });

  assert.equal(adapted.hasData, true);
  assert.equal(adapted.student.name, 'Sem resultado');
  assert.equal(adapted.diagnosis.goal, 'outro');
  assert.equal(adapted.diagnosis.classification, 'Não classificado');
});

test('adaptCoachData retorna estado vazio sem dados', () => {
  const adapted = adaptCoachData({});
  assert.deepEqual(adapted, { hasData: false, student: {}, diagnosis: {}, context: {} });
});
