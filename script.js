const form = document.getElementById("lead-form");
const resultCard = document.getElementById("result-card");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");

// URL da API (vem do index.html)
const apiBase =
  document.querySelector('meta[name="lm-api-base"]')?.content?.replace(/\/$/, "") || "";

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

    renderResult(json.data);

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
// RENDER RESULT
// =========================

function renderResult(data) {
  const strategic = data.strategic || {};

  resultCard.classList.remove("hidden");

  resultCard.innerHTML = `
    <h2>Seu diagnóstico está pronto</h2>

    <div class="score-box">
      <span class="badge">${formatClassification(data.classification)}</span>
      <span class="score">${data.lmScore}</span>
      <p>${strategic.headline || "Este é o seu ponto de partida dentro do Método LM."}</p>
    </div>

    <p>${strategic.copy || "Agora o próximo passo é colocar isso em prática com estratégia."}</p>

    <a href="./planos.html">
      ${strategic.cta?.label || "Ver planos"}
    </a>
  `;

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
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
  submitBtn.textContent = isLoading ? "Gerando diagnóstico..." : "Gerar diagnóstico";
}
