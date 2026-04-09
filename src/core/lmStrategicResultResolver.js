function normalizeGoal(goal) {
  if (goal === 'fat_loss') return 'fat_loss';
  if (goal === 'muscle_gain') return 'muscle_gain';
  return 'health';
}

function resolveScoreMeaningText(lmScore) {
  if (lmScore <= 39) {
    return 'Hoje você ainda está em um cenário em que alguns fatores importantes estão limitando seu resultado. A boa notícia é que, com uma estratégia mais clara, já dá para começar a evoluir de forma consistente.';
  }

  if (lmScore <= 59) {
    return 'Seu resultado mostra que você já tem alguns pontos positivos, mas ainda existe espaço importante para ajustar sua rotina e acelerar seus resultados com mais direção.';
  }

  if (lmScore <= 79) {
    return 'Você já está em uma condição mais favorável do que a maioria, mas ainda existem detalhes estratégicos que podem melhorar bastante sua evolução.';
  }

  return 'Seu resultado mostra uma base muito boa. Agora, seu maior ganho tende a vir de ajustes mais finos e de uma estratégia mais bem organizada para continuar evoluindo.';
}

function resolveStartingPointText({ lmScore, normalizedGoal }) {
  if (lmScore <= 39) {
    return 'Para o seu perfil, o foco inicial é simplificar sua rotina para ganhar consistência: treino viável na semana, alimentação mais organizada e cardio como suporte gradual.';
  }

  if (lmScore <= 59) {
    if (normalizedGoal === 'muscle_gain') {
      return 'Seu ponto de partida ideal é consolidar uma rotina estável de treino e recuperação, com alimentação suficiente para sustentar progressão sem depender de extremos.';
    }

    return 'Seu ponto de partida ideal é fortalecer a aderência semanal, com alimentação organizada, treino consistente e ajustes simples que você consiga manter na prática.';
  }

  if (normalizedGoal === 'health') {
    return 'Seu ponto de partida ideal é manter a base que você já construiu, com organização simples da rotina para preservar constância e continuar evoluindo com segurança.';
  }

  return 'Para o seu perfil, o mais importante agora é organizar melhor os detalhes da rotina para transformar seu bom potencial em evolução consistente ao longo das próximas semanas.';
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

export function buildStrategicResult({
  lmScore,
  classification,
  goal,
  profile,
  ctaHref,
  ctaButtonLabel
}) {
  const normalizedGoal = normalizeGoal(goal);

  return {
    scoreMeaningTitle: 'Seu LM Score',
    scoreMeaningText: resolveScoreMeaningText(lmScore),
    startingPointTitle: 'Seu ponto de partida ideal',
    startingPointText: resolveStartingPointText({ lmScore, classification, normalizedGoal, profile }),
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
      text: 'Eu posso te entregar essa estratégia de forma estruturada, com treino, direcionamento alimentar e um plano claro para o seu objetivo.',
      buttonLabel: ctaButtonLabel || 'Ver meus planos',
      href: ctaHref || '#'
    }
  };
}
