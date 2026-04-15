function normalizeGoal(goal) {
  if (goal === 'fat_loss') return 'fat_loss';
  if (goal === 'muscle_gain') return 'muscle_gain';
  if (goal === 'health') return 'health';
  return 'health';
}

function resolveClassificationLabel(lmScore) {
  if (lmScore <= 39) return 'Base em construção';
  if (lmScore <= 59) return 'Em evolução';
  if (lmScore <= 79) return 'Boa base';
  return 'Nível avançado';
}

function resolveDiagnosisText(lmScore) {
  if (lmScore <= 39) {
    return 'Hoje você está em uma fase de organização da base. Com ajustes simples e consistentes, seu resultado já pode começar a avançar.';
  }

  if (lmScore <= 59) {
    return 'Você já tem pontos positivos no seu cenário atual. O próximo ganho tende a vir de mais clareza na rotina e execução semanal.';
  }

  if (lmScore <= 79) {
    return 'Você já construiu uma base favorável para evoluir. Agora os melhores ganhos costumam vir de ajustes estratégicos mais específicos.';
  }

  return 'Seu resultado mostra um nível avançado de base. Seu próximo salto tende a acontecer com refinamento de estratégia e organização de detalhes.';
}

function resolveDirectionText({ lmScore, normalizedGoal }) {
  if (lmScore <= 39) {
    return 'O melhor começo agora é criar uma rotina viável para sua semana, com treino possível de manter, alimentação mais previsível e cardio como apoio gradual.';
  }

  if (lmScore <= 59) {
    if (normalizedGoal === 'muscle_gain') {
      return 'Seu foco agora é consolidar treino e recuperação ao longo da semana, com alimentação suficiente para sustentar progressão de forma estável.';
    }

    return 'Seu foco agora é fortalecer a aderência semanal, com alimentação organizada, treino consistente e ajustes simples de manter na prática.';
  }

  if (normalizedGoal === 'health') {
    return 'Seu foco agora é preservar a base que você já construiu, com uma rotina simples e estável para manter constância e evolução segura.';
  }

  return 'Seu foco agora é organizar melhor os detalhes da rotina para transformar seu potencial atual em evolução consistente nas próximas semanas.';
}

function resolveNutritionText(normalizedGoal) {
  if (normalizedGoal === 'fat_loss') {
    return 'Para o seu objetivo, sua estratégia tende a funcionar melhor com uma alimentação mais controlada, proteína adequada e uma rotina mais consistente ao longo da semana.';
  }

  if (normalizedGoal === 'muscle_gain') {
    return 'Para o seu objetivo, sua estratégia tende a funcionar melhor com ingestão suficiente para sustentar treino, recuperação e progressão, sem depender de extremos.';
  }

  return 'Para esse perfil, sua melhor estratégia tende a ser uma alimentação mais organizada, sustentável e fácil de manter na prática.';
}

function resolveTrainingText(normalizedGoal) {
  if (normalizedGoal === 'fat_loss') {
    return 'Para o seu objetivo, o ideal tende a ser treinar entre 3 e 5 vezes por semana, mantendo a musculação como base e usando o cardio como apoio para melhorar gasto energético e condicionamento.';
  }

  if (normalizedGoal === 'muscle_gain') {
    return 'Para ganhar massa muscular, o ideal tende a ser uma rotina de musculação mais frequente, com cardio em volume moderado para não atrapalhar recuperação e performance.';
  }

  return 'Para esse perfil, a melhor estratégia tende a combinar musculação e cardio de forma equilibrada, com foco em constância, disposição e melhora da saúde geral.';
}

function resolveBehaviorInsights(tags) {
  const safeTags = Array.isArray(tags) ? tags : [];
  const insights = [];
  const pushIf = (condition, message) => {
    if (condition && insights.length < 2 && !insights.includes(message)) insights.push(message);
  };

  pushIf(
    safeTags.includes('high_motivation_low_consistency'),
    'Você já tem vontade de fazer dar certo. O próximo passo é transformar essa motivação em constância ao longo da semana.'
  );
  pushIf(
    safeTags.includes('low_consistency'),
    'O principal ajuste para você agora é criar uma rotina que funcione na prática, inclusive nos dias em que a motivação estiver mais baixa.'
  );
  pushIf(
    safeTags.includes('needs_accountability'),
    'Ter uma estrutura clara e acompanhamento pode ser o que falta para transformar intenção em resultado.'
  );
  pushIf(
    safeTags.includes('high_stress'),
    'Sua estratégia precisa respeitar sua rotina atual. Quanto mais a estratégia encaixar na sua realidade, maior a chance de resultado.'
  );
  pushIf(
    safeTags.includes('low_recovery'),
    'Melhorar sua recuperação pode acelerar seu resultado mais do que simplesmente aumentar o volume de treino.'
  );
  pushIf(
    safeTags.includes('pain_or_injury') || safeTags.includes('clinical_attention'),
    'Antes de intensificar, o mais importante agora é ajustar sua execução e respeitar seu momento atual.'
  );
  pushIf(
    safeTags.includes('low_nutrition_adherence'),
    'Mais do que buscar perfeição, seu foco agora deve ser tornar sua alimentação mais previsível ao longo da semana.'
  );
  pushIf(
    safeTags.includes('good_readiness') || safeTags.includes('ready_for_consulting'),
    'Você já tem uma base favorável para evoluir. Agora o ganho tende a vir de uma estratégia melhor organizada.'
  );

  return insights;
}

function resolveTension({ lmScore, tags }) {
  const safeTags = Array.isArray(tags) ? tags : [];
  if (safeTags.includes('high_stress') || safeTags.includes('needs_accountability') || safeTags.includes('clinical_attention')) {
    return 'Sem uma estratégia mais clara, fica muito mais difícil sustentar resultado ao longo do tempo.';
  }
  if (safeTags.includes('low_consistency') || safeTags.includes('high_motivation_low_consistency')) {
    return 'Quando a rotina não está bem organizada, o esforço nem sempre vira resultado.';
  }
  if (lmScore <= 59) {
    return 'Do jeito que está hoje, você até pode evoluir, mas provavelmente mais devagar do que poderia.';
  }
  return 'Com pequenos ajustes de estratégia, seu esforço tende a render mais resultado com menos desgaste.';
}

function resolveCtaLabel({ lmScore, normalizedGoal, tags }) {
  const safeTags = Array.isArray(tags) ? tags : [];
  if (safeTags.includes('needs_accountability')) return 'Quero estrutura e acompanhamento';
  if (safeTags.includes('good_readiness') || safeTags.includes('ready_for_consulting')) return 'Quero otimizar minha estratégia';
  if (lmScore >= 80) return 'Quero refinar minha estratégia';
  if (lmScore <= 39 && normalizedGoal === 'fat_loss') return 'Quero começar do jeito certo';
  if (lmScore <= 59 && normalizedGoal === 'fat_loss') return 'Quero acelerar meus resultados';
  if (lmScore >= 60 && lmScore <= 79 && normalizedGoal === 'muscle_gain') return 'Quero extrair mais resultado';
  return 'Quero aplicar essa estratégia';
}

export function buildStrategicResult({
  lmScore,
  classification,
  classificationLabel,
  goal,
  tags,
  profile,
  ctaHref,
  ctaButtonLabel
}) {
  const normalizedGoal = normalizeGoal(goal);
  const uiClassificationLabel = classificationLabel || resolveClassificationLabel(lmScore);
  const behaviorInsights = resolveBehaviorInsights(tags);
  const diagnosis = resolveDiagnosisText(lmScore);
  const direction = resolveDirectionText({ lmScore, normalizedGoal, classification, profile });
  const tension = resolveTension({ lmScore, tags });
  const resolvedCtaLabel = ctaButtonLabel || resolveCtaLabel({ lmScore, normalizedGoal, tags });

  return {
    classificationLabel: uiClassificationLabel,
    diagnosis,
    direction,
    behaviorInsights,
    tension,
    ctaLabel: resolvedCtaLabel,
    scoreMeaningTitle: 'Seu LM Score',
    scoreMeaningText: diagnosis,
    startingPointTitle: 'Seu ponto de partida ideal',
    startingPointText: direction,
    nutritionGuidance: {
      title: 'Sua estratégia alimentar inicial',
      text: resolveNutritionText(normalizedGoal),
      kcalRangeLabel: null,
      proteinRangeLabel: null
    },
    trainingGuidance: {
      title: 'Sua estratégia de treino',
      text: resolveTrainingText(normalizedGoal),
      strengthFrequencyLabel: 'Musculação: 3–5x/semana',
      cardioFrequencyLabel: normalizedGoal === 'muscle_gain' ? 'Cardio: 2–3x/semana' : 'Cardio: 2–4x/semana'
    },
    cta: {
      title: 'Quer tudo isso organizado para já colocar em prática?',
      text: `${tension} Eu posso te entregar essa estratégia de forma estruturada, com treino, direcionamento alimentar e um plano claro para o seu objetivo.`,
      buttonLabel: resolvedCtaLabel,
      href: ctaHref || '#'
    }
  };
}
