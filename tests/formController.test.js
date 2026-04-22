import test from 'node:test';
import assert from 'node:assert/strict';
import { processLeadSubmission } from '../src/ui/formController.js';

function buildFields(overrides = {}) {
  return {
    name: 'Maria',
    email: 'maria@example.com',
    whatsapp: '+5511999999999',
    goal: 'ganho_massa_muscular',
    trainingFrequency: '4',
    trainingExperience: '3',
    foodAdherence: '4',
    sleepQuality: '4',
    stressLevel: '2',
    painInjury: '1',
    consistencyHistory: '4',
    motivationLevel: '5',
    ...overrides
  };
}

function withBrowserGlobals({ hostname = 'app.lm.com', flags = {}, fetchImpl } = {}) {
  const oldWindow = globalThis.window;
  const oldFormData = globalThis.FormData;
  const oldLocalStorage = globalThis.localStorage;
  const oldFetch = globalThis.fetch;

  class MockFormData {
    constructor(formElement) {
      this._fields = formElement.__fields;
    }

    get(key) {
      return this._fields[key] ?? null;
    }
  }

  const storage = new Map();
  globalThis.window = {
    location: { hostname },
    __LM_FLAGS__: flags
  };
  globalThis.FormData = MockFormData;
  globalThis.localStorage = {
    setItem(key, value) {
      storage.set(key, String(value));
    },
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    }
  };

  if (fetchImpl) {
    globalThis.fetch = fetchImpl;
  }

  return () => {
    globalThis.window = oldWindow;
    globalThis.FormData = oldFormData;
    globalThis.localStorage = oldLocalStorage;
    globalThis.fetch = oldFetch;
  };
}

test('processLeadSubmission uses remote API result when enabled', async () => {
  const restore = withBrowserGlobals({
    flags: { USE_REMOTE_DIAGNOSTIC_ENGINE: true },
    fetchImpl: async (url, options) => {
      assert.equal(url, '/api/diagnostic/evaluate');
      const body = JSON.parse(options.body);
      assert.equal(body.meta.source, 'diagnostic_form');
      return {
        ok: true,
        async json() {
          return {
            ok: true,
            leadId: 'lead_remote_1',
            engineVersion: 'engine-2026-04-20',
            result: {
              lmScore: 91,
              classification: 'Avançado disciplinado',
              dimensions: { training: 90 },
              tags: ['high_performer'],
              clientState: 'HIGH_PERFORMER',
              recommendedOffer: 'consultoria_online',
              leadPriority: { level: 'high' }
            }
          };
        }
      };
    }
  });

  try {
    const result = await processLeadSubmission({
      formElement: { __fields: buildFields() },
      db: null
    });

    assert.equal(result.lmScore, 91);
    assert.equal(result.leadId, 'lead_remote_1');
    assert.equal(result.engineVersion, 'engine-2026-04-20');
    assert.equal(result.leadPayload.recommendedOffer, 'consultoria_online');
    assert.equal(result.leadPayload.clientState, 'HIGH_PERFORMER');
  } finally {
    restore();
  }
});

test('processLeadSubmission falls back to local only in dev/local', async () => {
  const restore = withBrowserGlobals({
    hostname: 'localhost',
    flags: { USE_REMOTE_DIAGNOSTIC_ENGINE: true },
    fetchImpl: async () => {
      throw new Error('network failed');
    }
  });

  try {
    const result = await processLeadSubmission({
      formElement: { __fields: buildFields() },
      db: null
    });

    assert.equal(typeof result.lmScore, 'number');
    assert.equal(result.leadId, undefined);
    assert.equal(result.leadPayload.goal, 'muscle_gain');
  } finally {
    restore();
  }
});

test('processLeadSubmission does not use silent local fallback in production', async () => {
  const restore = withBrowserGlobals({
    hostname: 'app.lm.com',
    flags: { USE_REMOTE_DIAGNOSTIC_ENGINE: true },
    fetchImpl: async () => ({ ok: false, status: 503 })
  });

  try {
    await assert.rejects(
      () => processLeadSubmission({
        formElement: { __fields: buildFields() },
        db: null
      }),
      (error) => error instanceof Error && error.message.includes('Não foi possível processar seu diagnóstico agora')
    );
  } finally {
    restore();
  }
});
