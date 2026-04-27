export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        return jsonResponse({
          ok: true,
          status: "ok",
          version: "LM_SYSTEM_ZERO_V1",
          timestamp: new Date().toISOString()
        }, 200, corsHeaders);
      }

      if (request.method !== "POST" || url.pathname !== "/api/diagnostic/evaluate") {
        return jsonResponse({
          ok: false,
          error: { code: "NOT_FOUND", message: "Rota não encontrada." }
        }, 404, corsHeaders);
      }

      if (!env.DB) {
        return jsonResponse({
          ok: false,
          error: { code: "DB_NOT_CONFIGURED", message: "Binding D1 env.DB não configurado." }
        }, 500, corsHeaders);
      }

      const body = await safeJson(request);
      const normalized = validateAndNormalize(body);

      await ensureSchema(env.DB);

      const now = new Date().toISOString();
      const leadId = crypto.randomUUID();

      await env.DB.prepare(`
        INSERT INTO leads (id, name, email, whatsapp, goal, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        leadId,
        normalized.lead.name,
        normalized.lead.email,
        normalized.lead.whatsapp,
        normalized.lead.goal,
        now
      )
      .run();

      const result = calculateScore(normalized);
      const classification = classifyScore(result.lmScore, result.dimensions);
      const tags = buildTags(normalized);
      const strategic = resolveStrategicResult(
        result.lmScore,
        result.dimensions,
        normalized.lead.goal,
        classification
      );

      await env.DB.prepare(`
        INSERT INTO diagnostic_results (
          id,
          lead_id,
          engine_version,
          lm_score,
          classification,
          dimensions_json,
          weights_json,
          tags_json,
          client_state,
          recommended_offer,
          lead_priority,
          strategic_result_json,
          raw_answers_json,
          meta_json,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        leadId,
        "LM_SYSTEM_ZERO_V1",
        result.lmScore,
        classification,
        JSON.stringify(result.dimensions),
        JSON.stringify(result.weights),
        JSON.stringify(tags),
        classification,
        strategic.offer,
        strategic.priority,
        JSON.stringify(strategic),
        JSON.stringify(normalized.answers),
        JSON.stringify(normalized.meta),
        now
      )
      .run();

      return jsonResponse({
        ok: true,
        data: {
          leadId,
          lmScore: result.lmScore,
          classification,
          dimensions: result.dimensions,
          recommendedOffer: strategic.offer,
          strategic
        }
      }, 200, corsHeaders);

    } catch (error) {
      console.error("LM_SYSTEM_ERROR", {
        message: error?.message,
        stack: error?.stack
      });

      const status = error?.status || 500;
      const code = error?.code || "INTERNAL_ERROR";
      const message =
        status === 500
          ? "Não foi possível processar o diagnóstico."
          : error.message;

      return jsonResponse({
        ok: false,
        error: { code, message }
      }, status, corsHeaders);
    }
  }
};

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    throw appError("INVALID_JSON", "JSON inválido.", 400);
  }
}

function validateAndNormalize(body) {
  if (!body || typeof body !== "object") {
    throw appError("INVALID_BODY", "Payload inválido.", 400);
  }

  const lead = body.lead && typeof body.lead === "object" ? body.lead : {};
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

  const normalized = {
    lead: {
      name: cleanString(lead.name),
      email: cleanString(lead.email),
      whatsapp: cleanString(lead.whatsapp),
      goal: cleanString(lead.goal)
    },
    answers: {
      trainingFrequency: toScore(answers.trainingFrequency),
      trainingExperience: toScore(answers.trainingExperience),
      foodAdherence: toScore(answers.foodAdherence),
      sleepQuality: toScore(answers.sleepQuality),
      stressLevel: toScore(answers.stressLevel),
      painInjury: toScore(answers.painInjury),
      consistencyHistory: toScore(answers.consistencyHistory),
      motivationLevel: toScore(answers.motivationLevel)
    },
    meta: body.meta && typeof body.meta === "object" ? body.meta : {}
  };

  if (!normalized.lead.name) throw appError("VALIDATION_ERROR", "Nome obrigatório.", 400);
  if (!normalized.lead.email) throw appError("VALIDATION_ERROR", "E-mail obrigatório.", 400);
  if (!normalized.lead.whatsapp) throw appError("VALIDATION_ERROR", "WhatsApp obrigatório.", 400);
  if (!normalized.lead.goal) throw appError("VALIDATION_ERROR", "Objetivo obrigatório.", 400);

  for (const [field, value] of Object.entries(normalized.answers)) {
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      throw appError("VALIDATION_ERROR", `Campo inválido: ${field}.`, 400);
    }
  }

  return normalized;
}

function cleanString(value) {
  return String(value ?? "").trim();
}

function toScore(value) {
  const number = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(number) ? number : NaN;
}

function calculateScore(payload) {
  const a = payload.answers;
  const goal = payload.lead.goal;

  const dimensions = {
    adherence: round1(((a.trainingFrequency + a.consistencyHistory) / 10) * 100),
    nutrition: round1((a.foodAdherence / 5) * 100),
    training: round1(((a.trainingExperience + a.trainingFrequency) / 10) * 100),
    recovery: round1(((a.sleepQuality + a.stressLevel) / 10) * 100),
    clinical: round1(((6 - a.painInjury) / 5) * 100),
    behavior: round1(((a.motivationLevel + a.consistencyHistory) / 10) * 100)
  };

  const weights = resolveWeights(goal);

  const rawScore =
    dimensions.adherence * weights.adherence +
    dimensions.nutrition * weights.nutrition +
    dimensions.training * weights.training +
    dimensions.recovery * weights.recovery +
    dimensions.clinical * weights.clinical +
    dimensions.behavior * weights.behavior;

  return {
    lmScore: clampInt(Math.round(rawScore), 0, 100),
    dimensions,
    weights
  };
}

function resolveWeights(goal) {
  const defaultWeights = {
    adherence: 0.20,
    nutrition: 0.20,
    training: 0.20,
    recovery: 0.20,
    clinical: 0.10,
    behavior: 0.10
  };

  const weightsByGoal = {
    emagrecimento: {
      adherence: 0.25,
      nutrition: 0.25,
      training: 0.15,
      recovery: 0.10,
      clinical: 0.10,
      behavior: 0.15
    },
    definicao_muscular: {
      adherence: 0.20,
      nutrition: 0.25,
      training: 0.20,
      recovery: 0.15,
      clinical: 0.10,
      behavior: 0.10
    },
    ganho_massa_muscular: {
      adherence: 0.15,
      nutrition: 0.20,
      training: 0.25,
      recovery: 0.20,
      clinical: 0.10,
      behavior: 0.10
    },
    saude_condicionamento: defaultWeights
  };

  return weightsByGoal[goal] || defaultWeights;
}

function classifyScore(score, d) {
  if (d.clinical < 40) return "BASE_EM_RISCO";
  if (score < 45 || d.adherence < 45 || d.behavior < 45) return "BASE_EM_CONSTRUCAO";
  if (score < 70) return "EM_EVOLUCAO";
  if (d.recovery < 55) return "BOA_BASE_COM_ALERTA";
  return "NIVEL_AVANCADO";
}

function buildTags(payload) {
  const a = payload.answers;
  const tags = [];

  if (a.consistencyHistory <= 2) tags.push("low_consistency");
  if (a.foodAdherence <= 2) tags.push("nutrition_attention");
  if (a.sleepQuality <= 2 || a.stressLevel <= 2) tags.push("recovery_attention");
  if (a.painInjury >= 3) tags.push("pain_attention");
  if (a.motivationLevel >= 4) tags.push("high_motivation");

  return tags.slice(0, 5);
}

function resolveStrategicResult(score, d, goal, classification) {
  const tension = resolveMainTension(d);
  const offer = resolveOffer(score, d, goal, classification);
  const priority = resolvePriority(score, d, classification);
  const headline = resolveHeadline(score, goal, tension);
  const copy = resolveCopy(score, tension, goal);
  const cta = resolveCTA(offer);

  return {
    tension,
    offer,
    priority,
    headline,
    copy,
    cta
  };
}

function resolveMainTension(dimensions) {
  return Object.entries(dimensions)
    .sort((a, b) => a[1] - b[1])[0][0];
}

function resolveOffer(score, d, goal, classification) {
  if (classification === "BASE_EM_RISCO") return "CONSULTORIA_PREMIUM";
  if (score < 50) return "PLANO_ESTRUTURADO";
  if (goal === "saude_condicionamento" && d.clinical < 60) return "CONSULTORIA_PRESENCIAL";
  if (score < 75) return "CONSULTORIA_ONLINE";
  return "CONSULTORIA_PREMIUM";
}

function resolvePriority(score, d, classification) {
  if (classification === "BASE_EM_RISCO") return "high";
  if (score >= 70 && d.behavior >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function resolveHeadline(score, goal, tension) {
  if (score < 45) return "Sua base precisa de direção antes de intensidade.";
  if (score < 70) return "Você já começou, mas ainda falta estrutura para evoluir.";
  if (tension === "recovery") return "Seu resultado pode melhorar com recuperação mais bem ajustada.";
  return "Você tem uma boa base para acelerar resultados com estratégia.";
}

function resolveCopy(score, tension, goal) {
  const tensionLabels = {
    adherence: "a consistência da rotina",
    nutrition: "a organização alimentar",
    training: "a estrutura do treino",
    recovery: "a recuperação",
    clinical: "as dores ou limitações físicas",
    behavior: "a constância comportamental"
  };

  const goalLabels = {
    emagrecimento: "emagrecer com mais segurança e adesão",
    definicao_muscular: "definir com mais controle e preservar massa muscular",
    ganho_massa_muscular: "ganhar massa muscular com progressão real",
    saude_condicionamento: "melhorar saúde, condicionamento e funcionalidade"
  };

  const problem = tensionLabels[tension] || "a estratégia atual";
  const objective = goalLabels[goal] || "evoluir com mais direção";

  if (score < 45) {
    return `Hoje, o principal ponto é organizar ${problem}. Antes de buscar intensidade, o ideal é construir uma base simples, executável e alinhada ao objetivo de ${objective}.`;
  }

  if (score < 70) {
    return `Você já tem alguns pontos positivos, mas ${problem} ainda limita o avanço. Com ajustes mais claros, o caminho para ${objective} fica mais previsível.`;
  }

  return `Seu ponto de partida é bom. Agora, pequenos ajustes em ${problem} podem acelerar o processo e deixar o caminho para ${objective} mais eficiente.`;
}

function resolveCTA(offer) {
  const ctas = {
    PLANO_ESTRUTURADO: {
      label: "Conhecer o plano estruturado",
      href: "./plano-estruturado.html"
    },
    CONSULTORIA_ONLINE: {
      label: "Conhecer a consultoria premium",
      href: "./consultoria-premium.html"
    },
    CONSULTORIA_PREMIUM: {
      label: "Quero acompanhamento premium",
      href: "./consultoria-premium.html"
    },
    CONSULTORIA_PRESENCIAL: {
      label: "Conhecer o atendimento presencial",
      href: "./consultoria-presencial.html"
    }
  };

  return ctas[offer] || {
    label: "Conhecer os planos",
    href: "./planos.html"
  };
}

async function ensureSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      goal TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS diagnostic_results (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      engine_version TEXT NOT NULL,
      lm_score INTEGER NOT NULL,
      classification TEXT NOT NULL,
      dimensions_json TEXT NOT NULL,
      weights_json TEXT,
      tags_json TEXT,
      client_state TEXT,
      recommended_offer TEXT,
      lead_priority TEXT,
      strategic_result_json TEXT,
      raw_answers_json TEXT,
      meta_json TEXT,
      created_at TEXT NOT NULL
    )
  `).run();

  await ensureColumn(db, "diagnostic_results", "weights_json", "TEXT");
  await ensureColumn(db, "diagnostic_results", "tags_json", "TEXT");
  await ensureColumn(db, "diagnostic_results", "client_state", "TEXT");
  await ensureColumn(db, "diagnostic_results", "recommended_offer", "TEXT");
  await ensureColumn(db, "diagnostic_results", "lead_priority", "TEXT");
  await ensureColumn(db, "diagnostic_results", "strategic_result_json", "TEXT");
  await ensureColumn(db, "diagnostic_results", "raw_answers_json", "TEXT");
  await ensureColumn(db, "diagnostic_results", "meta_json", "TEXT");

  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON leads (whatsapp)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_diag_created_at ON diagnostic_results (created_at DESC)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_diag_score ON diagnostic_results (lm_score DESC)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_diag_classification ON diagnostic_results (classification)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_diag_lead ON diagnostic_results (lead_id)`).run();
}

async function ensureColumn(db, tableName, columnName, columnType) {
  const info = await db.prepare(`PRAGMA table_info(${tableName})`).all();
  const columns = Array.isArray(info?.results) ? info.results : [];
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    await db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`).run();
  }
}

function jsonResponse(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}

function appError(code, message, status = 500) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function clampInt(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}
