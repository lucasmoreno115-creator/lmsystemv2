import { USER_MESSAGE_48H } from '../utils/strings.js';
import { buildStrategicResult } from '../core/lmStrategicResultResolver.js';

function renderNarrativeParagraph(text, className = '') {
  return `<p class="${className}">${text}</p>`;
}

export function renderResult(container, result) {
  const strategic = buildStrategicResult({
    lmScore: result.lmScore,
    classificationLabel: result.classificationLabel,
    tags: result.tags || result.leadPayload?.tags,
    profile: result.profile,
    dimensions: result.leadPayload?.dimensions,
    recommendedOffer: result.leadPayload?.recommendedOffer,
    leadPriority: result.leadPayload?.priority
  });

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="result">
      <section class="result-block result-score-block">
        <p class="result-eyebrow">${strategic.eyebrow}</p>
        <h2>${strategic.title}</h2>
        <p class="score">${result.lmScore}/100</p>
        <p class="result-note"><strong>Classificação:</strong> ${strategic.classificationLabel}</p>
        ${renderNarrativeParagraph(strategic.diagnosis, 'result-diagnosis')}
        ${renderNarrativeParagraph(strategic.explanation)}
      </section>

      <section class="result-block result-emphasis-block">
        <h3>Virada de chave</h3>
        ${renderNarrativeParagraph(strategic.beliefBreak)}
      </section>

      <section class="result-block">
        <h3>Se nada mudar</h3>
        ${renderNarrativeParagraph(strategic.consequence)}
      </section>

      <section class="result-block result-emphasis-block">
        <h3>Direção estratégica</h3>
        ${renderNarrativeParagraph(strategic.strategicDirection)}
        ${renderNarrativeParagraph(strategic.bridge, 'result-note')}
      </section>

      <section class="result-block result-cta">
        <h3>Próximo passo recomendado</h3>
        <a
          class="result-cta-button"
          href="${strategic.cta.href}"
          data-client-state="${strategic.clientState}"
          data-recommended-offer="${result.leadPayload?.recommendedOffer || ''}"
          data-cta-label="${strategic.cta.buttonLabel}"
        >${strategic.cta.buttonLabel}</a>
        <p class="result-disclaimer">${strategic.cta.supportText}</p>
        <p class="result-disclaimer">${USER_MESSAGE_48H}</p>
      </section>
    </div>
  `;

  return strategic;
}
