import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResultViewedPayload, buildResultCtaClickedPayload } from '../src/ui/resultTelemetry.js';

test('buildResultViewedPayload includes strategic state and offer metadata', () => {
  const payload = buildResultViewedPayload({
    strategic: { clientState: 'PLATEAU' },
    result: {
      lmScore: 62,
      leadPayload: {
        recommendedOffer: 'consultoria_online',
        priority: { level: 'medium' }
      }
    }
  });

  assert.deepEqual(payload, {
    clientState: 'PLATEAU',
    lmScore: 62,
    recommendedOffer: 'consultoria_online',
    leadPriority: 'medium'
  });
});

test('buildResultCtaClickedPayload keeps telemetry safe with dataset fallback', () => {
  const target = {
    dataset: {
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
    clientState: 'HIGH_PERFORMER',
    recommendedOffer: 'produto_digital',
    ctaLabel: 'Avançar com uma estratégia no meu nível',
    href: './planos.html#produto-digital'
  });
});
