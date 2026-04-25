import { createFirebaseClients } from './src/firebase/firebaseConfig.js';
import { processLeadSubmission } from './src/ui/formController.js';
import { setLoading } from './src/ui/loadingState.js';
import { mapErrorToMessage } from './src/ui/errorMapper.js';
import { createSubmitGuard } from './src/ui/submitGuards.js';
import { renderResult } from './src/ui/resultRenderer.js';
import { trackEvent } from './src/ui/telemetry.js';
import {
  buildResultViewedPayload,
  buildResultCtaClickedPayload
} from './src/ui/resultTelemetry.js';
import { saveCoachSnapshot } from './src/coach/coachStorage.js';

// =========================
// FIREBASE
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyBgrhvvz2ZEgUQruCiY4HNgg7AziWEGyfU",
  authDomain: "lm-system-1f7db.firebaseapp.com",
  projectId: "lm-system-1f7db",
  appId: "1:476670666393:web:7c0a518c10d2928d843a08"
};

const { db } = createFirebaseClients(firebaseConfig);

// =========================
// ELEMENTOS
// =========================
const formElement = document.querySelector('#lead-form');
const submitButton = document.querySelector('#submit-btn');
const errorContainer = document.querySelector('#form-error');
const resultCard = document.querySelector('#result-card');

const submitGuard = createSubmitGuard();

// =========================
// CTA DO RESULTADO
// =========================
resultCard.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  if (!event.target.classList.contains('result-cta-button')) return;

  trackEvent('result_cta_clicked', buildResultCtaClickedPayload(event.target));
});

// =========================
// SUBMIT PRINCIPAL
// =========================
formElement.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorContainer.textContent = '';

  try {
    submitGuard.lock();
    setLoading(submitButton, true);

    trackEvent('lead_submit_started');

    // 🔥 PROCESSAMENTO COMPLETO (API + fallback + mapper)
    const result = await processLeadSubmission({ formElement, db });

    // 🔥 RENDER CORRETO (já adaptado internamente)
    renderResult(resultCard, result);

    // 🔥 TRACKING
    trackEvent('result_viewed', buildResultViewedPayload({ result }));

    trackEvent('lead_submit_success', {
      lmScore: result.lmScore,
      offer: result.leadPayload?.recommendedOffer ?? null
    });

    // 🔥 SNAPSHOT PARA COACH
    saveCoachSnapshot({
      result,
      input: result.leadPayload ? {
        name: result.leadPayload.name,
        email: result.leadPayload.email,
        whatsapp: result.leadPayload.whatsapp,
        goal: result.leadPayload.goal
      } : null
    });

    // 🔥 LIMPA FORM
    formElement.reset();

  } catch (error) {
    console.error(error);

    errorContainer.textContent = mapErrorToMessage(error);

    trackEvent('lead_submit_error', {
      code: error?.code ?? null,
      message: error?.message ?? 'unknown_error'
    });

  } finally {
    setLoading(submitButton, false);
    submitGuard.release();
  }
});
