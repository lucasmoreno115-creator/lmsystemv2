import { validateAndNormalizeDiagnosticPayload, ValidationError } from './diagnosticSchemas.js';
import { evaluateDiagnostic } from './evaluateDiagnostic.js';
import { persistDiagnosticEvaluation } from './diagnosticPersistence.js';
import { buildDiagnosticResponse } from './diagnosticResponseBuilder.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

export function createEvaluateHandler(deps = {}) {
  const validatePayload = deps.validatePayload ?? validateAndNormalizeDiagnosticPayload;
  const evaluate = deps.evaluate ?? evaluateDiagnostic;
  const persist = deps.persist ?? persistDiagnosticEvaluation;
  const buildResponse = deps.buildResponse ?? buildDiagnosticResponse;

  return async function evaluateHandler({ request, env }) {
    try {
      const body = await request.json();
      const normalizedPayload = validatePayload(body);
      const evaluation = evaluate(normalizedPayload);
      const { leadId } = await persist({
        dbBinding: env?.DB,
        normalizedPayload,
        evaluation
      });

      return jsonResponse(buildResponse({ leadId, evaluation }), 200);
    } catch (error) {
      if (error instanceof ValidationError) {
        return jsonResponse(
          {
            ok: false,
            error: {
              code: error.code,
              message: error.message,
              fields: error.fields
            }
          },
          400
        );
      }

      console.error('[diagnostic/evaluate] unexpected error', error);
console.error('[diagnostic/evaluate] stack', error?.stack);

return jsonResponse(
  {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error?.message || 'Não foi possível processar o diagnóstico.',
      stack: error?.stack || null
    }
  },
  500
);
