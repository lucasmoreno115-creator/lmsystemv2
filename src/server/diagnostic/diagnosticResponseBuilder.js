export function buildDiagnosticResponse({ leadId, evaluation }) {
  return {
    ok: true,
    leadId,
    engineVersion: evaluation.engineVersion,
    result: evaluation.result
  };
}
