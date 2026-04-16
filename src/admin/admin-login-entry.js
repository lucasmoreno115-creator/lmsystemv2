import { createAdminSession } from './adminAccessGate.js';
import { validateDashboardPassword } from './adminLogin.js';
import { DASHBOARD_ROUTE } from './adminAccessConfig.js';

function getReason(search) {
  const params = new URLSearchParams(search || '');
  return params.get('reason');
}

const form = document.querySelector('#admin-login-form');
const input = document.querySelector('#dashboard-password');
const error = document.querySelector('#admin-login-error');

const reason = getReason(window.location.search);
if (reason === 'expired') {
  error.textContent = 'Sessão expirada. Entre novamente.';
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  error.textContent = '';

  const password = input?.value || '';
  if (!password.trim()) {
    error.textContent = 'Senha inválida';
    return;
  }

  if (!validateDashboardPassword(password)) {
    error.textContent = 'Senha inválida';
    return;
  }

  const session = createAdminSession();
  if (!session) {
    error.textContent = 'Não foi possível validar o acesso.';
    return;
  }

  window.location.assign(DASHBOARD_ROUTE);
});
