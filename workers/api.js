export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    console.log("LM API VERSION: FINAL-2026-04-25");

    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {

      // =========================
      // HEALTH CHECK
      // =========================
      if (request.method === "GET" && url.pathname === "/api/health") {
        return new Response(JSON.stringify({
          ok: true,
          status: "ok",
          version: "FINAL-2026-04-25",
          timestamp: new Date().toISOString()
        }), { headers: corsHeaders });
      }

      // =========================
      // DIAGNOSTIC EVALUATE
      // =========================
      if (request.method === "POST" && url.pathname === "/api/diagnostic/evaluate") {

        const body = await safeJson(request);

        // VALIDAÇÃO
        const validationError = validateDiagnostic(body);
        if (validationError) {
          return jsonError("VALIDATION_ERROR", validationError, 400, corsHeaders);
        }

        const now = new Date().toISOString();

        // =========================
        // 1. INSERIR LEAD
        // =========================
        const leadId = crypto.randomUUID();

        await env.DB.prepare(`
          INSERT INTO leads (id, name, email, whatsapp, goal, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(
          leadId,
          body.lead.name,
          body.lead.email,
          body.lead.whatsapp,
          body.lead.goal,
          now
        )
        .run();

        // =========================
        // 2. CALCULAR SCORE (placeholder)
        // =========================
        const lmScore = calculateScore(body);
        const classification = classifyScore(lmScore);

        // =========================
        // 3. INSERIR DIAGNOSTIC RESULT
        // =========================
        await env.DB.prepare(`
          INSERT INTO diagnostic_results (
            id,
            lead_id,
            engine_version,
            lm_score,
            classification,
            dimensions_json,
            tags_json,
            client_state,
            recommended_offer,
            lead_priority,
            strategic_result_json,
            raw_answers_json,
            meta_json,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          crypto.randomUUID(),
          leadId,
          "v1.0",
          lmScore,
          classification,
          JSON.stringify(buildDimensions(body)),
          JSON.stringify(buildTags(body)),
          classification,
          recommendOffer(lmScore),
          "medium",
          JSON.stringify({ summary: "diagnóstico gerado" }),
          JSON.stringify(body.answers),
          JSON.stringify({ source: "api" }),
          now
        )
        .run();

        return new Response(JSON.stringify({
          ok: true,
          data: {
            leadId,
            lmScore,
            classification
          }
        }), { headers: corsHeaders });
      }

      // =========================
      // NOT FOUND
      // =========================
      return jsonError("NOT_FOUND", "Rota não encontrada", 404, corsHeaders);

    } catch (err) {
      console.error("ERROR FULL:", JSON.stringify(err, null, 2));

      return jsonError(
        "INTERNAL_ERROR",
        "Não foi possível processar o diagnóstico",
        500,
        corsHeaders
      );
    }
  }
};

// =========================
// HELPERS
// =========================

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("JSON inválido");
  }
}

function validateDiagnostic(body) {
  if (!body) return "Body vazio";
  if (!body.lead) return "Lead obrigatório";
  if (!body.lead.name) return "Nome é obrigatório";
  if (!body.lead.email) return "Email é obrigatório";
  if (!body.lead.whatsapp) return "Whatsapp é obrigatório";
  if (!body.lead.goal) return "Objetivo é obrigatório";
  if (!body.answers) return "Answers obrigatório";
  return null;
}

function calculateScore(body) {
  const a = body.answers;

  let score =
    a.trainingFrequency * 5 +
    a.trainingExperience * 5 +
    a.foodAdherence * 10 +
    a.sleepQuality * 10 +
    (6 - a.stressLevel) * 5 +
    (6 - a.painInjury) * 5 +
    a.consistencyHistory * 10 +
    a.motivationLevel * 10;

  return Math.max(0, Math.min(100, score));
}

function classifyScore(score) {
  if (score < 40) return "BASE_EM_CONSTRUCAO";
  if (score < 60) return "EM_EVOLUCAO";
  if (score < 80) return "BOA_BASE";
  return "NIVEL_AVANCADO";
}

function buildDimensions(body) {
  return {
    training: body.answers.trainingFrequency,
    nutrition: body.answers.foodAdherence,
    recovery: body.answers.sleepQuality,
    stress: body.answers.stressLevel
  };
}

function buildTags(body) {
  const tags = [];

  if (body.answers.consistencyHistory <= 2) tags.push("low_consistency");
  if (body.answers.motivationLevel >= 4) tags.push("high_motivation");
  if (body.answers.painInjury >= 3) tags.push("pain_attention");

  return tags;
}

function recommendOffer(score) {
  if (score < 50) return "PLANO_BASE";
  if (score < 75) return "CONSULTORIA_ONLINE";
  return "CONSULTORIA_PREMIUM";
}

function jsonError(code, message, status, headers) {
  return new Response(JSON.stringify({
    ok: false,
    error: { code, message }
  }), { status, headers });
}
