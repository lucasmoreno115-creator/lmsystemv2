export function buildResultViewedPayload({ strategic, result }) {
  return {
    experimentKey: strategic?.experimentKey || null,
    variant: strategic?.variant || null,
    variantSource: strategic?.variantSource || null,
    clientState: strategic?.clientState || result?.leadPayload?.clientState || null,
    lmScore: result?.lmScore ?? null,
    leadId: result?.leadId ?? null,
    engineVersion: result?.engineVersion ?? null,
    recommendedOffer: result?.leadPayload?.recommendedOffer ?? null,
    leadPriority: result?.leadPayload?.priority?.level ?? null
  };
}

export function buildResultExperimentAssignedPayload(strategic) {
  return {
    experimentKey: strategic?.experimentKey || null,
    variant: strategic?.variant || null,
    source: strategic?.variantSource || null
  };
}

export function buildResultCtaClickedPayload(target) {
  return {
    experimentKey: target?.dataset?.experimentKey || null,
    variant: target?.dataset?.variant || null,
    clientState: target?.dataset?.clientState || null,
    recommendedOffer: target?.dataset?.recommendedOffer || null,
    ctaLabel: target?.dataset?.ctaLabel || target?.textContent || null,
    href: target?.getAttribute?.('href') || '#'
  };
}
