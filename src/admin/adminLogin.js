import { DASHBOARD_PASSWORD } from './adminAccessConfig.js';

// Em site estático, essa validação é apenas barreira operacional.
// Migração futura: trocar por autenticação real com backend/token.
export function validateDashboardPassword(inputPassword) {
  if (typeof inputPassword !== 'string') return false;
  return inputPassword.trim() !== '' && inputPassword.trim() === DASHBOARD_PASSWORD;
}
