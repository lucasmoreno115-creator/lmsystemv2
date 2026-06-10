const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        return jsonResponse({
          ok: true,
          service: "lm-diagnostic-api",
          status: "ok",
          timestamp: new Date().toISOString()
        });
      }

      if (request.method === "POST" && url.pathname === "/api/diagnostic/evaluate") {
        return jsonResponse({
          ok: false,
          error: {
            code: "DIAGNOSTIC_NOT_MIGRATED",
            message: "API ativa. Lógica do diagnóstico ainda não migrada."
          }
        }, 501);
      }

      return jsonResponse({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Endpoint não encontrado."
        }
      }, 404);
    } catch (error) {
      return jsonResponse({
        ok: false,
        error: {
          code: error.code || "INTERNAL_ERROR",
          message: error.message || "Erro interno."
        }
      }, error.status || 500);
    }
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json"
    }
  });
}