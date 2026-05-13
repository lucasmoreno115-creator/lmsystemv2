const form = document.getElementById("lead-form");
const resultCard = document.getElementById("result-card");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

// URL da API (vem do index.html)
const apiBase =
  document.querySelector('meta[name="lm-api-base"]')?.content?.replace(/\/$/, "") || "";

const LINKS = {
  start: "https://pages.mfitpersonal.com.br/p/2i28?checkout=true",
  premium: "https://pages.mfitpersonal.com.br/p/gwa?checkout=true",
  presencial: "https://wa.me/5514991174500?text=Olá,%20Lucas.%20fiz%20o%20diagnóstico%20LM%20e%20quero%20entender%20a%20consultoria%20presencial.",
  whatsapp: "https://wa.me/5514991174500?text=Olá,%20Lucas.%20fiz%20o%20diagnóstico%20LM%20e%20quero%20uma%20orientação%20sobre%20meu%20resultado."
};

// =========================
// SUBMIT
// =========================

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const payload = buildPayload(new FormData(form));
  const validationMessage = validatePayload(payload);

  if (validationMessage) {
    showError(validationMessage);
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${apiBase}/api/diagnostic/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : null;

    if (!response.ok || !json?.ok) {
      const message =
        json?.error?.message ||
        json?.error ||
        `Erro HTTP ${response.status}`;
      throw new Error(message);
    }

    renderResult(json.data, payload);

  } catch (error) {
    console.error("Erro ao gerar diagnóstico:", error);
    showError("Não foi possível gerar seu diagnóstico agora. Tente novamente.");
  } finally {
    setLoading(false);
  }
});


// =========================
// BUILD PAYLOAD
// =========================

function buildPayload(formData) {
  const data = Object.fromEntries(formData);

  return {
    lead: {
      name: String(data.name || "").trim(),
      email: String(data.email || "").trim(),
      whatsapp: String(data.whatsapp || "").trim(),
      goal: String(data.goal || "").trim()
    },
    answers: {
      trainingFrequency: Number(data.trainingFrequency),
      trainingExperience: Number(data.trainingExperience),
      foodAdherence: Number(data.foodAdherence),
      sleepQuality: Number(data.sleepQuality),
      stressLevel: Number(data.stressLevel),
      painInjury: Number(data.painInjury),
      consistencyHistory: Number(data.consistencyHistory),
      motivationLevel: Number(data.motivationLevel)
    },
    meta: {
      source: "github_pages",
      createdAt: new Date().toISOString()
    }
  };
}


// =========================
// VALIDATION
// =========================

function validatePayload(payload) {
  if (!payload.lead.name) return "Informe seu nome.";
  if (!payload.lead.email) return "Informe seu e-mail.";
  if (!payload.lead.whatsapp) return "Informe seu WhatsApp.";
  if (!payload.lead.goal) return "Selecione seu objetivo.";

  for (const value of Object.values(payload.answers)) {
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      return "Responda todas as perguntas.";
    }
  }

  return "";
}


// =========================
// RENDER RESULT - VERSÃO COMERCIAL
// =========================

function renderResult(data, payload) {
  const strategic = data.strategic || {};
  const classification = data.classification || "DIAGNOSTICO_LM";
  const score = Number(data.lmScore ?? 0);
  const tension = strategic.tension || resolveFallbackTension(payload.answers);
  const offer = strategic.offer || resolveFallbackOffer(score, classification);
  const offerConfig = getOfferConfig(offer, score, classification);
  const diagnosis = getDiagnosisCopy(score, classification, tension, payload.lead.goal);

  resultCard.classList.remove("hidden");

  resultCard.innerHTML = `
    <div class="result-topline">Diagnóstico Estratégico LM</div>

    <div class="result-hero">
      <div>
        <h2>${diagnosis.title}</h2>
        <p class="result-intro">${diagnosis.intro}</p>
      </div>

      <div class="score-panel" aria-label="Pontuação do diagnóstico">
        <span class="badge">${formatClassification(classification)}</span>
        <strong>${score}</strong>
        <small>LM Score</small>
      </div>
    </div>

    <div class="insight-grid">
      <article class="insight-card">
        <span>Principal gargalo</span>
        <h3>${getTensionLabel(tension)}</h3>
        <p>${diagnosis.tensionCopy}</p>
      </article>

      <article class="insight-card">
        <span>Próximo movimento</span>
        <h3>${diagnosis.nextStepTitle}</h3>
        <p>${diagnosis.nextStepCopy}</p>
      </article>
    </div>

    <div class="recommendation-box">
      <span class="recommendation-label">Plano recomendado</span>
      <h3>${offerConfig.title}</h3>
      <p>${offerConfig.reason}</p>
      <p class="decision-copy">${offerConfig.decision}</p>
      <ul>
        ${offerConfig.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
      </ul>
    </div>

    <div class="urgency-box">
      <strong>${offerConfig.urgencyTitle}</strong>
      <p>${offerConfig.urgencyCopy}</p>
    </div>

    <div class="result-actions">
      <a class="result-primary" href="${offerConfig.href}" target="_blank" rel="noopener">
        ${offerConfig.cta}
      </a>
      <a class="result-secondary" href="${LINKS.whatsapp}" target="_blank" rel="noopener">
        Quero orientação personalizada
      </a>
    </div>

    <p class="result-disclaimer">Este diagnóstico não substitui avaliação clínica individual. Ele serve para orientar o melhor ponto de partida dentro do Método LM.</p>
  `;

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getDiagnosisCopy(score, classification, tension, goal) {
  const objective = getGoalLabel(goal);
  const tensionLabel = getTensionLabel(tension).toLowerCase();

  if (classification === "BASE_EM_RISCO") {
    return {
      title: "Seu resultado pede estratégia antes de intensidade.",
      intro: `Seu diagnóstico mostrou que existe potencial de evolução, mas o momento exige cuidado, organização e direção. Para ${objective}, o caminho mais inteligente não é apertar mais. É ajustar melhor.`,
      tensionCopy: `O ponto que mais pesa agora é ${tensionLabel}. Ignorar isso pode tornar o processo mais instável, mais cansativo e mais difícil de manter.`,
      nextStepTitle: "Construir uma base segura",
      nextStepCopy: "Antes de buscar um plano agressivo, o ideal é organizar rotina, treino e alimentação com acompanhamento próximo."
    };
  }

  if (score < 50) {
    return {
      title: "Você não precisa de mais tentativa. Precisa de direção.",
      intro: `Seu diagnóstico indica que o principal problema não é falta de vontade. É falta de estrutura simples e executável para ${objective}.`,
      tensionCopy: `Hoje, ${tensionLabel} provavelmente é o fator que mais limita sua evolução. Sem corrigir isso, qualquer plano tende a virar mais um recomeço.`,
      nextStepTitle: "Começar com clareza",
      nextStepCopy: "O melhor movimento é ter uma estratégia inicial objetiva, com treino e nutrição organizados para sua rotina real."
    };
  }

  if (score < 70) {
    return {
      title: "Você já começou, mas ainda falta consistência estratégica.",
      intro: `Seu ponto de partida é bom, mas ainda existem gargalos claros. Para ${objective}, o que vai destravar resultado é ajuste de rota, não mais improviso.`,
      tensionCopy: `O diagnóstico aponta ${tensionLabel} como o principal limitador. Corrigir esse ponto tende a deixar seu progresso mais previsível.`,
      nextStepTitle: "Ajustar a rota",
      nextStepCopy: "Você precisa de um processo acompanhado, com ajustes conforme resposta, adesão e evolução real."
    };
  }

  return {
    title: "Você tem uma boa base. Agora precisa refinar a estratégia.",
    intro: `Seu diagnóstico mostra uma base favorável para ${objective}. O próximo nível depende menos de esforço aleatório e mais de precisão nos ajustes.`,
    tensionCopy: `Mesmo com boa base, ${tensionLabel} ainda aparece como ponto de atenção. Refinar isso pode acelerar o resultado sem precisar de extremos.`,
    nextStepTitle: "Otimizar com acompanhamento",
    nextStepCopy: "O melhor caminho é usar sua base atual com método, progressão e monitoramento estratégico."
  };
}

function getOfferConfig(offer, score, classification) {
  const isLowBase = score < 50 || classification === "BASE_EM_CONSTRUCAO";

  const configs = {
    PLANO_ESTRUTURADO: {
      title: "Plano Start",
      href: LINKS.start,
      cta: "Quero começar com direção",
      reason: "Seu momento não pede mais intensidade. Pede estrutura.",
      decision: "Hoje, o principal bloqueio não está na sua força de vontade. Está na falta de consistência entre treino, rotina e estratégia alimentar. Por isso, o melhor caminho agora não é começar pelo plano mais complexo. É começar pelo plano certo. O Plano Start organiza sua base, cria direção e transforma tentativa em processo.",
      urgencyTitle: "O primeiro passo certo vale mais do que o plano mais caro.",
      urgencyCopy: "Quanto mais tempo você continua sem uma estratégia clara, mais energia gasta recomeçando. O objetivo aqui não é tentar mais uma vez. É construir um processo sustentável.",
      bullets: [
        "Avaliação inicial",
        "Treino personalizado",
        "Direcionamento nutricional",
        "Estratégia inicial com 1 atendimento para dúvidas"
      ]
    },
    CONSULTORIA_ONLINE: {
      title: "Consultoria Premium LM",
      href: LINKS.premium,
      cta: "Quero acompanhamento real",
      reason: "Seu perfil mostra que apenas receber um plano provavelmente não será suficiente.",
      decision: "Você já tem ponto de partida, mas ainda precisa de acompanhamento, ajustes e proximidade para não depender de motivação. A Premium LM é indicada quando o resultado depende menos de saber o que fazer e mais de manter execução com direção.",
      urgencyTitle: "Seu gargalo não é falta de informação. É falta de acompanhamento estratégico.",
      urgencyCopy: "Sem ajuste de rota, o processo fica vulnerável a rotina, estresse e oscilações de adesão. Com acompanhamento, cada semana vira dado para corrigir e avançar.",
      bullets: [
        "Diagnóstico + estratégia individual",
        "Acompanhamento contínuo",
        "Ajustes semanais conforme evolução",
        "Suporte estratégico direto"
      ]
    },
    CONSULTORIA_PREMIUM: {
      title: "Consultoria Premium LM",
      href: LINKS.premium,
      cta: "Entrar para a Premium LM",
      reason: "Esse é o caminho mais indicado quando o objetivo exige direção, constância e acompanhamento real.",
      decision: "Seu perfil pede uma estratégia mais próxima, com treino, nutrição e ajustes contínuos. Aqui, o objetivo não é entregar mais uma rotina. É conduzir sua execução para que o plano funcione dentro da sua vida real.",
      urgencyTitle: "Você não precisa de mais uma tentativa isolada.",
      urgencyCopy: "Quando existe acompanhamento, o processo deixa de depender de perfeição e passa a depender de correção de rota. É isso que sustenta resultado.",
      bullets: [
        "Consultoria presencial inicial",
        "Treino individualizado",
        "Estratégia nutricional personalizada",
        "Acompanhamento e ajustes contínuos"
      ]
    },
    CONSULTORIA_PRESENCIAL: {
      title: "Consultoria Presencial LM",
      href: LINKS.presencial,
      cta: "Solicitar avaliação presencial",
      reason: "Seu perfil se beneficia de maior proximidade, avaliação técnica e correção ao vivo.",
      decision: "Quando existem limitações, insegurança técnica ou necessidade de acompanhamento mais próximo, o presencial reduz erro de execução e aumenta precisão no processo.",
      urgencyTitle: "O presencial é indicado quando segurança e correção precisam vir antes de intensidade.",
      urgencyCopy: "A estratégia fica mais eficiente quando o treino é observado, corrigido e ajustado em tempo real.",
      bullets: [
        "Avaliação física e postural",
        "Treino guiado",
        "Correção técnica em tempo real",
        "Estratégia individualizada completa"
      ]
    }
  };

  if (isLowBase && offer === "CONSULTORIA_ONLINE") {
    return configs.CONSULTORIA_PREMIUM;
  }

  return configs[offer] || configs.CONSULTORIA_PREMIUM;
}

function resolveFallbackOffer(score, classification) {
  if (classification === "BASE_EM_RISCO") return "CONSULTORIA_PREMIUM";
  if (score < 50) return "PLANO_ESTRUTURADO";
  if (score < 75) return "CONSULTORIA_ONLINE";
  return "CONSULTORIA_PREMIUM";
}

function resolveFallbackTension(answers) {
  const groups = {
    adherence: average([answers.consistencyHistory, answers.motivationLevel]),
    nutrition: answers.foodAdherence,
    training: average([answers.trainingFrequency, answers.trainingExperience]),
    recovery: average([answers.sleepQuality, answers.stressLevel]),
    clinical: 6 - answers.painInjury,
    behavior: average([answers.consistencyHistory, answers.foodAdherence])
  };

  return Object.entries(groups).sort((a, b) => a[1] - b[1])[0]?.[0] || "adherence";
}

function average(values) {
  const validValues = values.filter(Number.isFinite);
  if (!validValues.length) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function getTensionLabel(tension) {
  const labels = {
    adherence: "Consistência da rotina",
    nutrition: "Organização alimentar",
    training: "Estrutura do treino",
    recovery: "Recuperação e energia",
    clinical: "Dores ou limitações",
    behavior: "Constância comportamental"
  };

  return labels[tension] || "Estratégia atual";
}

function getGoalLabel(goal) {
  const labels = {
    emagrecimento: "emagrecer com direção e sem extremos",
    definicao_muscular: "definir com controle e preservar massa muscular",
    ganho_massa_muscular: "ganhar massa muscular com progressão real",
    saude_condicionamento: "melhorar saúde, condicionamento e qualidade de vida"
  };

  return labels[goal] || "evoluir com estratégia";
}

// =========================
// FORMAT CLASSIFICATION
// =========================

function formatClassification(classification) {
  const labels = {
    BASE_EM_RISCO: "Base em atenção",
    BASE_EM_CONSTRUCAO: "Base em construção",
    EM_EVOLUCAO: "Em evolução",
    BOA_BASE_COM_ALERTA: "Boa base com ajuste",
    NIVEL_AVANCADO: "Nível avançado"
  };

  return labels[classification] || "Diagnóstico LM";
}


// =========================
// UI HELPERS
// =========================

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  formError.textContent = "";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Gerando diagnóstico..." : "Fazer diagnóstico estratégico";
}
