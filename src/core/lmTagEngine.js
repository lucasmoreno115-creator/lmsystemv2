export function generateTags({ dimensions, lmScore, leadValue }) {
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
