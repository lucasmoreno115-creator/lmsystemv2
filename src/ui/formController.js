import { parseAndValidateForm } from './validation.js';
import { mapUserInputToDiagnosticRequest } from './diagnosticRequestMapper.js';
import { evaluateDiagnosticRemote } from './remoteDiagnosticClient.js';
import { adaptRemoteDiagnosticResult } from './diagnosticResultAdapter.js';
import { isRemoteDiagnosticEnabled, isDevEnvironment } from './diagnosticFlags.js';
import { calculateLmScore } from '../core/lmScoreEngine.js';
import { classifyLead } from '../core/lmClassifier.js';
import { evaluateLeadValue } from '../core/lmLeadValueEngine.js';
import { recommendOffer } from '../core/lmOfferEngine.js';
import { generateTags } from '../core/lmTagEngine.js';
import { buildLeadPriority } from '../core/lmLeadPriorityEngine.js';
import { buildCoachSummary } from '../core/lmSummaryEngine.js';

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

async function saveLegacyLead(db, leadPayload) {
  if (!db || !leadPayload) return;

  try {
    const { saveLead } = await import('../firebase/leadRepository.js');
    await saveLead(db, {
      ...leadPayload,
      status: 'NEW'
    });
  } catch (error) {
    console.warn('[Diagnostic] Falha no salvamento legado (não bloqueante):', error);
  }
}

function persistDiagnosticResult(result) {
  if (typeof localStorage === 'undefined') return;

  localStorage.setItem('LM_LAST_RESULT', JSON.stringify(result));
  localStorage.setItem('LM_LAST_TS', String(Date.now()));

  if (result?.leadId) {
    localStorage.setItem('LM_LAST_LEAD_ID', result.leadId);
  }
  if (result?.engineVersion) {
    localStorage.setItem('LM_LAST_ENGINE_VERSION', result.engineVersion);
  }
}

async function evaluateDiagnosticLocally(userInput) {
  const scoreResult = calculateLmScore(userInput);
  const classification = classifyLead(scoreResult);
  const leadValue = evaluateLeadValue(scoreResult);
  const tags = generateTags({ ...scoreResult, profile: userInput, leadValue });
  const recommendedOffer = recommendOffer({
    lmScore: scoreResult.lmScore,
    leadValue,
    dimensions: scoreResult.dimensions,
    tags
  });

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
    coachSummary
  };

  return {
    lmScore: scoreResult.lmScore,
    classification,
    tags,
    goal: userInput.goal,
    profile: scoreResult.dimensions,
    ctaHref: './planos.html',
    leadPayload
  };
}

async function evaluateRemoteFirst({ userInput, db }) {
  const requestPayload = mapUserInputToDiagnosticRequest(userInput);
  const remoteResponse = await evaluateDiagnosticRemote(requestPayload);
  const result = adaptRemoteDiagnosticResult({ remoteResponse, userInput });

  await saveLegacyLead(db, result.leadPayload);
  persistDiagnosticResult(result);

  return result;
}

export async function processLeadSubmission({ formElement, db }) {
  const formData = new FormData(formElement);
  const userInput = parseAndValidateForm(formData);

  if (!isRemoteDiagnosticEnabled()) {
    const localResult = await evaluateDiagnosticLocally(userInput);
    await saveLegacyLead(db, localResult.leadPayload);
    persistDiagnosticResult(localResult);
    return localResult;
  }

  try {
    return await evaluateRemoteFirst({ userInput, db });
  } catch (error) {
    if (isDevEnvironment()) {
      console.warn('[Diagnostic] Remote falhou em dev/local. Executando fallback local.', error);
      const localResult = await evaluateDiagnosticLocally(userInput);
      await saveLegacyLead(db, localResult.leadPayload);
      persistDiagnosticResult(localResult);
      return localResult;
    }

    throw error;
  }
}
