import { USER_MESSAGE_48H } from '../utils/strings.js';

export function renderResult(container, result) {
  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="result">
      <h2>Resultado da Triagem</h2>
      <p class="score">${result.lmScore}</p>
      <p><strong>Classificação:</strong> ${result.classification}</p>
      <p>${USER_MESSAGE_48H}</p>
    </div>
  `;
}
