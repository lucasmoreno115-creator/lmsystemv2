const STATE_RULES = {
  HIGH_RISK: {
    strategicFocus: 'Segurança, aderência mínima viável e progressão conservadora.',
    trainingDirection: {
      frequency: '3x/semana',
      complexity: 'Baixa',
      focus: 'Segurança técnica + consistência',
      progression: 'Conservadora'
    },
    cardioDirection: {
      need: 'Presente',
      frequency: '2 a 4x/semana',
      intensity: 'Leve a moderada',
      operationalNote: 'Priorizar segurança e tolerância de esforço.'
    },
    nutritionDirection: {
      strategy: 'Conservadora',
      behaviorPriority: 'Viabilidade, segurança e regularidade',
      complexity: 'Baixa',
      adherenceNote: 'Reforçar o básico sem rigidez extrema.'
    }
  },
  LOW_ADHERENCE: {
    strategicFocus: 'Simplificação, constância e redução de atrito.',
    trainingDirection: {
      frequency: '3 a 4x/semana',
      complexity: 'Baixa',
      focus: 'Aderência e regularidade',
      progression: 'Simples e incremental'
    },
    cardioDirection: {
      need: 'Presente',
      frequency: '2 a 3x/semana',
      intensity: 'Leve a moderada',
      operationalNote: 'Sessões curtas e sustentáveis.'
    },
    nutritionDirection: {
      strategy: 'Simplificada',
      behaviorPriority: 'Constância e execução do básico',
      complexity: 'Baixa',
      adherenceNote: 'Eliminar fricção na rotina alimentar.'
    }
  },
  INCONSISTENT: {
    strategicFocus: 'Estabilidade de rotina, previsibilidade e execução sustentada.',
    trainingDirection: {
      frequency: '4x/semana',
      complexity: 'Baixa a moderada',
      focus: 'Estabilidade e manutenção do ritmo',
      progression: 'Previsível'
    },
    cardioDirection: {
      need: 'Condicional por objetivo',
      frequency: '2 a 3x/semana',
      intensity: 'Moderada',
      operationalNote: 'Manter constância sem fadiga excessiva.'
    },
    nutritionDirection: {
      strategy: 'Rotina alimentar previsível',
      behaviorPriority: 'Reduzir oscilação semanal',
      complexity: 'Baixa a moderada',
      adherenceNote: 'Padronizar refeições-chave.'
    }
  },
  PLATEAU: {
    strategicFocus: 'Ajuste fino, progressão e refinamento de estratégia.',
    trainingDirection: {
      frequency: '4 a 5x/semana',
      complexity: 'Moderada',
      focus: 'Refinamento e estímulo efetivo',
      progression: 'Estruturada'
    },
    cardioDirection: {
      need: 'Estratégico',
      frequency: '3x/semana ou conforme meta',
      intensity: 'Moderada',
      operationalNote: 'Aumentar eficiência sem comprometer recuperação.'
    },
    nutritionDirection: {
      strategy: 'Ajuste fino de ingestão e monitoramento',
      behaviorPriority: 'Precisão e consistência semanal',
      complexity: 'Moderada',
      adherenceNote: 'Monitorar resposta e ajustar alavancas.'
    }
  },
  BEGINNER_LOST: {
    strategicFocus: 'Clareza, estrutura básica e baixa complexidade.',
    trainingDirection: {
      frequency: '3x/semana',
      complexity: 'Baixa',
      focus: 'Aprender base e manter rotina',
      progression: 'Muito simples'
    },
    cardioDirection: {
      need: 'Leve e orientado por adaptação',
      frequency: '2x/semana',
      intensity: 'Leve',
      operationalNote: 'Construir capacidade sem sobrecarga.'
    },
    nutritionDirection: {
      strategy: 'Fundamentos alimentares',
      behaviorPriority: 'Criar rotina mínima',
      complexity: 'Baixa',
      adherenceNote: 'Diretrizes claras e poucas regras.'
    }
  },
  HIGH_PERFORMER: {
    strategicFocus: 'Otimização, precisão e progressão estratégica.',
    trainingDirection: {
      frequency: '5x/semana (ou compatível com contexto)',
      complexity: 'Moderada',
      focus: 'Performance e progressão eficiente',
      progression: 'Refinada'
    },
    cardioDirection: {
      need: 'Estratégico e complementar',
      frequency: '2 a 3x/semana',
      intensity: 'Moderada a vigorosa (controlada)',
      operationalNote: 'Usar cardio para eficiência sem exagero.'
    },
    nutritionDirection: {
      strategy: 'Precisão monitorada e otimizada',
      behaviorPriority: 'Execução técnica e ajustes finos',
      complexity: 'Moderada',
      adherenceNote: 'Controlar variáveis com consistência.'
    }
  }
};

const DEFAULT_CHECKLIST = [
  'Frequência do treino compatível com a rotina',
  'Complexidade adequada ao perfil',
  'Estratégia nutricional coerente com adesão',
  'Cardio compatível com objetivo e recuperação',
  'Plano simplificado o suficiente para manter constância',
  'Progressão compatível com o momento do aluno'
];

function createAlerts(input, rule) {
  const alerts = [];
  const state = input.clientState;
  if (state === 'LOW_ADHERENCE') alerts.push('Evitar plano complexo: perfil com baixa aderência.');
  if (state === 'HIGH_RISK') alerts.push('Priorizar segurança e progressão conservadora.');
  if (state === 'INCONSISTENT') alerts.push('Alta chance de oscilação: simplificar execução semanal.');
  if (state === 'PLATEAU') alerts.push('Perfil com boa base: oportunidade de refinamento.');
  if ((input.dimensions?.recovery ?? 100) < 50) alerts.push('Reduzir agressividade inicial: recuperação abaixo do ideal.');
  if (input.goal === 'emagrecimento') alerts.push('Meta de perda de gordura: garantir cardio regular e sustentável.');
  if ((input.dimensions?.clinical ?? 100) < 45 && state !== 'HIGH_RISK') {
    alerts.push('Sinais clínicos pedem ajuste conservador, mesmo com boa motivação.');
  }
  if (!alerts.length) alerts.push(`Direção consistente com perfil ${state || 'atual'}.`);
  return alerts;
}

function buildCoachSummary(input, rule) {
  return `Aluno em estado ${input.clientState || 'não mapeado'} com objetivo ${input.goal || 'não informado'}. ` +
    `Melhor resposta esperada com foco em ${rule.strategicFocus.toLowerCase()} ` +
    `Treino ${rule.trainingDirection.complexity.toLowerCase()} (${rule.trainingDirection.frequency}) e nutrição ${rule.nutritionDirection.strategy.toLowerCase()}.`;
}

export function buildCoachPrescription(input = {}) {
  const state = input.clientState || 'BEGINNER_LOST';
  const rule = STATE_RULES[state] || STATE_RULES.BEGINNER_LOST;
  const cardioDirection = { ...rule.cardioDirection };

  if (input.goal === 'emagrecimento') {
    cardioDirection.need = 'Obrigatório para suporte ao objetivo de perda de gordura';
  }

  if ((input.dimensions?.recovery ?? 100) < 50) {
    cardioDirection.intensity = 'Leve a moderada';
    cardioDirection.operationalNote = 'Recuperação baixa: controlar volume e intensidade.';
  }

  return {
    strategicFocus: rule.strategicFocus,
    trainingDirection: rule.trainingDirection,
    cardioDirection,
    nutritionDirection: rule.nutritionDirection,
    alerts: createAlerts(input, rule),
    deliveryChecklist: [...DEFAULT_CHECKLIST],
    coachSummary: buildCoachSummary(input, rule)
  };
}
