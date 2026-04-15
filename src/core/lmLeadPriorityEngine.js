function hasTag(tags, value) {
  return Array.isArray(tags) && tags.includes(value);
}

export function buildLeadPriority(input = {}) {
  const tags = Array.isArray(input.tags) ? input.tags : [];
  const adherence = input?.dimensions?.adherence ?? 0;
  const clinical = input?.dimensions?.clinical ?? 0;
  const reasons = [];

  let priorityLevel = 'medium';
  let closeProbability = 'medium';
  let contactAction = 'contact_24h';

  if (input.recommendedOffer === 'presencial' || clinical < 35 || hasTag(tags, 'clinical_attention')) {
    priorityLevel = 'high';
    closeProbability = 'medium';
    contactAction = 'contact_today';
    reasons.push('Prioridade clínica com recomendação de avaliação presencial.');
  } else if (input.recommendedOffer === 'produto_digital') {
    priorityLevel = 'medium';
    closeProbability = input.leadValue === 'high' ? 'medium' : 'low';
    contactAction = 'automation';
    reasons.push('Perfil com fit para fluxo digital e menor urgência comercial.');
  } else if (input.leadValue === 'low' || hasTag(tags, 'high_drop_risk') || input.lmScore < 40) {
    priorityLevel = 'low';
    closeProbability = 'low';
    contactAction = 'automation';
    reasons.push('Baixo fit comercial com risco de abandono elevado.');
  } else if (hasTag(tags, 'ready_for_consulting')) {
    priorityLevel = 'high';
    closeProbability = hasTag(tags, 'high_drop_risk') ? 'medium' : 'high';
    contactAction = 'contact_today';
    reasons.push('Prontidão para consultoria com boa chance de fechamento.');
  } else if (hasTag(tags, 'needs_accountability') || hasTag(tags, 'low_consistency')) {
    priorityLevel = 'high';
    closeProbability = adherence >= 50 ? 'medium' : 'low';
    contactAction = adherence >= 50 ? 'contact_today' : 'contact_24h';
    reasons.push('Necessidade de acompanhamento para sustentar consistência.');
  }

  if (hasTag(tags, 'high_motivation_low_consistency')) reasons.push('Motivação alta com execução inconsistente pede intervenção rápida.');
  if (hasTag(tags, 'low_recovery')) reasons.push('Recuperação comprometida pode reduzir aderência e resultado.');
  if (hasTag(tags, 'low_nutrition_adherence')) reasons.push('Adesão alimentar baixa exige direcionamento inicial simples.');
  if (hasTag(tags, 'ready_for_consulting')) reasons.push('Momento favorável para uma estrutura de consultoria.');

  return {
    priorityLevel,
    closeProbability,
    contactAction,
    priorityReasons: reasons
  };
}
