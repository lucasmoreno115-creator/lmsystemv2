const API_BASE =
  window.__LM_API_BASE__ ||
  document.querySelector('meta[name="lm-api-base"]')?.content ||
  window.location.origin;

export async function evaluateDiagnosticRemote(payload) {
  const response = await fetch(`${API_BASE}/api/diagnostic/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
