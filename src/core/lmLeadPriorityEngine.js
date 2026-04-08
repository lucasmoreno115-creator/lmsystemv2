function hasTag(tags, value) {
  return Array.isArray(tags) && tags.includes(value);
}

export function buildLeadPriority(input = {}) {
  const tags = Array.isArray(input.tags) ? input.tags : [];
  const adherence = input?.dimensions?.adherence ?? 0;
  const reasons = [];

  let priorityLevel = 'medium';
  let closeProbability = 'medium';
  let contactAction = 'automation';

  if (input.classification === 'clinical_override' || hasTag(tags, 'high_clinical_risk')) {
    priorityLevel = 'high';
    closeProbability = 'medium';
    contactAction = 'contact_today';
    reasons.push('Prioridade clínica com risco e indicação presencial.');
  } else if (input.recommendedOffer === 'produto_digital') {
    priorityLevel = 'medium';
    closeProbability = 'medium';
    contactAction = 'automation';
    reasons.push('Perfil digital autônomo com baixa urgência.');
  } else if (input.leadValue === 'low' || input.lmScore < 40 || hasTag(tags, 'high_drop_risk')) {
    priorityLevel = 'low';
    closeProbability = 'low';
    contactAction = 'automation';
    reasons.push('Baixa adesão com alto risco comportamental e baixo fit.');
  } else if (input.recommendedOffer === 'consultoria_online') {
    if (hasTag(tags, 'high_buy_intent') && hasTag(tags, 'ready_for_consulting')) {
      priorityLevel = 'high';
      closeProbability = hasTag(tags, 'price_sensitive') ? 'medium' : 'high';
      contactAction = 'contact_today';
      reasons.push('Necessidade de consultoria, interesse claro e fit comercial.');
    } else if (hasTag(tags, 'ready_for_consulting') && input.lmScore >= 65) {
      priorityLevel = 'high';
      closeProbability = 'high';
      contactAction = 'contact_today';
      reasons.push('Bom fit para consultoria com guidance e potencial de fechamento.');
    } else if (hasTag(tags, 'needs_accountability') && adherence >= 50) {
      priorityLevel = 'high';
      closeProbability = 'medium';
      contactAction = 'contact_today';
      reasons.push('Demanda por acompanhamento e accountability de consultoria.');
    } else if (adherence < 50 || hasTag(tags, 'inconsistency_pattern')) {
      priorityLevel = 'medium';
      closeProbability = 'medium';
      contactAction = 'contact_24h';
      reasons.push('Inconsistência de rotina com necessidade de direcionamento.');
    }
  }

  if (hasTag(tags, 'needs_guidance')) reasons.push('Lead com necessidade de guidance e direcionamento.');
  if (hasTag(tags, 'price_sensitive')) reasons.push('Interesse presente, porém sensível a preço.');
  if (hasTag(tags, 'ready_for_consulting')) reasons.push('Momento de consultoria com bom fit de acompanhamento.');
  if (hasTag(tags, 'low_adherence')) reasons.push('Baixa adesão atual reduz probabilidade de fechamento.');
  if (input.recommendedOffer === 'produto_digital') reasons.push('Autonomia favorece fluxo digital com menor urgência.');
  if (input.recommendedOffer === 'presencial') reasons.push('Cenário presencial indicado por criticidade de risco.');

  return {
    priorityLevel,
    closeProbability,
    contactAction,
    priorityReasons: reasons
  };
}
