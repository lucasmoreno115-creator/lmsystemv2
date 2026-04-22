import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDiagnosticRemote } from '../src/ui/remoteDiagnosticClient.js';

test('evaluateDiagnosticRemote performs POST and returns normalized response', async () => {
  const payload = { lead: { name: 'Ana' } };
  let requestArgs = null;

  const result = await evaluateDiagnosticRemote(payload, {
    fetchImpl: async (...args) => {
      requestArgs = args;
      return {
        ok: true,
        async json() {
          return {
            ok: true,
            leadId: 'lead_123',
            engineVersion: 'v2.1.0',
            result: { lmScore: 80 }
          };
        }
      };
    }
  });

  assert.equal(requestArgs[0], '/api/diagnostic/evaluate');
  assert.equal(requestArgs[1].method, 'POST');
  assert.equal(requestArgs[1].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(requestArgs[1].body), payload);
  assert.deepEqual(result, {
    ok: true,
    leadId: 'lead_123',
    engineVersion: 'v2.1.0',
    result: { lmScore: 80 }
  });
});

test('evaluateDiagnosticRemote throws friendly error for non-2xx status', async () => {
  await assert.rejects(
    () => evaluateDiagnosticRemote({}, {
      fetchImpl: async () => ({ ok: false, status: 500 })
    }),
    (error) => error instanceof Error && error.code === 'REMOTE_HTTP_ERROR'
  );
});

test('evaluateDiagnosticRemote throws friendly error for invalid JSON response', async () => {
  await assert.rejects(
    () => evaluateDiagnosticRemote({}, {
      fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true }) })
    }),
    (error) => error instanceof Error && error.code === 'REMOTE_INVALID_RESPONSE'
  );
});
