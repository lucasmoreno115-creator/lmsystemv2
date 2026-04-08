function legacyTags({ dimensions, lmScore, leadValue }) {
  const tags = [];

  if (lmScore < 45) tags.push('iniciante');
  else if (lmScore < 70) tags.push('intermediario');
  else tags.push('avancado');

  if (dimensions.recovery < 55) tags.push('baixa_recuperacao');
  if (dimensions.clinical < 60) tags.push('dor_ativa');
  if (dimensions.adherence < 50) tags.push('baixa_adesao');
  if (dimensions.behavior >= 80) tags.push('alta_motivacao');
  if (dimensions.behavior < 55) tags.push('inconsistente');
  if (dimensions.adherence >= 75 && dimensions.behavior >= 75) tags.push('disciplinado');

  const leadTag = leadValue === 'high' ? 'alto_valor' : leadValue === 'medium' ? 'medio_valor' : 'baixo_valor';
  tags.push(leadTag);

  return [...new Set(tags)].slice(0, 5);
}

function addTag(tags, value) {
  if (!tags.includes(value) && tags.length < 5) tags.push(value);
}

function nextGenTags({ lmScore, dimensions, profile }) {
  const tags = [];

  if ((dimensions.clinical ?? 0) >= 75 || profile?.pain) addTag(tags, 'high_clinical_risk');
  if (profile?.pain) addTag(tags, 'pain_or_injury');

  if ((dimensions.adherence ?? 0) < 50) addTag(tags, 'low_adherence');
  if ((dimensions.adherence ?? 0) < 45 || (dimensions.behavior ?? 0) < 45 || lmScore < 40) addTag(tags, 'high_drop_risk');

  if ((profile?.strengthFrequency ?? 0) === 0) addTag(tags, 'no_strength_training');
  if ((profile?.aerobicFrequency ?? 0) === 0) addTag(tags, 'no_aerobic_training');
  if (((profile?.strengthFrequency ?? 0) + (profile?.aerobicFrequency ?? 0)) <= 1) addTag(tags, 'low_training_frequency');

  if ((dimensions.adherence ?? 0) < 60 && (dimensions.behavior ?? 0) < 60) addTag(tags, 'needs_accountability');

  if ((profile?.nutritionOffDays ?? 0) >= 5 || (dimensions.nutrition ?? 0) < 40) addTag(tags, 'high_off_diet_days');
  if ((dimensions.adherence ?? 0) < 50 && ((profile?.nutritionOffDays ?? 0) >= 4 || (dimensions.behavior ?? 0) < 50)) {
    addTag(tags, 'inconsistency_pattern');
  }

  if ((dimensions.adherence ?? 0) >= 75 && (dimensions.behavior ?? 0) >= 75 && lmScore >= 70) {
    addTag(tags, 'self_driven');
    addTag(tags, 'digital_product_fit');
  }

  if (lmScore >= 55 && (dimensions.adherence ?? 0) >= 55 && (dimensions.behavior ?? 0) >= 55 && (dimensions.clinical ?? 100) < 60) {
    addTag(tags, 'ready_for_consulting');
  }

  return tags;
}

export function generateTags(input, maybeDimensions) {
  if (maybeDimensions) {
    return nextGenTags({ profile: input ?? {}, dimensions: maybeDimensions ?? {}, lmScore: 0 });
  }

  const payload = input ?? {};

  if (payload.profile) {
    return nextGenTags(payload);
  }

  return legacyTags(payload);
}
