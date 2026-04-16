import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAdminSession,
  isAdminSessionValid,
  clearAdminSession,
  requireAdminAccess,
  getAdminSession
} from '../src/admin/adminAccessGate.js';
import { SESSION_STORAGE_KEY } from '../src/admin/adminAccessConfig.js';

function createStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); },
    removeItem(key) { store.delete(key); }
  };
}

test('adminAccessGate cria e valida sessão', () => {
  const storage = createStorage();
  const now = Date.parse('2026-04-16T12:00:00Z');
  createAdminSession({ storage, now });

  assert.equal(Boolean(getAdminSession({ storage })), true);
  assert.equal(isAdminSessionValid({ storage, now: now + 60_000 }), true);
});

test('adminAccessGate detecta expiração e limpa sessão', () => {
  const storage = createStorage();
  const now = Date.parse('2026-04-16T12:00:00Z');
  createAdminSession({ storage, now });

  const expiredNow = now + 241 * 60 * 1000;
  assert.equal(isAdminSessionValid({ storage, now: expiredNow }), false);
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);
});

test('adminAccessGate limpa sessão manualmente', () => {
  const storage = createStorage();
  createAdminSession({ storage, now: Date.now() });
  clearAdminSession({ storage });
  assert.equal(getAdminSession({ storage }), null);
});

test('requireAdminAccess nega sem sessão e redireciona', () => {
  const storage = createStorage();
  let redirectedTo = null;
  const location = { assign(url) { redirectedTo = url; } };

  const access = requireAdminAccess({ storage, location, redirectTo: './coach-dashboard-login.html' });

  assert.equal(access.allowed, false);
  assert.equal(access.reason, 'missing_session');
  assert.equal(redirectedTo, './coach-dashboard-login.html');
});

test('requireAdminAccess permite quando autenticado', () => {
  const storage = createStorage();
  const now = Date.parse('2026-04-16T12:00:00Z');
  createAdminSession({ storage, now });
  let redirectedTo = null;
  const location = { assign(url) { redirectedTo = url; } };

  const access = requireAdminAccess({ storage, location, now: now + 1_000 });

  assert.equal(access.allowed, true);
  assert.equal(access.reason, null);
  assert.equal(redirectedTo, null);
});
