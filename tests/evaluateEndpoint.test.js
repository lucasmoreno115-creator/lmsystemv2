import test from 'node:test';
import assert from 'node:assert/strict';

import { createEvaluateHandler } from '../src/server/diagnostic/evaluateEndpoint.js';
import { ValidationError } from '../src/server/diagnostic/diagnosticSchemas.js';

test('endpoint returns real response shape and does not return mock fields', async () => {
  const handler = createEvaluateHandler({
    validatePayload: (body) => ({ ...body, normalized: true }),
    evaluate: () => ({
      engineVersion: 'diagnostic-v1.0.0',
      result: {
        lmScore: 38,
        classification: 'Base em construção',
        dimensions: { adherence: 30 },
        tags: ['low_adherence'],
        clientState: 'LOW_ADHERENCE',
        recommendedOffer: 'consultoria_online',
        leadPriority: { level: 'medium', reasons: [] },
        strategicResult: { title: 'Plano de retomada' }
      }
    }),
    persist: async () => ({ leadId: 'lead_abc' }),
    buildResponse: ({ leadId, evaluation }) => ({
      ok: true,
      leadId,
      engineVersion: evaluation.engineVersion,
      result: evaluation.result
    })
  });

  const response = await handler({
    request: new Request('https://example.com/api/diagnostic/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead: { name: 'Ana' }, answers: {} })
    }),
    env: { DB: {} }
  });

  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.equal(payload.ok, true);
  assert.equal(payload.leadId, 'lead_abc');
  assert.equal(payload.engineVersion, 'diagnostic-v1.0.0');
  assert.equal(payload.result.lmScore, 38);
  assert.equal(payload.message, undefined);
  assert.equal(payload.received, undefined);
});

test('endpoint calls evaluateDiagnostic and D1 persistence', async () => {
  let evaluateCalled = false;
  let persistedWithDb = null;

  const handler = createEvaluateHandler({
    validatePayload: () => ({ lead: { name: 'Ana' }, answers: {} }),
    evaluate: () => {
      evaluateCalled = true;
      return {
        engineVersion: 'diagnostic-v1.0.0',
        result: { lmScore: 50, classification: 'Em evolução', dimensions: {}, tags: [], strategicResult: {} }
      };
    },
    persist: async ({ dbBinding }) => {
      persistedWithDb = dbBinding;
      return { leadId: 'lead_persisted' };
    },
    buildResponse: ({ leadId, evaluation }) => ({ ok: true, leadId, engineVersion: evaluation.engineVersion, result: evaluation.result })
  });

  const dbBinding = { mock: true };
  await handler({
    request: new Request('https://example.com', { method: 'POST', body: '{}' }),
    env: { DB: dbBinding }
  });

  assert.equal(evaluateCalled, true);
  assert.equal(persistedWithDb, dbBinding);
});

test('endpoint returns 400 for invalid payload', async () => {
  const handler = createEvaluateHandler({
    validatePayload: () => {
      throw new ValidationError('Payload inválido.', { 'lead.email': 'required' });
    }
  });

  const response = await handler({
    request: new Request('https://example.com', { method: 'POST', body: '{}' }),
    env: {}
  });

  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.deepEqual(payload, {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message: 'Payload inválido.',
      fields: { 'lead.email': 'required' }
    }
  });
});

test('endpoint returns 500 for internal errors', async () => {
  const handler = createEvaluateHandler({
    validatePayload: () => ({ lead: {}, answers: {} }),
    evaluate: () => {
      throw new Error('boom');
    }
  });

  const response = await handler({
    request: new Request('https://example.com', { method: 'POST', body: '{}' }),
    env: {}
  });

  assert.equal(response.status, 500);
  const payload = await response.json();
  assert.deepEqual(payload, {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Não foi possível processar o diagnóstico.'
    }
  });
});
