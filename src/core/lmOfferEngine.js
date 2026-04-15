function hasTag(tags, tag) {
  return Array.isArray(tags) && tags.includes(tag);
}

export function recommendOffer({ lmScore = 0, leadValue = 'medium', dimensions = {}, tags = [] } = {}) {
  const adherence = dimensions.adherence ?? 0;
  const behavior = dimensions.behavior ?? 0;
  const clinical = dimensions.clinical ?? 0;
  const recovery = dimensions.recovery ?? 0;

  if (clinical < 35 || hasTag(tags, 'clinical_attention') || hasTag(tags, 'pain_or_injury')) {
    return 'presencial';
  }

  if (
    lmScore >= 70
    && adherence >= 65
    && behavior >= 65
    && recovery >= 55
    && leadValue !== 'high'
    && hasTag(tags, 'digital_product_fit')
  ) {
    return 'produto_digital';
  }

  if (leadValue === 'low' && (adherence < 50 || behavior < 50 || lmScore < 50)) {
    return 'produto_digital';
  }

  return 'consultoria_online';
}
