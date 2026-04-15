import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveOfferHref } from '../src/core/offerCtaConfig.js';

test('resolveOfferHref maps known offers and fallback', () => {
  assert.equal(resolveOfferHref('produto_digital'), './planos.html#produto-digital');
  assert.equal(resolveOfferHref('consultoria_online'), './planos.html#consultoria-online');
  assert.equal(resolveOfferHref('presencial'), './planos.html#presencial');
  assert.equal(resolveOfferHref('desconhecido'), './planos.html');
});
