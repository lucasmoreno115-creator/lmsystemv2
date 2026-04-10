import { USER_MESSAGE_48H } from '../utils/strings.js';
import { buildStrategicResult } from '../core/lmStrategicResultResolver.js';

function renderOptionalRange(label) {
  if (!label) return '';
  return `<p class="result-note">${label}</p>`;
}

function renderBehaviorInsights(insights) {
  if (!Array.isArray(insights) || insights.length === 0) return '';

  return `
    <section class="result-block">
      <h3>Insight comportamental</h3>
      <ul class="result-list">
        ${insights.map((insight) => `<li>${insight}</li>`).join('')}
      </ul>
    </section>
  `;
}

export function renderResult(container, result) {
  const strategic = buildStrategicResult({
    lmScore: result.lmScore,
    classification: result.classification,
    classificationLabel: result.classificationLabel,
    goal: result.goal,
    tags: result.tags || result.leadPayload?.tags,
    profile: result.profile,
    ctaHref: result.ctaHref,
    ctaButtonLabel: result.ctaButtonLabel
  });

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="result">
      <section class="result-block result-score-block">
        <h2>${strategic.scoreMeaningTitle}</h2>
        <p class="score">${result.lmScore}/100</p>
        <p class="result-note"><strong>Classificação:</strong> ${strategic.classificationLabel}</p>
        <p>${strategic.scoreMeaningText}</p>
      </section>

      <section class="result-block">
        <h3>${strategic.startingPointTitle}</h3>
        <p>${strategic.startingPointText}</p>
      </section>
      ${renderBehaviorInsights(strategic.behaviorInsights)}

      <section class="result-block">
        <h3>${strategic.nutritionGuidance.title}</h3>
        <p>${strategic.nutritionGuidance.text}</p>
        ${renderOptionalRange(strategic.nutritionGuidance.kcalRangeLabel)}
        ${renderOptionalRange(strategic.nutritionGuidance.proteinRangeLabel)}
      </section>

      <section class="result-block">
        <h3>${strategic.trainingGuidance.title}</h3>
        <p>${strategic.trainingGuidance.text}</p>
        <div class="result-chips">
          <span class="result-chip">${strategic.trainingGuidance.strengthFrequencyLabel}</span>
          <span class="result-chip">${strategic.trainingGuidance.cardioFrequencyLabel}</span>
        </div>
      </section>

      <section class="result-block result-cta">
        <h3>${strategic.cta.title}</h3>
        <p>${strategic.cta.text}</p>
        <a class="result-cta-button" href="${strategic.cta.href}">${strategic.cta.buttonLabel}</a>
        <p class="result-disclaimer">${USER_MESSAGE_48H}</p>
      </section>
    </div>
  `;
}
