export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // LOG DE VERSÃO (debug)
    console.log("LM API VERSION: CLEAN-2026-04-25");

    // CORS
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // OPTIONS (preflight)
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
          version: "CLEAN-2026-04-25",
          timestamp: new Date().toISOString()
        }), { headers: corsHeaders });
      }

      // =========================
      // DIAGNOSTIC EVALUATE
      // =========================
      if (request.method === "POST" && url.pathname === "/api/diagnostic/evaluate") {
        const body = await safeJson(request);

        // Validação básica
        const validationError = validateDiagnostic(body);
        if (validationError) {
          return jsonError("VALIDATION_ERROR", validationError, 400, corsHeaders);
        }

        // Simples lógica de score (placeholder realista)
        const score = calculateScore(body);

        // Persistência no D1
        await env.DB.prepare(`
          INSERT INTO diagnostic_results (name, goal, score, created_at)
          VALUES (?, ?, ?, ?)
        `)
          .bind(
            body.name,
            body.goal,
            score,
            new Date().toISOString()
          )
          .run();

        return new Response(JSON.stringify({
          ok: true,
          data: {
            name: body.name,
            goal: body.goal,
            score
          }
        }), { headers: corsHeaders });
      }

      // =========================
      // NOT FOUND
      // =========================
      return jsonError("NOT_FOUND", "Rota não encontrada", 404, corsHeaders);

    } catch (err) {
      console.error("ERROR:", err);

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
  if (!body.name) return "Nome é obrigatório";
  if (!body.goal) return "Objetivo é obrigatório";
  return null;
}

function calculateScore(body) {
  // lógica simples (substituível depois)
  let base = 50;

  if (body.goal === "recomp") base += 10;
  if (body.goal === "cut") base -= 5;
  if (body.goal === "mass") base += 15;

  return Math.min(100, Math.max(0, base));
}

function jsonError(code, message, status, headers) {
  return new Response(JSON.stringify({
    ok: false,
    error: { code, message }
  }), { status, headers });
}
