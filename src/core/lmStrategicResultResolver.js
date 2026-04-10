function normalizeGoal(goal) {
  if (goal === 'fat_loss') return 'fat_loss';
  if (goal === 'muscle_gain') return 'muscle_gain';
  return 'health';
}

function resolveScoreRange(lmScore) {
  if (lmScore <= 39) return 'low';
  if (lmScore <= 59) return 'medium';
  if (lmScore <= 79) return 'good';
  return 'high';
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

function resolveBehaviorInsights(tags, excludedKeys = []) {
  const safeTags = Array.isArray(tags) ? tags : [];
  const blocked = Array.isArray(excludedKeys) ? excludedKeys : [];
  const insights = [];
  const pushIf = (key, condition, message) => {
    if (blocked.includes(key)) return;
    if (condition && insights.length < 2 && !insights.includes(message)) insights.push(message);
  };

  pushIf(
    'high_motivation_low_consistency',
    safeTags.includes('high_motivation_low_consistency'),
    'Você já tem vontade de fazer dar certo. O próximo passo é transformar essa motivação em constância ao longo da semana.'
  );
  pushIf(
    'low_consistency',
    safeTags.includes('low_consistency'),
    'O principal ajuste para você agora é criar uma rotina que funcione na prática, inclusive nos dias em que a motivação estiver mais baixa.'
  );
  pushIf(
    'needs_accountability',
    safeTags.includes('needs_accountability'),
    'Ter uma estrutura clara e acompanhamento pode ser o que falta para transformar intenção em resultado.'
  );
  pushIf(
    'high_stress',
    safeTags.includes('high_stress'),
    'Sua estratégia precisa respeitar sua rotina atual. Quanto mais a estratégia encaixar na sua realidade, maior a chance de resultado.'
  );
  pushIf(
    'recovery',
    safeTags.includes('poor_sleep_quality') || safeTags.includes('low_recovery'),
    'Melhorar sua recuperação pode acelerar seu resultado mais do que simplesmente aumentar o volume de treino.'
  );
  pushIf(
    'pain_clinical',
    safeTags.includes('pain_limitation') || safeTags.includes('clinical_attention'),
    'Antes de intensificar, o mais importante agora é ajustar sua execução e respeitar seu momento atual.'
  );
  pushIf(
    'low_nutrition_adherence',
    safeTags.includes('low_nutrition_adherence'),
    'Mais do que buscar perfeição, seu foco agora deve ser tornar sua alimentação mais previsível ao longo da semana.'
  );
  pushIf(
    'good_readiness',
    safeTags.includes('good_readiness'),
    'Você já tem uma base favorável para evoluir. Agora o ganho tende a vir de uma estratégia melhor organizada.'
  );

  return insights;
}

function resolveTensionText({ scoreRange, tags }) {
  const safeTags = Array.isArray(tags) ? tags : [];
  if (safeTags.includes('pain_limitation') || safeTags.includes('clinical_attention')) {
    return {
      key: 'pain_clinical',
      text: 'Se você tentar intensificar sem ajustar a base primeiro, a tendência é sentir mais dificuldade para sustentar progresso com segurança.'
    };
  }
  if (safeTags.includes('high_stress')) {
    return {
      key: 'high_stress',
      text: 'Quando a estratégia não respeita sua rotina atual, a chance de abandono aumenta. Por isso, o plano certo precisa ser compatível com a sua realidade.'
    };
  }
  if (safeTags.includes('poor_sleep_quality') || safeTags.includes('low_recovery')) {
    return {
      key: 'recovery',
      text: 'Mesmo treinando e tentando se alimentar melhor, sua evolução pode ficar limitada se sua recuperação continuar desorganizada.'
    };
  }
  if (safeTags.includes('high_motivation_low_consistency')) {
    return {
      key: 'high_motivation_low_consistency',
      text: 'Você já tem vontade de fazer dar certo. O que falta agora é uma estrutura que ajude essa motivação a se manter na prática.'
    };
  }
  if (safeTags.includes('low_consistency')) {
    return {
      key: 'low_consistency',
      text: 'Sem uma rotina que encaixe de verdade na sua semana, fica muito mais difícil transformar esforço em resultado sustentável.'
    };
  }
  if (safeTags.includes('needs_accountability')) {
    return {
      key: 'needs_accountability',
      text: 'Quando tudo depende apenas de tentativa e motivação, fica mais difícil manter ritmo. Ter uma estrutura clara pode encurtar esse caminho.'
    };
  }
  if (safeTags.includes('good_readiness')) {
    return {
      key: 'good_readiness',
      text: 'Você já tem uma base favorável. Agora, sem uma estratégia mais bem ajustada, parte do seu potencial pode continuar sendo desperdiçada.'
    };
  }

  if (scoreRange === 'low') {
    return {
      key: null,
      text: 'Do jeito que está hoje, fica muito mais difícil sair do lugar com consistência. Com uma estratégia mais clara, esse processo tende a ficar mais simples e mais possível de manter.'
    };
  }
  if (scoreRange === 'medium') {
    return {
      key: null,
      text: 'Você já tem pontos positivos, mas sem uma estratégia melhor organizada, sua evolução tende a acontecer de forma mais lenta e instável.'
    };
  }
  if (scoreRange === 'good') {
    return {
      key: null,
      text: 'Você já está em um bom caminho, mas sem ajustes mais estratégicos, é provável que continue evoluindo abaixo do que poderia.'
    };
  }
  return {
    key: null,
    text: 'Sua base já é boa. Agora, o que faz diferença não é fazer mais, e sim ajustar melhor para continuar evoluindo sem estagnar.'
  };
}

function resolveCtaBlock({ scoreRange, tags, ctaHref }) {
  const safeTags = Array.isArray(tags) ? tags : [];
  if (safeTags.includes('pain_limitation') || safeTags.includes('clinical_attention')) {
    return {
      title: 'Seu próximo passo é ajustar com mais segurança',
      text: 'Eu posso te ajudar a organizar uma estratégia mais segura, respeitando seu momento atual e seu objetivo.',
      buttonLabel: 'Quero uma estratégia mais segura',
      href: ctaHref || '#'
    };
  }
  if (safeTags.includes('high_motivation_low_consistency')) {
    return {
      title: 'Seu próximo passo é transformar motivação em constância',
      text: 'Com a estratégia certa, fica muito mais fácil manter o ritmo e colocar isso em prática de forma consistente.',
      buttonLabel: 'Quero manter isso na prática',
      href: ctaHref || '#'
    };
  }
  if (safeTags.includes('needs_accountability')) {
    return {
      title: 'Seu próximo passo é ter uma estrutura clara',
      text: 'Com uma estratégia mais organizada e acompanhamento certo, fica muito mais fácil transformar intenção em resultado.',
      buttonLabel: 'Quero isso organizado',
      href: ctaHref || '#'
    };
  }
  if (safeTags.includes('low_consistency')) {
    return {
      title: 'Seu próximo passo é criar uma rotina possível de manter',
      text: 'Eu posso te ajudar a organizar uma estratégia mais simples, prática e compatível com a sua rotina.',
      buttonLabel: 'Quero mais consistência',
      href: ctaHref || '#'
    };
  }
  if (safeTags.includes('good_readiness')) {
    return {
      title: 'Seu próximo passo é aproveitar melhor seu potencial',
      text: 'Você já tem uma base favorável. Agora vale organizar melhor sua estratégia para evoluir mais com clareza.',
      buttonLabel: 'Quero otimizar meu resultado',
      href: ctaHref || '#'
    };
  }

  if (scoreRange === 'low') {
    return {
      title: 'Seu próximo passo é organizar a base',
      text: 'Eu posso te entregar uma estratégia mais simples, clara e aplicável para começar do jeito certo.',
      buttonLabel: 'Quero começar do jeito certo',
      href: ctaHref || '#'
    };
  }
  if (scoreRange === 'medium') {
    return {
      title: 'Seu próximo passo é ganhar direção',
      text: 'Com a estratégia certa, você consegue transformar esforço em resultado de forma muito mais consistente.',
      buttonLabel: 'Quero acelerar meus resultados',
      href: ctaHref || '#'
    };
  }
  if (scoreRange === 'good') {
    return {
      title: 'Seu próximo passo é otimizar o que já tem',
      text: 'Você já tem uma boa base. Agora vale organizar melhor sua estratégia para evoluir mais com o mesmo esforço.',
      buttonLabel: 'Quero otimizar meu resultado',
      href: ctaHref || '#'
    };
  }
  return {
    title: 'Seu próximo passo é refinar sua estratégia',
    text: 'Seu maior ganho agora tende a vir de ajustes mais finos, com um plano melhor organizado para o seu objetivo.',
    buttonLabel: 'Quero refinar minha estratégia',
    href: ctaHref || '#'
  };
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
  const scoreRange = resolveScoreRange(lmScore);
  const uiClassificationLabel = classificationLabel || resolveClassificationLabel(lmScore);
  const tension = resolveTensionText({ scoreRange, goal: normalizedGoal, tags });
  const behaviorInsights = resolveBehaviorInsights(tags, tension.key ? [tension.key] : []);
  const diagnosis = resolveDiagnosisText(lmScore);
  const direction = resolveDirectionText({ lmScore, normalizedGoal, classification, profile });
  const cta = resolveCtaBlock({ scoreRange, goal: normalizedGoal, tags, ctaHref });
  const resolvedCtaLabel = ctaButtonLabel || cta.buttonLabel;

  return {
    classificationLabel: uiClassificationLabel,
    diagnosis,
    direction,
    behaviorInsights,
    tension: tension.text,
    tensionTitle: 'Ponto de atenção estratégico',
    tensionText: tension.text,
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
      ...cta,
      buttonLabel: resolvedCtaLabel
    }
  };
}
