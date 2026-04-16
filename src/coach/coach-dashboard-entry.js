import { initializeCoachDashboard } from './coachDashboard.js';
import { requireAdminAccess } from '../admin/adminAccessGate.js';

const access = requireAdminAccess();
if (access.allowed) {
  document.body.classList.remove('admin-gated');
  initializeCoachDashboard();
}
