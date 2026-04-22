export function mapNormalizedInputToEngineInput(normalizedPayload) {
  return {
    ...normalizedPayload.answers,
    goal: normalizedPayload.lead.goal
  };
}

export function mapPriority(priorityResult) {
  if (!priorityResult || typeof priorityResult !== 'object') return null;

  return {
    score: null,
    level: priorityResult.priorityLevel ?? null,
    closeProbability: priorityResult.closeProbability ?? null,
    contactAction: priorityResult.contactAction ?? null,
    reasons: Array.isArray(priorityResult.priorityReasons) ? priorityResult.priorityReasons : []
  };
}
