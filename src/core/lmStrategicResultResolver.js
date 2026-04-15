import { resolveClientState } from './resolveClientState.js';
import { buildResultNarrative } from './resultNarrativeEngine.js';

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
  leadPriority
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

  const narrative = buildResultNarrative({
    clientState,
    lmScore,
    dimensions: resolvedDimensions,
    recommendedOffer,
    leadPriority,
    profile,
    tags
  });

  return {
    clientState,
    classificationLabel: classificationLabel || resolveClassificationLabel(lmScore),
    ...narrative,
    cta: {
      buttonLabel: narrative.ctaLabel,
      href: narrative.ctaHref,
      supportText: narrative.ctaSupportText
    }
  };
}
