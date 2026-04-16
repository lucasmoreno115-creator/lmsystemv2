import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveResultVariant, getForcedResultVariantFromSearch } from '../src/core/resolveResultVariant.js';
import { DEFAULT_VARIANT, STORAGE_KEY } from '../src/core/experiments/resultExperimentConfig.js';

function createMemoryStorage(initialValue) {
  const data = new Map();
  if (initialValue) data.set(STORAGE_KEY, initialValue);

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, value);
    }
  };
}

test('resolveResultVariant returns a valid variant and persists random choice', () => {
  const storage = createMemoryStorage();
  const result = resolveResultVariant({ storage });

  assert.ok(['A', 'B'].includes(result.variant));
  assert.equal(result.source, 'random');
  assert.equal(storage.getItem(STORAGE_KEY), result.variant);
});

test('resolveResultVariant reuses valid stored variant', () => {
  const storage = createMemoryStorage('A');
  const result = resolveResultVariant({ storage });

  assert.equal(result.variant, 'A');
  assert.equal(result.source, 'storage');
});

test('resolveResultVariant respects valid forcedVariant and ignores invalid', () => {
  const forced = resolveResultVariant({ forcedVariant: 'B' });
  const invalidForced = resolveResultVariant({ forcedVariant: 'X' });

  assert.equal(forced.variant, 'B');
  assert.equal(forced.source, 'forced');
  assert.ok(['A', 'B'].includes(invalidForced.variant));
  assert.notEqual(invalidForced.source, 'forced');
});

test('resolveResultVariant falls back when storage throws', () => {
  const brokenStorage = {
    getItem() {
      throw new Error('storage unavailable');
    },
    setItem() {
      throw new Error('storage unavailable');
    }
  };

  const result = resolveResultVariant({ storage: brokenStorage });
  assert.ok(['A', 'B'].includes(result.variant));
  assert.equal(result.source, 'fallback');
});

test('resolveResultVariant returns default variant when experiment disabled', () => {
  const result = resolveResultVariant({ experimentEnabled: false, forcedVariant: 'A' });
  assert.equal(result.variant, DEFAULT_VARIANT);
  assert.equal(result.source, 'disabled');
});


test('getForcedResultVariantFromSearch validates query param variant', () => {
  assert.equal(getForcedResultVariantFromSearch('?result_variant=A'), 'A');
  assert.equal(getForcedResultVariantFromSearch('?result_variant=B'), 'B');
  assert.equal(getForcedResultVariantFromSearch('?result_variant=X'), null);
});
