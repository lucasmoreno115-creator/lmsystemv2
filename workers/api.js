
const START_PRICE = 59.90;
const PREMIUM_PRICE = 229.90;
const PRESENCIAL_PRICE = 440.00;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
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

      if (url.pathname.startsWith("/api/admin/")) {
        if (request.headers.get("x-admin-token") !== env.ADMIN_TOKEN || !env.ADMIN_TOKEN) {
          return jsonResponse({
            ok: false,
            error: { code: "UNAUTHORIZED", message: "Unauthorized" }
          }, 401, corsHeaders);
        }

        if (request.method === "GET" && url.pathname === "/api/admin/leads") {
          if (!env.DB) {
            return jsonResponse({
              ok: false,
              error: { code: "DB_NOT_CONFIGURED", message: "Binding D1 env.DB não configurado." }
            }, 500, corsHeaders);
          }

          await ensureSchema(env.DB);
          const rows = await env.DB.prepare(`
            SELECT
              l.id AS lead_id,
              l.name,
              l.email,
              l.whatsapp,
              l.goal,
              l.notes,
              l.next_action,
              l.follow_up_at,
              l.created_at AS lead_created_at,
              l.status AS lead_status,
              dr.lm_score,
              dr.classification,
              dr.recommended_offer,
              dr.lead_priority,
              dr.strategic_result_json,
              dr.meta_json,
              dr.created_at AS diagnostic_created_at
            FROM leads l
            LEFT JOIN diagnostic_results dr
              ON dr.lead_id = l.id
              AND dr.created_at = (
                SELECT MAX(created_at)
                FROM diagnostic_results
                WHERE lead_id = l.id
              )
            ORDER BY l.created_at DESC
          `).all();

          const leads = (rows?.results || []).map((row) => {
            const strategic = parseJsonObject(row.strategic_result_json);
            const meta = parseJsonObject(row.meta_json);
            return {
              leadId: row.lead_id,
              nome: row.name || "",
              email: row.email || "",
              whatsapp: row.whatsapp || "",
              objetivo: row.goal || "",
              lmScore: row.lm_score ?? null,
              classification: row.classification || "",
              recommendedOffer: row.recommended_offer || strategic.offer || null,
              recommendedPlan: row.recommended_offer || strategic.offer || null,
              leadPriority: row.lead_priority || strategic.priority || null,
              mainBottleneck: strategic.tension || meta.mainBottleneck || meta.principalGargalo || null,
              createdAt: row.diagnostic_created_at || row.lead_created_at || null,
              status: row.lead_status || "NEW",
              notes: row.notes || "",
              nextAction: row.next_action || "",
              followUpAt: row.follow_up_at || ""
            };
          });

          return jsonResponse({ ok: true, data: leads }, 200, corsHeaders);
        }


        if (request.method === "GET" && url.pathname === "/api/admin/metrics") {
          if (!env.DB) {
            return jsonResponse({
              ok: false,
              error: { code: "DB_NOT_CONFIGURED", message: "Binding D1 env.DB não configurado." }
            }, 500, corsHeaders);
          }

          await ensureSchema(env.DB);
          const period = normalizePeriod(url.searchParams.get("period"));
          const rows = await env.DB.prepare(`
            SELECT
              l.id AS lead_id,
              l.status AS lead_status,
              l.created_at AS lead_created_at,
              dr.recommended_offer,
              dr.lead_priority,
              dr.strategic_result_json,
              dr.created_at AS diagnostic_created_at
            FROM leads l
            LEFT JOIN diagnostic_results dr
              ON dr.lead_id = l.id
              AND dr.created_at = (
                SELECT MAX(created_at)
                FROM diagnostic_results
                WHERE lead_id = l.id
              )
            ORDER BY l.created_at DESC
          `).all();

          const metrics = buildMetrics(rows?.results || [], period);
          return jsonResponse({ ok: true, data: metrics }, 200, corsHeaders);
        }

        if (request.method === "PATCH" && /^\/api\/admin\/leads\/[^/]+\/status$/.test(url.pathname)) {
          if (!env.DB) {
            return jsonResponse({
              ok: false,
              error: { code: "DB_NOT_CONFIGURED", message: "Binding D1 env.DB não configurado." }
            }, 500, corsHeaders);
          }

          await ensureSchema(env.DB);
          const leadId = url.pathname.split("/")[4];
          const payload = await safeJson(request);
          const allowed = new Set(["NEW", "CONTACTED", "NEGOTIATION", "CLOSED", "LOST"]);
          const status = cleanString(payload?.status).toUpperCase();
          if (!allowed.has(status)) {
            throw appError("VALIDATION_ERROR", "Status comercial inválido.", 400);
          }

          const updated = await env.DB.prepare(`
            UPDATE leads
            SET status = ?
            WHERE id = ?
          `).bind(status, leadId).run();

          if (!updated?.meta?.changes) {
            return jsonResponse({
              ok: false,
              error: { code: "NOT_FOUND", message: "Lead não encontrado." }
            }, 404, corsHeaders);
          }

          return jsonResponse({ ok: true, data: { leadId, status } }, 200, corsHeaders);
        }

        if (request.method === "PATCH" && /^\/api\/admin\/leads\/[^/]+\/commercial$/.test(url.pathname)) {
          if (!env.DB) {
            return jsonResponse({
              ok: false,
              error: { code: "DB_NOT_CONFIGURED", message: "Binding D1 env.DB não configurado." }
            }, 500, corsHeaders);
          }
          await ensureSchema(env.DB);
          const leadId = url.pathname.split("/")[4];
          const payload = await safeJson(request);
          const notes = sanitizeOptionalField(payload?.notes, 1000, "notes");
          const nextAction = sanitizeOptionalField(payload?.nextAction, 200, "nextAction");
          const followUpAt = sanitizeOptionalField(payload?.followUpAt, 100, "followUpAt");

          const updated = await env.DB.prepare(`
            UPDATE leads
            SET notes = ?, next_action = ?, follow_up_at = ?
            WHERE id = ?
          `).bind(notes, nextAction, followUpAt, leadId).run();

          if (!updated?.meta?.changes) {
            return jsonResponse({
              ok: false,
              error: { code: "NOT_FOUND", message: "Lead não encontrado." }
            }, 404, corsHeaders);
          }

          return jsonResponse({
            ok: true,
            data: { leadId, notes: notes || "", nextAction: nextAction || "", followUpAt: followUpAt || "" }
          }, 200, corsHeaders);
        }

        return jsonResponse({
          ok: false,
          error: { code: "NOT_FOUND", message: "Rota não encontrada." }
        }, 404, corsHeaders);
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

function sanitizeOptionalField(value, maxLength, fieldName) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw appError("VALIDATION_ERROR", `Campo inválido: ${fieldName}.`, 400);
  const cleaned = cleanString(value);
  if (!cleaned) return null;
  if (cleaned.length > maxLength) throw appError("VALIDATION_ERROR", `Campo ${fieldName} excede ${maxLength} caracteres.`, 400);
  return cleaned;
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
      status TEXT NOT NULL DEFAULT 'NEW',
      created_at TEXT NOT NULL
    )
  `).run();
  await ensureColumn(db, "leads", "status", "TEXT NOT NULL DEFAULT 'NEW'");
  await ensureColumn(db, "leads", "notes", "TEXT");
  await ensureColumn(db, "leads", "next_action", "TEXT");
  await ensureColumn(db, "leads", "follow_up_at", "TEXT");

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


function normalizePeriod(period) {
  const value = cleanString(period).toLowerCase();
  if (["today", "week", "month", "all"].includes(value)) return value;
  return "all";
}

function buildMetrics(rows, period) {
  const leads = rows.map((row) => {
    const strategic = parseJsonObject(row.strategic_result_json);
    const status = cleanString(row.lead_status).toUpperCase() || "NEW";
    return {
      createdAt: row.lead_created_at,
      status,
      recommendedOffer: row.recommended_offer || strategic.offer || "",
      leadPriority: row.lead_priority || strategic.priority || ""
    };
  });

  const now = new Date();
  const filtered = leads.filter((lead) => isInPeriod(lead.createdAt, now, period));
  const totalLeads = filtered.length;

  const overview = {
    totalLeads,
    leadsToday: leads.filter((lead) => isInPeriod(lead.createdAt, now, "today")).length,
    leadsThisWeek: leads.filter((lead) => isInPeriod(lead.createdAt, now, "week")).length,
    leadsThisMonth: leads.filter((lead) => isInPeriod(lead.createdAt, now, "month")).length,
    closedThisMonth: leads.filter((lead) => lead.status === "CLOSED" && isInPeriod(lead.createdAt, now, "month")).length,
    lostThisMonth: leads.filter((lead) => lead.status === "LOST" && isInPeriod(lead.createdAt, now, "month")).length,
    contactedThisMonth: leads.filter((lead) => lead.status === "CONTACTED" && isInPeriod(lead.createdAt, now, "month")).length,
    negotiationThisMonth: leads.filter((lead) => lead.status === "NEGOTIATION" && isInPeriod(lead.createdAt, now, "month")).length
  };

  const pipeline = ["NEW", "CONTACTED", "NEGOTIATION", "CLOSED", "LOST"].reduce((acc, status) => {
    acc[status] = filtered.filter((lead) => lead.status === status).length;
    return acc;
  }, {});

  const conversion = {
    contactRate: toPercent((pipeline.CONTACTED + pipeline.NEGOTIATION + pipeline.CLOSED + pipeline.LOST) / (totalLeads || 1)),
    negotiationRate: toPercent((pipeline.NEGOTIATION + pipeline.CLOSED) / (totalLeads || 1)),
    closeRate: toPercent(pipeline.CLOSED / (totalLeads || 1)),
    lossRate: toPercent(pipeline.LOST / (totalLeads || 1))
  };

  const planBuckets = { "Plano Start": 0, "Consultoria Premium": 0, "Consultoria Presencial": 0, "Outros/Sem plano": 0 };
  const qualityBuckets = { HOT: 0, WARM: 0, COLD: 0 };

  let estimatedPipelineValue = 0;
  let closedRevenueThisMonth = 0;

  for (const lead of filtered) {
    const plan = normalizePlan(lead.recommendedOffer);
    planBuckets[plan] += 1;

    const quality = classifyLeadQuality(lead.recommendedOffer, lead.leadPriority);
    qualityBuckets[quality] += 1;

    const price = resolveOfferPrice(lead.recommendedOffer);
    if (["NEW", "CONTACTED", "NEGOTIATION"].includes(lead.status)) estimatedPipelineValue += price;

    // Limitação: como ainda não há closed_at, usamos created_at como aproximação para fechamentos do mês.
    if (lead.status === "CLOSED" && isInPeriod(lead.createdAt, now, "month")) closedRevenueThisMonth += price;
  }

  const recommendedPlans = Object.entries(planBuckets).map(([plan, count]) => ({ plan, count, percentage: toPercent(count / (totalLeads || 1)) }));
  const leadQuality = Object.entries(qualityBuckets).map(([bucket, count]) => ({ bucket, count, percentage: toPercent(count / (totalLeads || 1)) }));

  return {
    period,
    overview,
    pipeline,
    conversion,
    recommendedPlans,
    leadQuality,
    revenue: {
      estimatedPipelineValue: round2(estimatedPipelineValue),
      closedRevenueThisMonth: round2(closedRevenueThisMonth),
      averageTicketClosed: round2(closedRevenueThisMonth / (overview.closedThisMonth || 1))
    },
    pricing: { START_PRICE, PREMIUM_PRICE, PRESENCIAL_PRICE }
  };
}

function isInPeriod(dateValue, now, period) {
  if (period === "all") return true;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;

  if (period === "today") {
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
  }

  if (period === "week") {
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff, 0, 0, 0));
    return d >= weekStart && d <= now;
  }

  if (period === "month") {
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  }

  return true;
}

function normalizePlan(offer) {
  const text = cleanString(offer).toUpperCase();
  if (text.includes("PRESENCIAL")) return "Consultoria Presencial";
  if (text.includes("PREMIUM") || text.includes("ONLINE")) return "Consultoria Premium";
  if (text.includes("START") || text.includes("ESTRUTURADO")) return "Plano Start";
  return "Outros/Sem plano";
}

function classifyLeadQuality(offer, priority) {
  const offerText = cleanString(offer).toUpperCase();
  const priorityText = cleanString(priority).toUpperCase();
  if (offerText.includes("PREMIUM") || offerText.includes("PRESENCIAL") || ["HIGH", "HOT", "ALTA"].some((v) => priorityText.includes(v))) return "HOT";
  if (offerText.includes("START") || ["MEDIUM", "MEDIA", "MÉDIA"].some((v) => priorityText.includes(v))) return "WARM";
  return "COLD";
}

function resolveOfferPrice(offer) {
  const text = cleanString(offer).toUpperCase();
  if (text.includes("PRESENCIAL")) return PRESENCIAL_PRICE;
  if (text.includes("PREMIUM") || text.includes("ONLINE")) return PREMIUM_PRICE;
  return START_PRICE;
}

function toPercent(value) { return round1((value || 0) * 100); }
function round2(value) { return Math.round((value || 0) * 100) / 100; }

function parseJsonObject(value) {
  if (!value || typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
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
