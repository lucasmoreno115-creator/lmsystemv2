import { createEvaluateHandler } from '../src/server/diagnostic/evaluateEndpoint.js';

const evaluateHandler = createEvaluateHandler();

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/diagnostic/evaluate') {
      return json({
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Not found.'
        }
      }, 404);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return json({
        ok: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed.'
        }
      }, 405);
    }

    return evaluateHandler({ request, env, ctx });
  }
};

function resolveAllowedOrigin(request) {
  return request.headers.get('Origin') || '*';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = resolveAllowedOrigin(request);

    if (url.pathname !== '/api/diagnostic/evaluate') {
      return withCors(
        new Response(JSON.stringify({ ok: false, error: { code: 'NOT_FOUND', message: 'Not found.' } }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }),
        origin
      );
    }

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), origin);
    }

    if (request.method !== 'POST') {
      return withCors(
        new Response(JSON.stringify({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
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
