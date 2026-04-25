export function adaptRemoteDiagnosticResult({ remoteResponse, userInput }) {
  if (!remoteResponse || !remoteResponse.data) {
    throw new Error('Resposta da API inválida');
  }

  const { lmScore, classification, leadId } = remoteResponse.data;

  return {
    lmScore,
    classification,
    leadId,

    goal: userInput.goal,

    tags: [],
    profile: {},
    ctaHref: './planos.html',

    leadPayload: {
      name: userInput.name,
      email: userInput.email,
      whatsapp: userInput.whatsapp,
      goal: userInput.goal,
      lmScore,
      classification,
      recommendedOffer: 'CONSULTORIA'
    }
  };
}
