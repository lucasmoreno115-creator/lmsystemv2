import { createFirebaseClients } from './src/firebase/firebaseConfig.js';
import { processLeadSubmission } from './src/ui/formController.js';
import { setLoading } from './src/ui/loadingState.js';
import { mapErrorToMessage } from './src/ui/errorMapper.js';
import { createSubmitGuard } from './src/ui/submitGuards.js';
import { renderResult } from './src/ui/resultRenderer.js';
import { trackEvent } from './src/ui/telemetry.js';

const firebaseConfig = {
  apiKey: "AIzaSyBgrhvvz2ZEgUQruCiY4HNgg7AziWEGyfU",
  authDomain: "lm-system-1f7db.firebaseapp.com",
  projectId: "lm-system-1f7db",
  appId: "1:476670666393:web:7c0a518c10d2928d843a08"
};

const { db } = createFirebaseClients(firebaseConfig);
const formElement = document.querySelector('#lead-form');
const submitButton = document.querySelector('#submit-btn');
const errorContainer = document.querySelector('#form-error');
const resultCard = document.querySelector('#result-card');
const submitGuard = createSubmitGuard();

resultCard.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  if (!event.target.classList.contains('result-cta-button')) return;

  trackEvent('result_cta_clicked', {
    href: event.target.getAttribute('href') || '#'
  });
});

formElement.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorContainer.textContent = '';

  try {
    submitGuard.lock();
    setLoading(submitButton, true);
    trackEvent('lead_submit_started');

    const result = await processLeadSubmission({ formElement, db });

    renderResult(resultCard, result);
    trackEvent('result_rendered', {
      lmScore: result.lmScore,
      classification: result.classification
    });
    trackEvent('lead_submit_success', {
      lmScore: result.lmScore,
      offer: result.leadPayload?.recommendedOffer ?? null
    });

    formElement.reset();
  } catch (error) {
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
