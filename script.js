const form = document.getElementById("lead-form");
const resultCard = document.getElementById("result-card");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

const apiBase =
  document.querySelector('meta[name="lm-api-base"]')?.content?.replace(/\/$/, "") || "";

const PLAN_LINKS = {
  PLANO_ESTRUTURADO: "./plano-estruturado.html",
  CONSULTORIA_ONLINE: "./consultoria-premium.html",
  CONSULTORIA_PREMIUM: "./consultoria-premium.html",
  CONSULTORIA_PRESENCIAL: "./consultoria-presencial.html"
};

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

    renderResult(json.data);
  } catch (error) {
    console.error("Erro ao gerar diagnóstico:", error);
    showError("Não foi possível gerar seu diagnóstico agora. Verifique os dados e tente novamente.");
  } finally {
    setLoading(false);
  }
});

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

function validatePayload(payload) {
  if (!payload.lead.name) return "Informe seu nome.";
  if (!payload.lead.email) return "Informe seu e-mail.";
  if (!payload.lead.whatsapp) return "Informe seu WhatsApp.";
  if (!payload.lead.goal) return "Selecione seu objetivo.";

  for (const [key, value] of Object.entries(payload.answers)) {
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      return "Responda todas as perguntas antes de gerar o diagnóstico.";
    }
  }

  return "";
}

function renderResult(data) {
  const strategic = data.strategic || {};
  const offer = strategic.offer || data.recommendedOffer || "PLANO_ESTRUTURADO";
  const href = strategic.cta?.href || PLAN_LINKS[offer] || "./planos.html";
  const label = strategic.cta?.label || "Conhecer o plano recomendado";

  resultCard.classList.remove("hidden");
  resultCard.innerHTML = `
    <h2>Seu diagnóstico está pronto</h2>

    <div class="score-box">
      <span class="badge">${formatClassification(data.classification)}</span>
      <span class="score">${data.lmScore}</span>
      <p>${strategic.headline || "Este é o seu ponto de partida dentro do Método LM."}</p>
    </div>

    <p>${strategic.copy || "Com base nas suas respostas, o próximo passo é estruturar treino, alimentação e rotina com direção clara."}</p>

    <a href="${href}">${label}</a>
  `;

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatClassification(classification) {
  const labels = {
    BASE_EM_RISCO: "Base em atenção",
    BASE_EM_CONSTRUCAO: "Base em construção",
    EM_EVOLUCAO: "Em evolução",
    BOA_BASE_COM_ALERTA: "Boa base com ajuste",
    NIVEL_AVANCADO: "Nível avançado"
  };

  return labels[classification] || classification || "Diagnóstico LM";
}

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  formError.textContent = "";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Gerando diagnóstico..." : "Gerar diagnóstico";
}
