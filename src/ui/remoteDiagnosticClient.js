const FRIENDLY_REMOTE_ERROR = 'Não foi possível processar seu diagnóstico agora. Tente novamente em instantes.';

function buildRemoteError(code, cause) {
  const error = new Error(FRIENDLY_REMOTE_ERROR);
  error.code = code;
  error.cause = cause;
  return error;
}

export async function evaluateDiagnosticRemote(payload, { fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw buildRemoteError('REMOTE_FETCH_UNAVAILABLE');
  }

  let response;
  try {
    response = await fetchImpl('/api/diagnostic/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw buildRemoteError('REMOTE_REQUEST_FAILED', error);
  }

  if (!response?.ok) {
    throw buildRemoteError('REMOTE_HTTP_ERROR', { status: response?.status ?? null });
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw buildRemoteError('REMOTE_INVALID_JSON', error);
  }

  if (!data || typeof data !== 'object' || data.ok !== true || !data.result || typeof data.result !== 'object') {
    throw buildRemoteError('REMOTE_INVALID_RESPONSE', data);
  }

  return {
    ok: true,
    leadId: typeof data.leadId === 'string' ? data.leadId : null,
    engineVersion: typeof data.engineVersion === 'string' ? data.engineVersion : null,
    result: data.result
  };
}
