import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTags } from '../src/core/lmTagEngine.js';

test('generateTags uses explicit object contract and emits clinical risk tags when clinical is low', () => {
  const tags = generateTags({
    lmScore: 50,
    dimensions: { adherence: 55, nutrition: 55, training: 50, recovery: 50, clinical: 30, behavior: 54 },
    profile: { stressLevel: 2, trainingFrequency: 2, painInjury: 4 },
    leadValue: 'medium'
  });

  assert.ok(tags.includes('clinical_attention'));
  assert.ok(tags.includes('pain_or_injury'));
  assert.ok(tags.includes('high_stress'));
  assert.ok(tags.length <= 5);
});
