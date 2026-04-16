import { resolveOfferHref } from './offerCtaConfig.js';
import { AVAILABLE_VARIANTS, DEFAULT_VARIANT } from './experiments/resultExperimentConfig.js';

const BASE_NARRATIVE_BY_STATE = {
  LOW_ADHERENCE: {
    title: 'Análise do seu momento atual',
    consequence:
      'Se isso continuar assim, o mais provável é seguir tendo pequenas fases de progresso, seguidas de regressos e frustração.'
  },
  INCONSISTENT: {
    title: 'Análise do seu momento atual',
    consequence:
      'Sem corrigir isso, você tende a continuar começando e recomeçando, sem consolidar evolução de verdade.'
  },
  HIGH_RISK: {
    title: 'Análise do seu momento atual',
    consequence:
      'Se isso for ignorado, você aumenta a chance de continuar travado, desconfortável ou sem conseguir evoluir com segurança.'
  },
  PLATEAU: {
    title: 'Análise do seu momento atual',
    consequence:
      'Se nada mudar, a tendência é continuar se esforçando sem perceber avanço proporcional.'
  },
  BEGINNER_LOST: {
    title: 'Análise do seu momento atual',
    consequence:
      'Se continuar assim, o mais provável é perder tempo com estratégias pouco organizadas e avançar abaixo do que poderia.'
  },
  HIGH_PERFORMER: {
    title: 'Análise do seu momento atual',
    consequence:
      'Sem esse refinamento, você pode manter uma boa rotina e ainda assim ficar abaixo do seu potencial.'
  }
};

const VARIANT_COPY_BY_STATE = {
  A: {
    LOW_ADHERENCE: {
      diagnosis:
        'Você não está travando por falta de esforço. O bloqueio é estrutural: sem consistência no básico, seu resultado sempre volta para o mesmo ponto.',
      explanation:
        'Seu padrão mostra arranques fortes e perda de ritmo em seguida. Mais do mesmo não vai resolver, porque o problema não está no início — está na manutenção.',
      beliefBreak:
        'Enquanto a execução depender só de motivação, o ciclo se repete. O que muda jogo é estrutura com cobrança e direção.',
      strategicDirection:
        'A decisão certa agora é corrigir sua base com um plano que force constância no seu cenário real.',
      bridge: 'Seu diagnóstico já mostra onde ajustar. O próximo passo é agir agora com a estratégia certa.',
      ctaLabel: 'Corrigir isso agora com o plano certo',
      ctaSupportText: 'Estrutura para quebrar o ciclo de oscilar e consolidar evolução real.'
    },
    INCONSISTENT: {
      diagnosis:
        'Seu bloqueio hoje não é treinar mais. É parar de oscilar na execução e sair do ciclo de começar e parar.',
      explanation:
        'Você entrega em alguns períodos, mas não sustenta. Sem estabilidade, cada avanço vira exceção e não resultado acumulado.',
      beliefBreak:
        'Tentar “dar um gás” de novo não resolve o estrutural. Você precisa de processo e decisão, não de empolgação momentânea.',
      strategicDirection:
        'A melhor jogada agora é organizar um plano mais firme para estabilizar sua execução de vez.',
      bridge: 'Seu momento pede direção prática e imediata para parar de perder ritmo.',
      ctaLabel: 'Virar esse jogo agora com estrutura',
      ctaSupportText: 'Plano objetivo para reduzir recaídas e manter evolução contínua.'
    },
    HIGH_RISK: {
      diagnosis:
        'Seu cenário exige correção imediata de rota: acelerar sem controle agora só aumenta risco e trava resultado.',
      explanation:
        'Existem sinais claros de que o próximo passo precisa ser técnico e estratégico. Insistir no genérico aqui custa caro.',
      beliefBreak:
        'Forçar intensidade não é coragem, é erro de estratégia. Primeiro ajuste inteligente, depois aceleração com segurança.',
      strategicDirection:
        'O foco agora é corrigir sua base clínica e operacional para seu corpo voltar a responder com segurança.',
      bridge: 'Seu diagnóstico é claro: agora é hora de acertar a estratégia antes de cobrar performance.',
      ctaLabel: 'Ajustar minha estratégia agora com segurança',
      ctaSupportText: 'Direção profissional para evoluir sem aumentar risco desnecessário.'
    },
    PLATEAU: {
      diagnosis:
        'Você já faz o básico, mas está preso no platô porque seu processo ficou previsível demais para gerar novo resultado.',
      explanation:
        'Seu nível atual pede ajuste fino. Repetir o mesmo protocolo não vai destravar o próximo salto.',
      beliefBreak:
        'Quando a evolução trava, insistir no automático é desperdiçar esforço. O que resolve é precisão estratégica.',
      strategicDirection:
        'Agora é sobre decidir por uma estratégia mais cirúrgica para destravar resultado proporcional ao seu esforço.',
      bridge: 'Seu diagnóstico mostra potencial de avanço imediato com ajustes mais inteligentes.',
      ctaLabel: 'Destravar meu próximo nível agora',
      ctaSupportText: 'Ajustes estratégicos para sair do platô com consistência.'
    },
    BEGINNER_LOST: {
      diagnosis:
        'Seu maior bloqueio não é vontade: é falta de direção prática. Sem isso, você gira em tentativa e erro.',
      explanation:
        'Quando não existe plano claro, você gasta energia em caminhos conflitantes e o resultado não aparece no ritmo que deveria.',
      beliefBreak:
        'Mais conteúdo solto só aumenta ruído. O que resolve agora é uma rota objetiva com prioridades claras.',
      strategicDirection:
        'A decisão mais inteligente é começar já com um método enxuto, guiado e executável no seu momento atual.',
      bridge: 'Seu diagnóstico já aponta a trilha. O próximo passo é parar de improvisar e executar certo.',
      ctaLabel: 'Começar certo agora sem improviso',
      ctaSupportText: 'Direção simples para acelerar progresso desde as próximas semanas.'
    },
    HIGH_PERFORMER: {
      diagnosis:
        'Você já está acima da média, mas continuar no automático aqui limita o seu teto e mantém ganho abaixo do potencial.',
      explanation:
        'Sua base é sólida. O que separa seu próximo nível é ajuste de precisão, leitura de contexto e execução estratégica.',
      beliefBreak:
        'Neste estágio, mais volume sem refinamento vira desperdício. Resultado premium exige decisão técnica.',
      strategicDirection:
        'Agora é hora de elevar seu padrão com uma estratégia de alta precisão para converter esforço em performance superior.',
      bridge: 'Seu diagnóstico confirma potencial para subir de patamar com ajustes assertivos.',
      ctaLabel: 'Escalar meu nível agora com precisão',
      ctaSupportText: 'Refinamento avançado para acelerar performance com inteligência.'
    }
  },
  B: {
    LOW_ADHERENCE: {
      diagnosis:
        'Seu resultado indica que existe um padrão claro: você sabe o que fazer, mas ainda não sustenta o básico com consistência suficiente.',
      explanation:
        'A execução começa bem, porém perde continuidade ao longo do tempo. Com isso, o esforço não vira resultado acumulado.',
      beliefBreak:
        'Não é uma questão de força de vontade isolada. O ponto principal é ter uma estrutura simples que facilite manter o plano.',
      strategicDirection:
        'A melhor estratégia agora é estabilizar sua rotina com um processo viável para a sua realidade.',
      bridge: 'Foi com esse objetivo que organizei sua recomendação estratégica personalizada.',
      ctaLabel: 'Começar com o plano certo para meu momento',
      ctaSupportText: 'Uma estrutura prática para transformar constância em evolução real.'
    },
    INCONSISTENT: {
      diagnosis:
        'Seu principal gargalo hoje é a inconsistência de execução, não falta de capacidade.',
      explanation:
        'Você tem períodos bons, mas eles não se mantêm. Quando a constância cai, o resultado também perde tração.',
      beliefBreak:
        'A questão não é “se esforçar mais por alguns dias”. É criar um plano que sustente regularidade no médio prazo.',
      strategicDirection:
        'O próximo passo mais seguro é adotar uma estratégia mais organizada, com metas claras e acompanhamento.',
      bridge: 'Seu diagnóstico aponta que consistência é a alavanca principal de evolução neste momento.',
      ctaLabel: 'Organizar meu plano com direção clara',
      ctaSupportText: 'Mais estabilidade para evoluir sem depender de picos de motivação.'
    },
    HIGH_RISK: {
      diagnosis:
        'Seu resultado mostra que o ponto central agora é segurança estratégica antes de aceleração.',
      explanation:
        'Há sinais de que sua execução precisa de ajustes mais técnicos para respeitar seu contexto atual e evitar sobrecarga.',
      beliefBreak:
        'Neste momento, avançar com método é mais eficiente do que intensificar sem critério.',
      strategicDirection:
        'A melhor abordagem agora é consolidar uma base segura e progressiva para evoluir com confiança.',
      bridge: 'Sua recomendação foi organizada para priorizar controle, previsibilidade e avanço sustentável.',
      ctaLabel: 'Seguir com uma estratégia segura e eficaz',
      ctaSupportText: 'Plano ajustado para evoluir com mais confiança e menos risco.'
    },
    PLATEAU: {
      diagnosis:
        'Seu diagnóstico indica um cenário típico de platô: boa base construída, mas com necessidade de ajustes de precisão.',
      explanation:
        'Seu esforço atual é relevante, porém a estratégia ainda não está otimizada o suficiente para gerar novo salto.',
      beliefBreak:
        'Quando há estagnação, a resposta costuma ser calibrar melhor o método, não apenas repetir mais do mesmo.',
      strategicDirection:
        'Agora faz sentido evoluir com uma estratégia mais refinada e adequada ao seu nível atual.',
      bridge: 'Seu momento pede direção técnica para converter a base existente em crescimento consistente.',
      ctaLabel: 'Refinar minha estratégia para evoluir',
      ctaSupportText: 'Ajustes inteligentes para sair do platô com previsibilidade.'
    },
    BEGINNER_LOST: {
      diagnosis:
        'Seu maior desafio hoje é falta de direção clara, não falta de interesse em melhorar.',
      explanation:
        'Sem um caminho objetivo, a execução fica dispersa e o progresso acontece abaixo do potencial.',
      beliefBreak:
        'Você não precisa de mais complexidade. Precisa começar com o plano certo para o seu momento.',
      strategicDirection:
        'A estratégia mais eficiente agora é seguir uma estrutura simples, guiada e com prioridades bem definidas.',
      bridge: 'Foi exatamente isso que organizei para você com base no seu diagnóstico.',
      ctaLabel: 'Começar com o plano certo para mim agora',
      ctaSupportText: 'Clareza de execução para acelerar resultados sem confusão.'
    },
    HIGH_PERFORMER: {
      diagnosis:
        'Seu resultado mostra que você já opera em nível elevado, com espaço real para ganho adicional por refinamento estratégico.',
      explanation:
        'A base está presente. O próximo avanço depende de ajustes mais precisos e consistentes na tomada de decisão.',
      beliefBreak:
        'Neste estágio, evolução sustentável vem de estratégia bem calibrada, não apenas de aumentar esforço bruto.',
      strategicDirection:
        'A melhor direção agora é aplicar um plano mais avançado e orientado a performance.',
      bridge: 'Seu diagnóstico indica maturidade para uma estratégia de otimização mais sofisticada.',
      ctaLabel: 'Avançar com uma estratégia no meu nível',
      ctaSupportText: 'Mais precisão para extrair o máximo do que você já construiu.'
    }
  }
};

function resolveState(clientState) {
  return BASE_NARRATIVE_BY_STATE[clientState] ? clientState : 'BEGINNER_LOST';
}

function resolveVariant(variant) {
  return AVAILABLE_VARIANTS.includes(variant) ? variant : DEFAULT_VARIANT;
}

export function buildResultNarrative({ clientState, recommendedOffer, variant } = {}) {
  const resolvedState = resolveState(clientState);
  const resolvedVariant = resolveVariant(variant);
  const baseNarrative = BASE_NARRATIVE_BY_STATE[resolvedState];
  const variantNarrative = VARIANT_COPY_BY_STATE[resolvedVariant]?.[resolvedState];
  const safeFallbackNarrative = VARIANT_COPY_BY_STATE[DEFAULT_VARIANT][resolvedState];
  const narrative = variantNarrative || safeFallbackNarrative;

  return {
    eyebrow: 'Diagnóstico estratégico personalizado',
    title: baseNarrative.title,
    diagnosis: narrative.diagnosis,
    explanation: narrative.explanation,
    beliefBreak: narrative.beliefBreak,
    consequence: baseNarrative.consequence,
    strategicDirection: narrative.strategicDirection,
    bridge: narrative.bridge,
    ctaLabel: narrative.ctaLabel,
    ctaHref: resolveOfferHref(recommendedOffer),
    ctaSupportText: narrative.ctaSupportText,
    variant: resolvedVariant
  };
}
