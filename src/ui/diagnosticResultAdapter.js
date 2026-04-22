export function adaptRemoteDiagnosticResult({ remoteResponse, userInput }) {
  const r = remoteResponse.result;

  return {
    lmScore: r.lmScore,
    classification: r.classification,
    tags: r.tags,
    goal: userInput.goal,
    profile: r.dimensions,
    strategicResult: r.strategicResult,
    leadId: remoteResponse.leadId,
    engineVersion: remoteResponse.engineVersion,
    leadPayload: {
      name: userInput.name,
      email: userInput.email,
      whatsapp: userInput.whatsapp,
      goal: userInput.goal,
      lmScore: r.lmScore,
      classification: r.classification,
      tags: r.tags,
      dimensions: r.dimensions,
      recommendedOffer: r.recommendedOffer,
      clientState: r.clientState,
      leadPriority: r.leadPriority
    }
  };
}
