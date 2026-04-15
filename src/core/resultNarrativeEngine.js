import { resolveOfferHref } from './offerCtaConfig.js';

const BASE_NARRATIVE = {
  LOW_ADHERENCE: {
    title: 'Análise do seu momento atual',
    diagnosis:
      'Seu resultado mostra que o problema não está em saber o que fazer. O que está travando sua evolução hoje é a dificuldade em sustentar o básico com consistência.',
    explanation:
      'Existe um padrão claro entre rotina, alimentação e regularidade. Você até consegue começar bem, mas não mantém execução suficiente por tempo suficiente para consolidar resultado.',
    beliefBreak:
      'Não é mais esforço que vai resolver isso. Sem estrutura, a tendência é repetir o ciclo de começar forte, perder ritmo e precisar recomeçar.',
    consequence:
      'Se isso continuar assim, o mais provável é seguir tendo pequenas fases de progresso, seguidas de regressos e frustração.',
    strategicDirection:
      'O que você precisa agora não é de mais informação. Você precisa de uma estrutura que facilite consistência no seu cenário real.',
    bridge: 'E foi exatamente isso que organizei para você a partir do seu diagnóstico.',
    ctaLabel: 'Começar com o plano certo para mim agora',
    ctaSupportText:
      'Uma estrutura pensada para reduzir oscilações e transformar esforço em resultado acumulado.'
  },
  INCONSISTENT: {
    title: 'Análise do seu momento atual',
    diagnosis:
      'Seu resultado mostra que o principal bloqueio hoje não é falta de treino. É falta de estabilidade na execução.',
    explanation:
      'Seu padrão atual oscila. Em alguns momentos você faz bem, mas essa execução não se sustenta. E quando a execução oscila, o resultado oscila junto.',
    beliefBreak:
      'O problema não é motivação momentânea. É a ausência de um plano que sustente constância.',
    consequence:
      'Sem corrigir isso, você tende a continuar começando e recomeçando, sem consolidar evolução de verdade.',
    strategicDirection:
      'O próximo passo certo não é tentar mais uma vez sozinho. É organizar o processo do jeito certo.',
    bridge:
      'A partir do que você respondeu, a melhor direção para o seu momento é uma estrutura mais guiada e objetiva.',
    ctaLabel: 'Corrigir isso agora com um plano estruturado',
    ctaSupportText: 'Um plano desenhado para dar direção clara e reduzir perda de ritmo.'
  },
  HIGH_RISK: {
    title: 'Análise do seu momento atual',
    diagnosis:
      'Seu resultado mostra que antes de pensar em acelerar resultado, seu corpo precisa de mais segurança, controle e ajuste.',
    explanation:
      'Hoje existem sinais de atenção que indicam que a estratégia precisa ser mais bem direcionada, respeitando seu momento atual.',
    beliefBreak:
      'Forçar intensidade ou seguir algo genérico agora seria um erro. O seu próximo passo precisa ser mais inteligente, não mais agressivo.',
    consequence:
      'Se isso for ignorado, você aumenta a chance de continuar travado, desconfortável ou sem conseguir evoluir com segurança.',
    strategicDirection:
      'O foco agora é organizar uma base segura e eficiente para o seu corpo responder melhor.',
    bridge: 'Por isso, a recomendação precisa ser mais estratégica e personalizada neste momento.',
    ctaLabel: 'Seguir com a estratégia certa para o meu momento',
    ctaSupportText: 'Uma direção mais segura, ajustada e coerente com o seu cenário atual.'
  },
  PLATEAU: {
    title: 'Análise do seu momento atual',
    diagnosis:
      'Seu resultado mostra que você já faz parte do básico, mas sua evolução parece limitada por falta de ajuste fino.',
    explanation:
      'Você não está no zero. O problema é que o que te trouxe até aqui não é, necessariamente, o que vai te levar para o próximo nível.',
    beliefBreak:
      'Quando o resultado trava, mais do mesmo raramente resolve. O que falta normalmente é precisão.',
    consequence:
      'Se nada mudar, a tendência é continuar se esforçando sem perceber avanço proporcional.',
    strategicDirection: 'O que você precisa agora é de uma estratégia melhor ajustada ao seu momento.',
    bridge: 'Seu diagnóstico mostra que já existe base. Agora o foco precisa ser em direcionamento mais inteligente.',
    ctaLabel: 'Destravar meu próximo nível com o plano certo',
    ctaSupportText: 'Ajustes mais precisos para transformar esforço em evolução real.'
  },
  BEGINNER_LOST: {
    title: 'Análise do seu momento atual',
    diagnosis: 'Seu resultado mostra que o maior bloqueio hoje não é esforço. É direção.',
    explanation:
      'Quando não existe clareza sobre o que fazer, o processo vira tentativa e erro. E isso atrasa resultado, gera insegurança e dificulta consistência.',
    beliefBreak:
      'Você não precisa de mais confusão, nem de mais conteúdo solto. Você precisa de um caminho claro.',
    consequence:
      'Se continuar assim, o mais provável é perder tempo com estratégias pouco organizadas e avançar abaixo do que poderia.',
    strategicDirection:
      'O próximo passo certo é começar com uma estrutura simples, objetiva e ajustada ao seu momento.',
    bridge: 'Foi exatamente para isso que organizei essa recomendação com base no seu diagnóstico.',
    ctaLabel: 'Começar do jeito certo agora',
    ctaSupportText: 'Mais clareza, menos tentativa e erro.'
  },
  HIGH_PERFORMER: {
    title: 'Análise do seu momento atual',
    diagnosis:
      'Seu resultado mostra que você já está acima da média em vários pontos importantes. O seu jogo agora não é começar — é otimizar.',
    explanation:
      'Você já tem base. O que limita seu próximo salto tende a ser ajuste fino, precisão e estratégia.',
    beliefBreak: 'Neste estágio, continuar no automático custa caro. Melhorar exige intenção.',
    consequence:
      'Sem esse refinamento, você pode manter uma boa rotina e ainda assim ficar abaixo do seu potencial.',
    strategicDirection:
      'O melhor próximo passo é usar uma estratégia mais precisa para extrair mais resultado do que você já faz.',
    bridge: 'O seu diagnóstico indica potencial real para um plano mais ajustado e estratégico.',
    ctaLabel: 'Avançar com uma estratégia no meu nível',
    ctaSupportText: 'Mais precisão para gerar evolução acima da média.'
  }
};

export function buildResultNarrative({ clientState, recommendedOffer } = {}) {
  const resolvedState = BASE_NARRATIVE[clientState] ? clientState : 'BEGINNER_LOST';
  const narrative = BASE_NARRATIVE[resolvedState];

  return {
    eyebrow: 'Diagnóstico estratégico personalizado',
    title: narrative.title,
    diagnosis: narrative.diagnosis,
    explanation: narrative.explanation,
    beliefBreak: narrative.beliefBreak,
    consequence: narrative.consequence,
    strategicDirection: narrative.strategicDirection,
    bridge: narrative.bridge,
    ctaLabel: narrative.ctaLabel,
    ctaHref: resolveOfferHref(recommendedOffer),
    ctaSupportText: narrative.ctaSupportText
  };
}
