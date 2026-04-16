function listify(items = []) {
  return items.map((item) => `- ${item}`).join('\n');
}

export function buildPlanningBase({ data, prescription }) {
  if (!data?.hasData || !prescription) {
    return '# Planejamento-base\n\nDiagnóstico indisponível.';
  }

  const training = prescription.trainingDirection;
  const cardio = prescription.cardioDirection;
  const nutrition = prescription.nutritionDirection;

  return [
    '# Planejamento-base (MVP)',
    '',
    `**Aluno:** ${data.student?.name || 'Aluno sem nome'}`,
    `**Objetivo:** ${data.diagnosis?.goal || 'Não informado'}`,
    `**Plano selecionado:** ${data.context?.selectedPlan || 'Não selecionado'}`,
    '',
    '## Foco estratégico',
    prescription.strategicFocus,
    '',
    '## Direção de treino',
    `- Frequência: ${training.frequency}`,
    `- Complexidade: ${training.complexity}`,
    `- Foco: ${training.focus}`,
    `- Progressão: ${training.progression}`,
    '',
    '## Direção de cardio',
    `- Necessidade: ${cardio.need}`,
    `- Frequência: ${cardio.frequency}`,
    `- Intensidade: ${cardio.intensity}`,
    `- Observação: ${cardio.operationalNote}`,
    '',
    '## Direção nutricional',
    `- Estratégia-base: ${nutrition.strategy}`,
    `- Prioridade comportamental: ${nutrition.behaviorPriority}`,
    `- Complexidade: ${nutrition.complexity}`,
    `- Observação de adesão: ${nutrition.adherenceNote}`,
    '',
    '## Alertas automáticos',
    listify(prescription.alerts),
    '',
    '## Resumo do coach',
    prescription.coachSummary
  ].join('\n');
}
