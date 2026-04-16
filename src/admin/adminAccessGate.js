import {
  SESSION_STORAGE_KEY,
  SESSION_TTL_MINUTES,
  LOGIN_ROUTE
} from './adminAccessConfig.js';

function getSafeStorage(storage = globalThis?.localStorage) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    return null;
  }

  return storage;
}

function parseSession(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.authenticated !== true) return null;
    if (!Number.isFinite(parsed.createdAt) || !Number.isFinite(parsed.expiresAt)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createAdminSession({ storage = globalThis?.localStorage, now = Date.now() } = {}) {
  const safeStorage = getSafeStorage(storage);
  if (!safeStorage) return null;

  const ttlMs = SESSION_TTL_MINUTES * 60 * 1000;
  const session = {
    authenticated: true,
    createdAt: now,
    expiresAt: now + ttlMs
  };

  safeStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function getAdminSession({ storage = globalThis?.localStorage } = {}) {
  const safeStorage = getSafeStorage(storage);
  if (!safeStorage) return null;
  return parseSession(safeStorage.getItem(SESSION_STORAGE_KEY));
}

export function clearAdminSession({ storage = globalThis?.localStorage } = {}) {
  const safeStorage = getSafeStorage(storage);
  if (!safeStorage || typeof safeStorage.removeItem !== 'function') return;
  safeStorage.removeItem(SESSION_STORAGE_KEY);
}

export function isAdminSessionValid({ storage = globalThis?.localStorage, now = Date.now() } = {}) {
  const session = getAdminSession({ storage });
  if (!session) return false;
  if (session.expiresAt <= now) {
    clearAdminSession({ storage });
    return false;
  }
  return true;
}

export function requireAdminAccess({
  storage = globalThis?.localStorage,
  location = globalThis?.location,
  redirectTo = LOGIN_ROUTE,
  now = Date.now()
} = {}) {
  const session = getAdminSession({ storage });
  if (!session) {
    if (location?.assign) location.assign(redirectTo);
    return { allowed: false, reason: 'missing_session' };
  }

  if (!isAdminSessionValid({ storage, now })) {
    if (location?.assign) location.assign(`${redirectTo}?reason=expired`);
    return { allowed: false, reason: 'expired_session' };
  }

  return { allowed: true, reason: null };
}
