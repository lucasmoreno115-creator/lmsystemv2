import { calculateLmScore } from '../../core/lmScoreEngine.js';
import { classifyLead } from '../../core/lmClassifier.js';
import { evaluateLeadValue } from '../../core/lmLeadValueEngine.js';
import { generateTags } from '../../core/lmTagEngine.js';
import { recommendOffer } from '../../core/lmOfferEngine.js';
import { buildLeadPriority } from '../../core/lmLeadPriorityEngine.js';
import { buildStrategicResult } from '../../core/lmStrategicResultResolver.js';
import { mapNormalizedInputToEngineInput, mapPriority } from './diagnosticMapper.js';

export const ENGINE_VERSION = 'diagnostic-v1.0.0';

export function evaluateDiagnostic(normalizedPayload) {
  const engineInput = mapNormalizedInputToEngineInput(normalizedPayload);
  const scoreResult = calculateLmScore(engineInput);
  const classification = classifyLead(scoreResult);
  const leadValue = evaluateLeadValue(scoreResult);
  const tags = generateTags({
    lmScore: scoreResult.lmScore,
    dimensions: scoreResult.dimensions,
    profile: engineInput,
    leadValue
  });

  const recommendedOffer = recommendOffer({
    lmScore: scoreResult.lmScore,
    leadValue,
    dimensions: scoreResult.dimensions,
    tags
  });

  const rawPriority = buildLeadPriority({
    lmScore: scoreResult.lmScore,
    classification,
    recommendedOffer,
    leadValue,
    dimensions: scoreResult.dimensions,
    tags
  });

  const leadPriority = mapPriority(rawPriority);
  const strategicResultRaw = buildStrategicResult({
    lmScore: scoreResult.lmScore,
    classificationLabel: classification,
    tags,
    dimensions: scoreResult.dimensions,
    recommendedOffer,
    leadPriority
  });

  return {
    engineVersion: ENGINE_VERSION,
    result: {
      lmScore: scoreResult.lmScore,
      classification,
      dimensions: scoreResult.dimensions,
      tags,
      clientState: strategicResultRaw.clientState,
      recommendedOffer,
      leadPriority,
      strategicResult: {
        eyebrow: strategicResultRaw.eyebrow,
        title: strategicResultRaw.title,
        diagnosis: strategicResultRaw.diagnosis,
        explanation: strategicResultRaw.explanation,
        beliefBreak: strategicResultRaw.beliefBreak,
        consequence: strategicResultRaw.consequence,
        strategicDirection: strategicResultRaw.strategicDirection,
        bridge: strategicResultRaw.bridge,
        ctaLabel: strategicResultRaw.ctaLabel,
        ctaHref: strategicResultRaw.ctaHref,
        ctaSupportText: strategicResultRaw.ctaSupportText
      }
    }
  };
}
