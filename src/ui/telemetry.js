function safePushDataLayer(eventName, payload) {
  if (!Array.isArray(globalThis?.window?.dataLayer)) return;
  window.dataLayer.push({ event: eventName, ...payload });
}

function safeTrackClient(eventName, payload) {
  const client = globalThis?.window?.lmTelemetry;
  if (!client || typeof client.track !== 'function') return;
  client.track(eventName, payload);
}

export function trackEvent(eventName, payload = {}) {
  try {
    safeTrackClient(eventName, payload);
    safePushDataLayer(eventName, payload);
  } catch (error) {
    console.warn('[Telemetry] Falha ao registrar evento', eventName, error);
  }
}
