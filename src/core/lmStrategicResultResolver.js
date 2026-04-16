import { resolveClientState } from './resolveClientState.js';
import { buildResultNarrative } from './resultNarrativeEngine.js';
import { resolveResultVariant } from './resolveResultVariant.js';
import { EXPERIMENT_ENABLED, EXPERIMENT_KEY } from './experiments/resultExperimentConfig.js';

function resolveClassificationLabel(lmScore) {
  if (lmScore <= 39) return 'Base em construção';
  if (lmScore <= 59) return 'Em evolução';
  if (lmScore <= 79) return 'Boa base';
  return 'Nível avançado';
}

export function buildStrategicResult({
  lmScore,
  classificationLabel,
  tags,
  profile,
  dimensions,
  recommendedOffer,
  leadPriority,
  forcedVariant,
  storage,
  experimentEnabled = EXPERIMENT_ENABLED
}) {
  const resolvedDimensions = dimensions || profile || {};
  const clientState = resolveClientState({
    lmScore,
    dimensions: resolvedDimensions,
    tags,
    recommendedOffer,
    leadValue: null,
    profile
  });

  const { variant, source: variantSource } = resolveResultVariant({
    experimentEnabled,
    storage,
    forcedVariant
  });

  const narrative = buildResultNarrative({
    clientState,
    variant,
    lmScore,
    dimensions: resolvedDimensions,
    recommendedOffer,
    leadPriority,
    profile,
    tags
  });

  return {
    clientState,
    variant,
    variantSource,
    experimentKey: EXPERIMENT_KEY,
    classificationLabel: classificationLabel || resolveClassificationLabel(lmScore),
    ...narrative,
    cta: {
      buttonLabel: narrative.ctaLabel,
      href: narrative.ctaHref,
      supportText: narrative.ctaSupportText
    }
  };
}
