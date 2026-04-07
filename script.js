import { createFirebaseClients } from './src/firebase/firebaseConfig.js';
import { processLeadSubmission } from './src/ui/formController.js';
import { setLoading } from './src/ui/loadingState.js';
import { mapErrorToMessage } from './src/ui/errorMapper.js';
import { createSubmitGuard } from './src/ui/submitGuards.js';
import { renderResult } from './src/ui/resultRenderer.js';

const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  appId: 'REPLACE_ME'
};

const { db } = createFirebaseClients(firebaseConfig);
const formElement = document.querySelector('#lead-form');
const submitButton = document.querySelector('#submit-btn');
const errorContainer = document.querySelector('#form-error');
const resultCard = document.querySelector('#result-card');
const submitGuard = createSubmitGuard();

formElement.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorContainer.textContent = '';

  try {
    submitGuard.lock();
    setLoading(submitButton, true);
    const result = await processLeadSubmission({ formElement, db });
    renderResult(resultCard, result);
    formElement.reset();
  } catch (error) {
    errorContainer.textContent = mapErrorToMessage(error);
  } finally {
    setLoading(submitButton, false);
    submitGuard.release();
  }
});
