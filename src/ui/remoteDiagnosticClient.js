const FRIENDLY_REMOTE_ERROR = 'Não foi possível processar seu diagnóstico agora. Tente novamente em instantes.';

function buildRemoteError(code, cause) {
  const error = new Error(FRIENDLY_REMOTE_ERROR);
  error.code = code;
  error.cause = cause;
  return error;
}

export async function evaluateDiagnosticRemote(payload) {
  let response;

  try {
    response = await fetch('/api/diagnostic/evaluate', {
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
    const text = await response.text();
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
