import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDashboardPassword } from '../src/admin/adminLogin.js';
import { DASHBOARD_PASSWORD } from '../src/admin/adminAccessConfig.js';

test('validateDashboardPassword aceita senha correta', () => {
  assert.equal(validateDashboardPassword(DASHBOARD_PASSWORD), true);
  assert.equal(validateDashboardPassword(`  ${DASHBOARD_PASSWORD}  `), true);
});

test('validateDashboardPassword rejeita senha incorreta', () => {
  assert.equal(validateDashboardPassword('senha-errada'), false);
});

test('validateDashboardPassword rejeita input vazio', () => {
  assert.equal(validateDashboardPassword('   '), false);
  assert.equal(validateDashboardPassword(null), false);
});
