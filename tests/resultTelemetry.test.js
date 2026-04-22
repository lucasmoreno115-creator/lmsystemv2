import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildResultViewedPayload,
  buildResultCtaClickedPayload,
  buildResultExperimentAssignedPayload
} from '../src/ui/resultTelemetry.js';

test('buildResultViewedPayload includes experiment and strategic metadata', () => {
  const payload = buildResultViewedPayload({
    strategic: {
      experimentKey: 'result_copy_ab_v1',
      variant: 'A',
      variantSource: 'storage',
      clientState: 'PLATEAU'
    },
    result: {
      lmScore: 62,
      leadPayload: {
        recommendedOffer: 'consultoria_online',
        priority: { level: 'medium' }
      }
    }
  });

  assert.deepEqual(payload, {
    experimentKey: 'result_copy_ab_v1',
    variant: 'A',
    variantSource: 'storage',
    clientState: 'PLATEAU',
    lmScore: 62,
    leadId: null,
    engineVersion: null,
    recommendedOffer: 'consultoria_online',
    leadPriority: 'medium'
  });
});



test('buildResultViewedPayload keeps lead metadata from remote response', () => {
  const payload = buildResultViewedPayload({
    strategic: null,
    result: {
      lmScore: 74,
      leadId: 'lead_789',
      engineVersion: 'engine-v3',
      leadPayload: {
        clientState: 'PLATEAU',
        recommendedOffer: 'produto_digital',
        priority: { level: 'low' }
      }
    }
  });

  assert.equal(payload.leadId, 'lead_789');
  assert.equal(payload.engineVersion, 'engine-v3');
  assert.equal(payload.clientState, 'PLATEAU');
});
test('buildResultExperimentAssignedPayload keeps source for exposure telemetry', () => {
  assert.deepEqual(
    buildResultExperimentAssignedPayload({
      experimentKey: 'result_copy_ab_v1',
      variant: 'B',
      variantSource: 'random'
    }),
    {
      experimentKey: 'result_copy_ab_v1',
      variant: 'B',
      source: 'random'
    }
  );
});

test('buildResultCtaClickedPayload keeps telemetry safe with dataset fallback', () => {
  const target = {
    dataset: {
      experimentKey: 'result_copy_ab_v1',
      variant: 'B',
      clientState: 'HIGH_PERFORMER',
      recommendedOffer: 'produto_digital',
      ctaLabel: 'Avançar com uma estratégia no meu nível'
    },
    textContent: 'fallback',
    getAttribute(name) {
      if (name === 'href') return './planos.html#produto-digital';
      return null;
    }
  };

  assert.deepEqual(buildResultCtaClickedPayload(target), {
    experimentKey: 'result_copy_ab_v1',
    variant: 'B',
    clientState: 'HIGH_PERFORMER',
    recommendedOffer: 'produto_digital',
    ctaLabel: 'Avançar com uma estratégia no meu nível',
    href: './planos.html#produto-digital'
  });
});
