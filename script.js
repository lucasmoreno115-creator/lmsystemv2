const form = document.getElementById("lead-form");
const resultCard = document.getElementById("result-card");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

// URL da API (vem do index.html)
const apiBase =
  document.querySelector('meta[name="lm-api-base"]')?.content?.replace(/\/$/, "") || "";

const WHATSAPP_NUMBER = "5514991174500";

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
// RENDER RESULT - SESSÃO ESTRATÉGICA LM
// =========================

function renderResult(data, payload) {
  const strategic = data.strategic || {};
  const classification = data.classification || "DIAGNOSTICO_LM";
  const score = Number(data.lmScore ?? 0);
  const tension = strategic.tension || resolveFallbackTension(payload.answers);
  const priority = strategic.priority || data.leadValue || resolveFallbackPriority(score, classification);
  const diagnosis = getDiagnosisCopy(score, classification, tension, payload.lead.goal);
  const bottleneckInsight = getBottleneckInsight(tension);
  const priorityDirection = getPriorityDirection(tension, priority);
  const whatsappLink = buildWhatsAppLink({
    objective: getGoalLabel(payload.lead.goal),
    classification,
    score,
    bottleneck: getTensionLabel(tension),
    priority: getPriorityLabel(priority)
  });
  const tags = Array.isArray(data.tags) ? data.tags : [];

  resultCard.classList.remove("hidden");

  resultCard.innerHTML = `
    <div class="result-topline">Diagnóstico Estratégico LM</div>

    <div class="result-hero">
      <div>
        <h2>${diagnosis.title}</h2>
        <p class="result-intro">${diagnosis.intro}</p>
      </div>

      <div class="score-panel" aria-label="Pontuação do diagnóstico">
        <strong>${score}</strong>
        <small>LM Score</small>
        <span class="badge">${formatClassification(classification)}</span>
      </div>
    </div>

    <div class="insight-grid">
      <article class="insight-card">
        <span>Principal ponto de atenção</span>
        <h3>${getTensionLabel(tension)}</h3>
        <p>${diagnosis.tensionCopy}</p>
      </article>

      <article class="insight-card">
        <span>Prioridade principal</span>
        <h3>${getPriorityLabel(priority)}</h3>
        <p>${diagnosis.nextStepCopy}</p>
      </article>
    </div>

    <div class="coach-summary-box">
      <span class="recommendation-label">O que seu diagnóstico mostrou</span>
      <h3>${bottleneckInsight.title}</h3>
      <p>${bottleneckInsight.copy}</p>
    </div>

    <div class="priority-direction-box">
      <span class="recommendation-label">O que faria mais diferença agora</span>
      <h3>${priorityDirection.title}</h3>
      <p>${priorityDirection.copy}</p>
    </div>

    ${tags.length ? `
      <div class="tags-box" aria-label="Tags do diagnóstico">
        ${tags.map((tag) => `<span>${formatTag(tag)}</span>`).join("")}
      </div>
    ` : ""}

    <div class="next-step-box cta-box">
      <span class="recommendation-label">Receba uma orientação sobre o seu caso</span>
      <h3>Receba uma orientação sobre o seu caso</h3>
      <p>Seu diagnóstico identificou os principais fatores que podem estar limitando seus resultados hoje.</p>
      <p>Se quiser entender como aplicar essas informações na sua rotina e quais seriam os próximos passos mais indicados para sua situação, clique abaixo e converse comigo.</p>
    </div>

    <div class="result-actions single-action">
      <a class="result-primary" href="${whatsappLink}" target="_blank" rel="noopener">
        Quero receber uma orientação
      </a>
    </div>

    <p class="result-disclaimer">Este diagnóstico não substitui avaliação clínica individual. Ele serve para orientar clareza, direção e os próximos ajustes dentro do Método LM.</p>
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
      tensionCopy: `O ponto que mais pesa agora é ${tensionLabel}. Observar esse fator ajuda a tornar o processo mais claro, sustentável e possível de acompanhar.`,
      nextStepTitle: "Construir uma base segura",
      nextStepCopy: "A prioridade é organizar rotina, treino e alimentação com clareza, acompanhamento e ajustes consistentes."
    };
  }

  if (score < 50) {
    return {
      title: "Você não precisa de mais tentativa. Precisa de direção.",
      intro: `Seu diagnóstico indica que o principal problema não é falta de vontade. É falta de estrutura simples e executável para ${objective}.`,
      tensionCopy: `Hoje, ${tensionLabel} provavelmente é o fator que mais limita sua evolução. Corrigir esse ponto dá mais previsibilidade ao processo.`,
      nextStepTitle: "Começar com clareza",
      nextStepCopy: "A prioridade é definir uma estratégia inicial objetiva, conectada à sua rotina real e ajustável ao longo do caminho."
    };
  }

  if (score < 70) {
    return {
      title: "Você já começou, mas ainda falta consistência estratégica.",
      intro: `Seu ponto de partida é bom, mas ainda existem pontos de atenção claros. Para ${objective}, o que tende a destravar evolução é ajuste de rota, não mais improviso.`,
      tensionCopy: `O diagnóstico aponta ${tensionLabel} como o fator que mais merece atenção. Ajustar esse ponto tende a deixar seu progresso mais previsível.`,
      nextStepTitle: "Ajustar a rota",
      nextStepCopy: "A prioridade é acompanhar respostas, adesão e evolução real para transformar dados em ajustes práticos."
    };
  }

  return {
    title: "Você tem uma boa base. Agora precisa refinar a estratégia.",
    intro: `Seu diagnóstico mostra uma base favorável para ${objective}. O próximo nível depende menos de esforço aleatório e mais de precisão nos ajustes.`,
    tensionCopy: `Mesmo com boa base, ${tensionLabel} ainda aparece como ponto de atenção. Refinar isso ajuda a evoluir com mais constância e menos extremos.`,
    nextStepTitle: "Otimizar com acompanhamento",
    nextStepCopy: "A prioridade é usar sua base atual com método, progressão, monitoramento e ajustes mais precisos."
  };
}

function getBottleneckInsight(tension) {
  const rule = getStrategicRule(tension);

  return {
    title: rule.bottleneckTitle,
    copy: rule.bottleneckCopy
  };
}

function getPriorityDirection(tension, priority) {
  const rule = getStrategicRule(tension);
  const priorityText = getPriorityText(priority);

  return {
    title: rule.directionTitle,
    copy: `${rule.directionCopy} Na prática, a prioridade agora é ${priorityText}, sem depender de mudanças extremas ou decisões soltas.`
  };
}

function buildWhatsAppLink({ objective, classification, score, bottleneck, priority }) {
  const message = [
    "Olá Lucas.",
    "",
    "Acabei de finalizar meu Diagnóstico LM.",
    "",
    `Meu objetivo é: ${objective}`,
    "",
    `Minha classificação foi: ${formatClassification(classification)}`,
    "",
    `Meu LM Score foi: ${score}`,
    "",
    `O principal ponto de atenção identificado foi: ${bottleneck}`,
    "",
    `Minha prioridade principal é: ${priority}`,
    "",
    "Gostaria de receber uma orientação sobre meu caso e entender quais seriam os próximos passos mais indicados para minha situação."
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getStrategicRule(tension) {
  const rules = {
    adherence: {
      bottleneckTitle: "Seu desafio hoje não parece ser falta de informação",
      bottleneckCopy: "Seu diagnóstico sugere que a principal dificuldade está em transformar intenção em consistência. Você provavelmente já sabe o que deveria fazer. O desafio está em conseguir repetir essas ações por tempo suficiente para que elas produzam resultado.",
      directionTitle: "Transformar intenção em rotina executável",
      directionCopy: "O que mais faria diferença é simplificar a estratégia, definir poucas ações-chave e criar um ritmo possível de cumprir mesmo em semanas menos perfeitas."
    },
    behavior: {
      bottleneckTitle: "Sua constância comportamental está limitando o avanço",
      bottleneckCopy: "O diagnóstico aponta que o desafio central está em manter decisões alinhadas por tempo suficiente para que treino, alimentação e recuperação produzam resposta real.",
      directionTitle: "Criar um processo mais previsível",
      directionCopy: "O que mais faria diferença é reduzir improvisos, estabelecer critérios simples de acompanhamento e ajustar o plano conforme sua adesão real."
    },
    nutrition: {
      bottleneckTitle: "Sua alimentação precisa de mais direção prática",
      bottleneckCopy: "O diagnóstico mostra que a organização alimentar provavelmente é o fator que mais limita seus resultados, não por falta de esforço, mas por falta de uma estrutura simples para sustentar escolhas melhores no dia a dia.",
      directionTitle: "Organizar a alimentação antes de apertar o treino",
      directionCopy: "O que mais faria diferença é alinhar refeições, rotina e objetivo para melhorar adesão, energia e controle, sem transformar alimentação em restrição extrema."
    },
    recovery: {
      bottleneckTitle: "Seu treino pode não ser o principal problema neste momento",
      bottleneckCopy: "O diagnóstico sugere que recuperação, energia ou qualidade do sono estão reduzindo sua capacidade de responder bem ao processo. Quando isso acontece, mais esforço nem sempre significa mais resultado.",
      directionTitle: "Proteger energia para evoluir com mais estabilidade",
      directionCopy: "O que mais faria diferença é ajustar carga, descanso e rotina para que o plano seja sustentável e gere resposta, em vez de apenas acumular desgaste."
    },
    training: {
      bottleneckTitle: "Seu treino precisa de mais estrutura",
      bottleneckCopy: "O diagnóstico mostra que o treino pode não estar suficientemente organizado em frequência, progressão ou adequação ao seu momento, o que deixa a evolução menos previsível.",
      directionTitle: "Treinar com progressão e critério",
      directionCopy: "O que mais faria diferença é definir uma estrutura de treino coerente com seu objetivo, acompanhar execução e ajustar volume, intensidade e frequência com método."
    },
    clinical: {
      bottleneckTitle: "Dores ou limitações precisam entrar na estratégia",
      bottleneckCopy: "O diagnóstico sinaliza que algum desconforto ou limitação pode estar interferindo na constância e na qualidade do processo.",
      directionTitle: "Ajustar o plano para preservar continuidade",
      directionCopy: "O que mais faria diferença é adaptar treino, recuperação e evolução de carga para reduzir atritos e manter o processo seguro e executável."
    }
  };

  return rules[tension] || rules.adherence;
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

function resolveFallbackPriority(score, classification) {
  if (classification === "BASE_EM_RISCO" || score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
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

function getTensionText(tension) {
  const labels = {
    adherence: "consistência da rotina",
    nutrition: "organização alimentar",
    training: "estrutura do treino",
    recovery: "recuperação e energia",
    clinical: "necessidade de ajustar dores ou limitações",
    behavior: "constância comportamental"
  };

  return labels[tension] || "clareza da estratégia atual";
}

function getPriorityLabel(priority) {
  const labels = {
    high: "Otimização Estratégica",
    medium: "Construção da Base",
    low: "Direção Inicial"
  };

  return labels[String(priority || "").toLowerCase()] || "Clareza estratégica";
}

function getPriorityText(priority) {
  const labels = {
    high: "avançar com otimização estratégica para ajustar o processo com mais precisão",
    medium: "construir uma base mais consistente e sustentável para sua rotina",
    low: "ganhar direção inicial antes de aumentar complexidade"
  };

  return labels[String(priority || "").toLowerCase()] || "ganhar clareza sobre os próximos ajustes";
}

function formatTag(tag) {
  const labels = {
    low_consistency: "baixa consistência",
    nutrition_attention: "atenção alimentar",
    recovery_attention: "recuperação",
    pain_attention: "dor/limitação",
    high_motivation: "alta disposição"
  };

  return labels[tag] || String(tag).replace(/_/g, " ");
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
