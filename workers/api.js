import { createEvaluateHandler } from '../src/server/diagnostic/evaluateEndpoint.js';

const evaluateHandler = createEvaluateHandler();

function withCors(response, origin = '*') {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

function resolveAllowedOrigin(request) {
  return request.headers.get('Origin') || '*';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = resolveAllowedOrigin(request);

    if (url.pathname !== '/api/diagnostic/evaluate') {
      return withCors(
        new Response(JSON.stringify({
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Not found.' }
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }),
        origin
      );
    }

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), origin);
    }

    if (request.method !== 'POST') {
      return withCors(
        new Response(JSON.stringify({
          ok: false,
          error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' }
        }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            Allow: 'POST, OPTIONS'
          }
        }),
        origin
      );
    }

    const response = await evaluateHandler({ request, env, ctx });
    return withCors(response, origin);
  }
};
