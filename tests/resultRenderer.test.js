import test from 'node:test';
import assert from 'node:assert/strict';
import { renderResult } from '../src/ui/resultRenderer.js';

test('renderResult renders strategic narrative, variant attrs and dynamic CTA attrs', () => {
  const container = {
    innerHTML: '',
    classList: { remove() {} }
  };

  const strategic = renderResult(container, {
    lmScore: 55,
    classification: 'Intermediário inconsistente',
    tags: ['high_motivation_low_consistency', 'needs_accountability'],
    profile: {},
    leadPayload: {
      dimensions: { clinical: 70, adherence: 35, behavior: 45 },
      recommendedOffer: 'consultoria_online',
      priority: { level: 'high' }
    }
  });

  assert.equal(strategic.clientState, 'LOW_ADHERENCE');
  assert.ok(['A', 'B'].includes(strategic.variant));
  assert.match(container.innerHTML, /Diagnóstico estratégico personalizado/);
  assert.match(container.innerHTML, /Virada de chave/);
  assert.match(container.innerHTML, /result-diagnosis/);
  assert.match(container.innerHTML, /data-client-state="LOW_ADHERENCE"/);
  assert.match(container.innerHTML, /data-recommended-offer="consultoria_online"/);
  assert.match(container.innerHTML, /data-result-variant="[AB]"/);
  assert.match(container.innerHTML, /data-variant="[AB]"/);
  assert.match(container.innerHTML, /data-experiment-key="result_copy_ab_v1"/);
  assert.match(container.innerHTML, /\.\/planos\.html#consultoria-online/);
});
