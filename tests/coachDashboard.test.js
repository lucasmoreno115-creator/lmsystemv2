import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeCoachDashboard, renderCoachDashboard } from '../src/coach/coachDashboard.js';

function createFakeDoc() {
  const listeners = {};
  const elements = {
    '#coach-dashboard-root': { innerHTML: '' },
    '#coach-action-feedback': { textContent: '' },
    '#copy-summary-btn': {
      addEventListener(type, cb) { listeners.copy = cb; }
    },
    '#generate-base-btn': {
      addEventListener(type, cb) { listeners.generate = cb; }
    },
    '#logout-btn': {
      addEventListener(type, cb) { listeners.logout = cb; }
    }
  };

  return {
    listeners,
    querySelector(selector) {
      return elements[selector] || null;
    }
  };
}

test('renderCoachDashboard mostra estado vazio sem diagnóstico', () => {
  const html = renderCoachDashboard({ data: { hasData: false } });
  assert.match(html, /Nenhum diagnóstico salvo/);
});

test('renderCoachDashboard renderiza cards com dados', () => {
  const html = renderCoachDashboard({
    data: {
      hasData: true,
      student: { name: 'Ana' },
      diagnosis: { goal: 'emagrecimento', lmScore: 55, classification: 'Em evolução', clientState: 'LOW_ADHERENCE', leadPriority: 'high' },
      context: { selectedPlan: 'LM Premium Coach' }
    },
    prescription: {
      coachSummary: 'Resumo interno',
      strategicFocus: 'Simplificação',
      trainingDirection: { frequency: '3x', complexity: 'Baixa', focus: 'Aderência', progression: 'Simples' },
      cardioDirection: { need: 'Presente', frequency: '2x', intensity: 'Leve', operationalNote: 'Sustentável' },
      nutritionDirection: { strategy: 'Simplificada', behaviorPriority: 'Constância', complexity: 'Baixa', adherenceNote: 'Básico' },
      alerts: ['Evitar plano complexo'],
      deliveryChecklist: ['Checklist 1']
    },
    planningBase: 'texto'
  });

  assert.match(html, /Resumo do aluno/);
  assert.match(html, /Checklist de entrega/);
  assert.match(html, /Resumo interno/);
});

test('initializeCoachDashboard configura ações de copiar resumo e gerar planejamento-base', async () => {
  const doc = createFakeDoc();
  const writes = [];
  let redirectedTo = null;
  const storage = {
    getItem(key) {
      const map = {
        LM_LAST_RESULT: JSON.stringify({
          lmScore: 61,
          classification: 'Em evolução',
          leadPayload: {
            name: 'Ana',
            goal: 'emagrecimento',
            dimensions: { clinical: 70, adherence: 35, behavior: 45 }
          }
        }),
        LM_LAST_INPUT: JSON.stringify({ name: 'Ana' }),
        LM_LAST_TS: String(Date.now()),
        LM_SELECTED_PLAN: 'LM Premium Coach'
      };
      return map[key] ?? null;
    },
    setItem() {}
  };

  initializeCoachDashboard({
    doc,
    storage,
    clipboard: { writeText: async (v) => writes.push(v) },
    location: { assign(url) { redirectedTo = url; } }
  });

  await doc.listeners.copy();
  await doc.listeners.generate();

  assert.equal(writes.length, 2);
  assert.match(writes[0], /Aluno em estado/);
  assert.match(writes[1], /# Planejamento-base/);

  doc.listeners.logout();
  assert.equal(redirectedTo, './coach-dashboard-login.html');
});
