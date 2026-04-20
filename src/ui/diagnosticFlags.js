const FLAG_NAME = 'USE_REMOTE_DIAGNOSTIC_ENGINE';

function readWindowFlag() {
  if (typeof window === 'undefined') return undefined;
  return window.__LM_FLAGS__?.[FLAG_NAME];
}

export function isDevEnvironment() {
  if (typeof window === 'undefined') return false;

  const host = window.location?.hostname || '';
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

export function isRemoteDiagnosticEnabled() {
  const runtimeFlag = readWindowFlag();
  if (typeof runtimeFlag === 'boolean') return runtimeFlag;
  return true;
}
