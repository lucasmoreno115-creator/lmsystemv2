const FRIENDLY_REMOTE_ERROR = 'Não foi possível processar seu diagnóstico agora. Tente novamente em instantes.';
const DEFAULT_DIAGNOSTIC_PATH = '/api/diagnostic/evaluate';

function buildRemoteError(code, cause) {
  const error = new Error(FRIENDLY_REMOTE_ERROR);
  error.code = code;
  error.cause = cause;
  return error;
}

function resolveBaseUrl() {
  if (typeof window !== 'undefined') {
    if (typeof window.__LM_API_BASE__ === 'string' && window.__LM_API_BASE__.trim()) {
      return window.__LM_API_BASE__.trim().replace(/\/$/, '');
    }

    const meta = typeof document !== 'undefined'
      ? document.querySelector('meta[name="lm-api-base"]')
      : null;

    if (meta && typeof meta.content === 'string' && meta.content.trim()) {
      return meta.content.trim().replace(/\/$/, '');
    }
  }

  return '';
}

export function resolveDiagnosticEndpoint() {
  const base = resolveBaseUrl();
  return base ? `${base}${DEFAULT_DIAGNOSTIC_PATH}` : DEFAULT_DIAGNOSTIC_PATH;
}

export async function evaluateDiagnosticRemote(payload, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const endpoint = options.endpoint ?? resolveDiagnosticEndpoint();
  let response;

  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw buildRemoteError('NETWORK_ERROR', error);
  }

  if (!response.ok) {
    const text = typeof response.text === 'function' ? await response.text() : null;
    throw buildRemoteError(`HTTP_${response.status}`, text);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw buildRemoteError('REMOTE_INVALID_JSON', error);
  }

  if (!data || data.ok !== true || !data.result) {
    throw buildRemoteError('REMOTE_INVALID_RESPONSE', data);
  }

  return {
    ok: true,
    leadId: data.leadId ?? null,
    engineVersion: data.engineVersion ?? null,
    result: data.result
  };
}
