export function buildCoachSummary({ dimensions, classification }) {
  const bottlenecks = [];
  if (dimensions.adherence < 60) bottlenecks.push('baixa consistência');
  if (dimensions.recovery < 60) bottlenecks.push('recuperação comprometida');
  if (dimensions.nutrition < 60) bottlenecks.push('adesão alimentar limitada');
  if (dimensions.clinical < 60) bottlenecks.push('limitação clínica ativa');

  const summary = bottlenecks.length
    ? `Classificação: ${classification}. Gargalos principais: ${bottlenecks.join(', ')}. Indicado plano simples com acompanhamento próximo.`
    : `Classificação: ${classification}. Bom potencial global, com foco em progressão estruturada e manutenção da rotina.`;

  return summary;
}
