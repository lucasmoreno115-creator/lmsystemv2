import {
  AVAILABLE_VARIANTS,
  DEFAULT_VARIANT,
  EXPERIMENT_ENABLED,
  STORAGE_KEY
} from './experiments/resultExperimentConfig.js';

function isValidVariant(variant) {
  return AVAILABLE_VARIANTS.includes(variant);
}

function resolveStorage(providedStorage) {
  if (providedStorage) return providedStorage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function pickRandomVariant() {
  const index = Math.random() < 0.5 ? 0 : 1;
  return AVAILABLE_VARIANTS[index] || DEFAULT_VARIANT;
}

export function resolveResultVariant({
  experimentEnabled = EXPERIMENT_ENABLED,
  storage,
  forcedVariant
} = {}) {
  if (!experimentEnabled) {
    return { variant: DEFAULT_VARIANT, source: 'disabled' };
  }

  if (isValidVariant(forcedVariant)) {
    return { variant: forcedVariant, source: 'forced' };
  }

  const resolvedStorage = resolveStorage(storage);

  try {
    if (resolvedStorage) {
      const storedVariant = resolvedStorage.getItem(STORAGE_KEY);
      if (isValidVariant(storedVariant)) {
        return { variant: storedVariant, source: 'storage' };
      }
    }

    const randomVariant = pickRandomVariant();
    if (resolvedStorage) {
      resolvedStorage.setItem(STORAGE_KEY, randomVariant);
    }

    return {
      variant: isValidVariant(randomVariant) ? randomVariant : DEFAULT_VARIANT,
      source: 'random'
    };
  } catch {
    const fallbackVariant = pickRandomVariant();
    return {
      variant: isValidVariant(fallbackVariant) ? fallbackVariant : DEFAULT_VARIANT,
      source: 'fallback'
    };
  }
}

export function getForcedResultVariantFromSearch(search = '') {
  const params = new URLSearchParams(search);
  const candidate = params.get('result_variant');
  return isValidVariant(candidate) ? candidate : null;
}
