function normalizePriority(priority) {
  if (!priority || typeof priority !== 'object') return null;
  return {
    score: typeof priority.score === 'number' ? priority.score : null,
    level: typeof priority.level === 'string' ? priority.level : null,
    closeProbability: typeof priority.closeProbability === 'string' ? priority.closeProbability : null,
    contactAction: typeof priority.contactAction === 'string' ? priority.contactAction : null,
    reasons: Array.isArray(priority.reasons) ? priority.reasons.filter(Boolean) : []
  };
}

export function adaptRemoteDiagnosticResult({ remoteResponse, userInput }) {
  const result = remoteResponse?.result ?? {};
  const dimensions = result.dimensions ?? result.profile ?? {};
  const priority = normalizePriority(result.leadPriority ?? result.priority);

  const leadPayload = {
    name: userInput.name,
    email: userInput.email,
    whatsapp: userInput.whatsapp,
    goal: userInput.goal,
    dimensions,
    tags: Array.isArray(result.tags) ? result.tags : [],
    recommendedOffer: result.recommendedOffer ?? null,
    priority,
    clientState: result.clientState ?? null,
    strategicResult: result.strategicResult ?? null
  };

  return {
    lmScore: result.lmScore ?? null,
    classification: result.classification ?? '',
    classificationLabel: result.classificationLabel ?? result.classification ?? '',
    tags: leadPayload.tags,
    goal: userInput.goal,
    profile: dimensions,
    ctaHref: './planos.html',
    leadId: remoteResponse?.leadId ?? null,
    engineVersion: remoteResponse?.engineVersion ?? null,
    leadPayload
  };
}
