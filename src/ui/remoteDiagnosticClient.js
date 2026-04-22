const FRIENDLY_REMOTE_ERROR = 'Não foi possível processar seu diagnóstico agora. Tente novamente em instantes.';

function buildRemoteError(code, cause) {
  const error = new Error(FRIENDLY_REMOTE_ERROR);
  error.code = code;
  error.cause = cause;
  return error;
}

export async function evaluateDiagnosticRemote(payload) {
  const response = await fetch('/api/diagnostic/evaluate', {
    method: 'POST', // 🔥 ESSENCIAL
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} - ${text}`);
  }

  return response.json();
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
