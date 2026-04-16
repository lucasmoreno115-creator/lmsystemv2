import { loadCoachDataFromStorage } from './coachDataAdapter.js';
import { buildCoachPrescription } from './coachPrescriptionEngine.js';
import { buildPlanningBase } from './buildPlanningBase.js';
import { clearAdminSession } from '../admin/adminAccessGate.js';
import { LOGIN_ROUTE } from '../admin/adminAccessConfig.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

export function renderCoachDashboard({ data, prescription, planningBase }) {
  if (!data?.hasData) {
    return `
      <section class="coach-empty card">
        <h2>Nenhum diagnóstico salvo</h2>
        <p>Gere um diagnóstico no fluxo principal para liberar a visão de prescrição.</p>
        <a class="ghost-link" href="./index.html">Voltar ao diagnóstico</a>
      </section>
    `;
  }

  const d = data.diagnosis;
  const s = data.student;
  const c = data.context;

  return `
    <section class="card coach-summary-card">
      <h2>Resumo do aluno</h2>
      <div class="coach-grid-meta">
        <p><strong>Nome:</strong> ${escapeHtml(s.name)}</p>
        <p><strong>Objetivo:</strong> ${escapeHtml(d.goal)}</p>
        <p><strong>Plano:</strong> ${escapeHtml(c.selectedPlan)}</p>
        <p><strong>LM Score:</strong> ${escapeHtml(d.lmScore ?? '-')}</p>
        <p><strong>Classificação:</strong> ${escapeHtml(d.classification)}</p>
        <p><strong>Client state:</strong> ${escapeHtml(d.clientState)}</p>
        <p><strong>Prioridade:</strong> ${escapeHtml(d.leadPriority)}</p>
      </div>
    </section>

    <section class="card">
      <h2>Diagnóstico estratégico</h2>
      <p><strong>Principal trava:</strong> ${escapeHtml(d.clientState)}</p>
      <p><strong>Resumo interpretativo:</strong> ${escapeHtml(prescription.coachSummary)}</p>
      <p><strong>Foco principal:</strong> ${escapeHtml(prescription.strategicFocus)}</p>
    </section>

    <section class="card">
      <h2>Direção de prescrição</h2>
      <div class="coach-direction-grid">
        <article>
          <h3>Treino</h3>
          <ul>${renderList([
            `Frequência: ${prescription.trainingDirection.frequency}`,
            `Complexidade: ${prescription.trainingDirection.complexity}`,
            `Foco: ${prescription.trainingDirection.focus}`,
            `Progressão: ${prescription.trainingDirection.progression}`
          ])}</ul>
        </article>
        <article>
          <h3>Cardio</h3>
          <ul>${renderList([
            `Necessidade: ${prescription.cardioDirection.need}`,
            `Frequência: ${prescription.cardioDirection.frequency}`,
            `Intensidade: ${prescription.cardioDirection.intensity}`,
            `Observação: ${prescription.cardioDirection.operationalNote}`
          ])}</ul>
        </article>
        <article>
          <h3>Nutrição</h3>
          <ul>${renderList([
            `Estratégia: ${prescription.nutritionDirection.strategy}`,
            `Prioridade: ${prescription.nutritionDirection.behaviorPriority}`,
            `Complexidade: ${prescription.nutritionDirection.complexity}`,
            `Observação: ${prescription.nutritionDirection.adherenceNote}`
          ])}</ul>
        </article>
      </div>
    </section>

    <section class="card">
      <h2>Alertas automáticos</h2>
      <ul>${renderList(prescription.alerts)}</ul>
    </section>

    <section class="card">
      <h2>Checklist de entrega</h2>
      <ul class="coach-checklist">${prescription.deliveryChecklist.map((item, index) => `
        <li>
          <label><input type="checkbox" data-check="${index}"> ${escapeHtml(item)}</label>
        </li>
      `).join('')}</ul>
    </section>

    <section class="card">
      <h2>Ações finais</h2>
      <div class="coach-actions">
        <button id="copy-summary-btn" type="button">Copiar resumo operacional</button>
        <button id="generate-base-btn" type="button">Gerar planejamento-base</button>
        <button id="logout-btn" type="button">Sair</button>
        <a class="ghost-link" href="./index.html">Voltar ao diagnóstico</a>
      </div>
      <pre id="planning-base-output">${escapeHtml(planningBase)}</pre>
    </section>
  `;
}

export function initializeCoachDashboard({
  doc = globalThis.document,
  storage = globalThis.localStorage,
  clipboard = globalThis.navigator?.clipboard,
  location = globalThis.location
} = {}) {
  const container = doc.querySelector('#coach-dashboard-root');
  const feedback = doc.querySelector('#coach-action-feedback');

  const data = loadCoachDataFromStorage(storage);
  if (!data.hasData) {
    container.innerHTML = renderCoachDashboard({ data });
    return { data, prescription: null, planningBase: null };
  }

  const prescription = buildCoachPrescription(data.diagnosis);
  const planningBase = buildPlanningBase({ data, prescription });

  container.innerHTML = renderCoachDashboard({ data, prescription, planningBase });

  const copySummaryBtn = doc.querySelector('#copy-summary-btn');
  copySummaryBtn?.addEventListener('click', async () => {
    if (!clipboard?.writeText) {
      feedback.textContent = 'Clipboard indisponível neste navegador.';
      return;
    }

    await clipboard.writeText(prescription.coachSummary);
    feedback.textContent = 'Resumo operacional copiado.';
  });

  const generateBaseBtn = doc.querySelector('#generate-base-btn');
  generateBaseBtn?.addEventListener('click', async () => {
    if (clipboard?.writeText) {
      await clipboard.writeText(planningBase);
      feedback.textContent = 'Planejamento-base gerado e copiado.';
      return;
    }

    feedback.textContent = 'Planejamento-base gerado na tela.';
  });

  const logoutButton = doc.querySelector('#logout-btn');
  logoutButton?.addEventListener('click', () => {
    clearAdminSession({ storage });
    if (location?.assign) {
      location.assign(LOGIN_ROUTE);
      return;
    }
    feedback.textContent = 'Sessão finalizada.';
  });

  return { data, prescription, planningBase };
}
