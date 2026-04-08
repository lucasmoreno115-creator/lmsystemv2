import { parseAndValidateForm } from './validation.js';
import { calculateLmScore } from '../core/lmScoreEngine.js';
import { classifyLead } from '../core/lmClassifier.js';
import { evaluateLeadValue } from '../core/lmLeadValueEngine.js';
import { recommendOffer } from '../core/lmOfferEngine.js';
import { generateTags } from '../core/lmTagEngine.js';
import { buildLeadPriority } from '../core/lmLeadPriorityEngine.js';
import { buildCoachSummary } from '../core/lmSummaryEngine.js';
import { saveLead } from '../firebase/leadRepository.js';

function resolveLeadPriority(priorityResult) {
  if (!priorityResult || typeof priorityResult !== 'object') return null;

  const reasons = Array.isArray(priorityResult.priorityReasons)
    ? priorityResult.priorityReasons.filter((reason) => typeof reason === 'string' && reason.trim() !== '')
    : [];

  const priority = {
    score: typeof priorityResult.priorityScore === 'number' ? priorityResult.priorityScore : null,
    level: typeof priorityResult.priorityLevel === 'string' ? priorityResult.priorityLevel : null,
    closeProbability: typeof priorityResult.closeProbability === 'string' ? priorityResult.closeProbability : null,
    contactAction: typeof priorityResult.contactAction === 'string' ? priorityResult.contactAction : null,
    reasons
  };

  if (priorityResult.breakdown !== undefined) {
    priority.breakdown = priorityResult.breakdown;
  }

  return priority;
}

export async function processLeadSubmission({ formElement, db }) {
  const formData = new FormData(formElement);
  const userInput = parseAndValidateForm(formData);

  const scoreResult = calculateLmScore(userInput);
  const classification = classifyLead(scoreResult);
  const leadValue = evaluateLeadValue(scoreResult);
  const recommendedOffer = recommendOffer({ leadValue, dimensions: scoreResult.dimensions });
  const tags = generateTags({ ...scoreResult, leadValue });

  let priority = null;
  try {
    priority = resolveLeadPriority(buildLeadPriority({
      lmScore: scoreResult.lmScore,
      classification,
      recommendedOffer,
      leadValue,
      dimensions: scoreResult.dimensions,
      tags
    }));
  } catch (error) {
    console.error('[LeadPriority] Falha ao calcular prioridade do lead:', error);
  }

  const coachSummary = buildCoachSummary({ dimensions: scoreResult.dimensions, classification, priority });

  const leadPayload = {
    name: userInput.name,
    email: userInput.email,
    whatsapp: userInput.whatsapp,
    goal: userInput.goal,
    lmScore: scoreResult.lmScore,
    classification,
    tags,
    leadValue,
    recommendedOffer,
    dimensions: scoreResult.dimensions,
    priority,
    coachSummary,
    status: 'NEW'
  };

  await saveLead(db, leadPayload);

  return {
    lmScore: scoreResult.lmScore,
    classification,
    leadPayload
  };
}
