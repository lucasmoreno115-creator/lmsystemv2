function addTag(tags, value) {
  if (!tags.includes(value) && tags.length < 5) tags.push(value);
}

export function generateTags({ lmScore = 0, dimensions = {}, profile = {}, leadValue = 'medium' } = {}) {
  const tags = [];

  const adherence = dimensions.adherence ?? 0;
  const behavior = dimensions.behavior ?? 0;
  const recovery = dimensions.recovery ?? 0;
  const clinical = dimensions.clinical ?? 0;
  const nutrition = dimensions.nutrition ?? 0;
  const stressLevel = profile.stressLevel ?? 3;

  const hasClinicalAttention = clinical < 45 || profile.painInjury >= 4 || profile.pain === true;

  if (hasClinicalAttention) addTag(tags, 'clinical_attention');
  if (profile.painInjury >= 4 || profile.pain === true) addTag(tags, 'pain_or_injury');

  if (adherence < 50) addTag(tags, 'low_adherence');
  if (recovery < 55) addTag(tags, 'low_recovery');
  if (nutrition < 45) addTag(tags, 'low_nutrition_adherence');
  if (stressLevel <= 2) addTag(tags, 'high_stress');

  if (adherence < 55 && behavior < 55) addTag(tags, 'low_consistency');
  if (behavior >= 75 && adherence < 60) addTag(tags, 'high_motivation_low_consistency');
  if (adherence < 50 || behavior < 45 || lmScore < 40) addTag(tags, 'high_drop_risk');
  if (adherence < 60 && behavior < 60) addTag(tags, 'needs_accountability');

  const trainingFrequency = profile.trainingFrequency ?? profile.strengthFrequency ?? 0;
  if (trainingFrequency <= 2) addTag(tags, 'low_training_frequency');

  if (lmScore >= 72 && adherence >= 72 && behavior >= 70 && recovery >= 60 && clinical >= 55) {
    addTag(tags, 'good_readiness');
  }

  if (!hasClinicalAttention && lmScore >= 68 && adherence >= 65 && behavior >= 65) {
    addTag(tags, 'digital_product_fit');
  }

  if (!hasClinicalAttention && lmScore >= 55 && adherence >= 55 && behavior >= 55 && leadValue !== 'low') {
    addTag(tags, 'ready_for_consulting');
  }

  return tags;
}
