import test from 'node:test';
import assert from 'node:assert/strict';
import { renderResult } from '../src/ui/resultRenderer.js';

test('renderResult renders classification label and behavior insights without crashing', () => {
  const container = {
    innerHTML: '',
    classList: { remove() {} }
  };

  renderResult(container, {
    lmScore: 55,
    classification: 'Intermediário inconsistente',
    goal: 'fat_loss',
    tags: ['high_motivation_low_consistency', 'needs_accountability'],
    profile: {},
    ctaHref: '#'
  });

  assert.match(container.innerHTML, /Classificação:<\/strong> Em evolução/);
  assert.match(container.innerHTML, /Insight comportamental/);
  assert.match(container.innerHTML, /Ponto de atenção estratégico/);
});
