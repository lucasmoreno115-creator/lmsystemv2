export function buildResultViewedPayload({ strategic, result }) {
  return {
    clientState: strategic?.clientState || null,
    lmScore: result?.lmScore ?? null,
    recommendedOffer: result?.leadPayload?.recommendedOffer ?? null,
    leadPriority: result?.leadPayload?.priority?.level ?? null
  };
}

export function buildResultCtaClickedPayload(target) {
  return {
    clientState: target?.dataset?.clientState || null,
    recommendedOffer: target?.dataset?.recommendedOffer || null,
    ctaLabel: target?.dataset?.ctaLabel || target?.textContent || null,
    href: target?.getAttribute?.('href') || '#'
  };
}
