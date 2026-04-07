import { parseAndValidateForm } from './validation.js';
import { calculateLmScore } from '../core/lmScoreEngine.js';
import { classifyLead } from '../core/lmClassifier.js';
import { evaluateLeadValue } from '../core/lmLeadValueEngine.js';
import { recommendOffer } from '../core/lmOfferEngine.js';
import { generateTags } from '../core/lmTagEngine.js';
import { buildCoachSummary } from '../core/lmSummaryEngine.js';
import { saveLead } from '../firebase/leadRepository.js';

export async function processLeadSubmission({ formElement, db }) {
  const formData = new FormData(formElement);
  const userInput = parseAndValidateForm(formData);

  const scoreResult = calculateLmScore(userInput);
  const classification = classifyLead(scoreResult);
  const leadValue = evaluateLeadValue(scoreResult);
  const recommendedOffer = recommendOffer({ leadValue, dimensions: scoreResult.dimensions });
  const tags = generateTags({ ...scoreResult, leadValue });
  const coachSummary = buildCoachSummary({ dimensions: scoreResult.dimensions, classification });

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
