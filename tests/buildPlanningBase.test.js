import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlanningBase } from '../src/coach/buildPlanningBase.js';

test('buildPlanningBase monta bloco estruturado', () => {
  const text = buildPlanningBase({
    data: {
      hasData: true,
      student: { name: 'Ana' },
      diagnosis: { goal: 'emagrecimento' },
      context: { selectedPlan: 'LM Premium Coach' }
    },
    prescription: {
      strategicFocus: 'Simplificação.',
      trainingDirection: { frequency: '3x', complexity: 'Baixa', focus: 'Aderência', progression: 'Simples' },
      cardioDirection: { need: 'Presente', frequency: '2x', intensity: 'Leve', operationalNote: 'Sustentável' },
      nutritionDirection: { strategy: 'Simplificada', behaviorPriority: 'Constância', complexity: 'Baixa', adherenceNote: 'Básico' },
      alerts: ['Evitar plano complexo'],
      coachSummary: 'Resumo técnico.'
    }
  });

  assert.match(text, /# Planejamento-base/);
  assert.match(text, /## Direção de treino/);
  assert.match(text, /## Alertas automáticos/);
  assert.match(text, /Resumo técnico/);
});
