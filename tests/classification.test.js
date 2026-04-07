import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyLead } from '../src/core/lmClassifier.js';

test('classifyLead overrides to risk profile for low clinical', () => {
  const classification = classifyLead({
    lmScore: 90,
    dimensions: { clinical: 20, adherence: 80, recovery: 90 }
  });

  assert.equal(classification, 'Perfil de risco');
});

test('classifyLead returns intermediate profile', () => {
  const classification = classifyLead({
    lmScore: 60,
    dimensions: { clinical: 80, adherence: 60, recovery: 60 }
  });

  assert.equal(classification, 'Intermediário inconsistente');
});
