import { evaluateDiagnostic } from '../../../src/server/diagnostic/evaluateDiagnostic.js';
import { validateAndNormalizeDiagnosticPayload, ValidationError } from '../../../src/server/diagnostic/diagnosticSchemas.js';
import { persistDiagnosticEvaluation } from '../../../src/server/diagnostic/diagnosticPersistence.js';
import { buildDiagnosticResponse } from '../../../src/server/diagnostic/diagnosticResponseBuilder.js';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function createEvaluateHandler(dependencies = {}) {
  const {
    validatePayload = validateAndNormalizeDiagnosticPayload,
    evaluate = evaluateDiagnostic,
    persist = persistDiagnosticEvaluation,
    buildResponse = buildDiagnosticResponse
  } = dependencies;

  return async function onRequestPost(context) {
    try {
      const body = await context.request.json();
      const normalizedPayload = validatePayload(body);
      const evaluation = evaluate(normalizedPayload);
      const { leadId } = await persist({
        dbBinding: context.env?.DB,
        normalizedPayload,
        evaluation
      });

      return jsonResponse(buildResponse({ leadId, evaluation }));
   catch (error) {
  console.error("🔥 ERRO REAL:", error);

  return Response.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error?.message || "Erro interno",
        stack: error?.stack || null
      }
    },
    { status: 500 }
  );
}
      console.error('[Diagnostic API] Erro ao processar diagnóstico:', error);
      return jsonResponse({
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Não foi possível processar o diagnóstico.'
        }
      }, 500);
    }
  };
}

export const onRequestPost = createEvaluateHandler();
