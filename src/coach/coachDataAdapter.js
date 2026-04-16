import { loadCoachSnapshot } from './coachStorage.js';
import { resolveClientState } from '../core/resolveClientState.js';

function safeJsonParse(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resolveGoal(rawResult, rawInput) {
  return rawResult?.goal || rawResult?.leadPayload?.goal || rawInput?.goal || 'Não informado';
}

function resolveLeadPriority(rawResult) {
  return rawResult?.leadPayload?.priority?.level || rawResult?.leadPayload?.priority || 'Não definida';
}

function resolveClassification(rawResult) {
  return rawResult?.classification || rawResult?.classificationLabel || 'Não classificado';
}

function resolveGeneratedAt(rawTimestamp) {
  if (!rawTimestamp) return null;
  const ts = Number(rawTimestamp);
  if (!Number.isFinite(ts)) return null;
  return new Date(ts).toISOString();
}

export function adaptCoachData({ rawResult, rawInput, rawTimestamp, selectedPlan } = {}) {
  const parsedResult = typeof rawResult === 'string' ? safeJsonParse(rawResult) : rawResult;
  const parsedInput = typeof rawInput === 'string' ? safeJsonParse(rawInput) : rawInput;

  if (!parsedResult && !parsedInput) {
    return { hasData: false, student: {}, diagnosis: {}, context: {} };
  }

  const dimensions = parsedResult?.leadPayload?.dimensions || parsedResult?.profile || {};
  const lmScore = parsedResult?.lmScore ?? null;

  return {
    hasData: true,
    student: {
      name: parsedResult?.leadPayload?.name || parsedInput?.name || 'Aluno sem nome',
      email: parsedResult?.leadPayload?.email || parsedInput?.email || '-',
      whatsapp: parsedResult?.leadPayload?.whatsapp || parsedInput?.whatsapp || '-'
    },
    diagnosis: {
      lmScore,
      classification: resolveClassification(parsedResult),
      dimensions,
      tags: parsedResult?.tags || parsedResult?.leadPayload?.tags || [],
      clientState: parsedResult?.clientState || resolveClientState({ lmScore, dimensions }),
      leadPriority: resolveLeadPriority(parsedResult),
      recommendedOffer: parsedResult?.leadPayload?.recommendedOffer || '-',
      goal: resolveGoal(parsedResult, parsedInput)
    },
    context: {
      selectedPlan: selectedPlan || parsedResult?.selectedPlan || 'Não selecionado',
      generatedAt: resolveGeneratedAt(rawTimestamp)
    }
  };
}

export function loadCoachDataFromStorage(storage = globalThis?.localStorage) {
  const snapshot = loadCoachSnapshot(storage);
  if (!snapshot) return { hasData: false, student: {}, diagnosis: {}, context: {} };

  return adaptCoachData(snapshot);
}
