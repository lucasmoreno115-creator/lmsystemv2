export function buildCoachSummary({ dimensions, classification, priority }) {
  const bottlenecks = [];
  if (dimensions.adherence < 60) bottlenecks.push('baixa consistência');
  if (dimensions.recovery < 60) bottlenecks.push('recuperação comprometida');
  if (dimensions.nutrition < 60) bottlenecks.push('adesão alimentar limitada');
  if (dimensions.clinical < 60) bottlenecks.push('limitação clínica ativa');

  const baseSummary = bottlenecks.length
    ? `Classificação: ${classification}. Gargalos principais: ${bottlenecks.join(', ')}. Indicado plano simples com acompanhamento próximo.`
    : `Classificação: ${classification}. Bom potencial global, com foco em progressão estruturada e manutenção da rotina.`;

  if (!priority) return baseSummary;

  const reasons = Array.isArray(priority.reasons) ? priority.reasons : [];
  const lines = [
    baseSummary,
    `Prioridade do lead: ${(priority.level ?? 'unknown').toUpperCase()}`,
    `Probabilidade de fechamento: ${(priority.closeProbability ?? 'unknown').toUpperCase()}`,
    `Ação sugerida: ${(priority.contactAction ?? 'automation').toUpperCase()}`
  ];

  if (reasons.length) {
    lines.push('Motivos principais:');
    for (const reason of reasons.slice(0, 3)) {
      lines.push(`- ${reason}`);
    }
  }

  return lines.join('\n');
}
