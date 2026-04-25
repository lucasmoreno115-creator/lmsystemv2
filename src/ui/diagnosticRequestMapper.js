export function mapUserInputToDiagnosticRequest(userInput, { variant = null } = {}) {
  return {
    lead: {
      name: userInput.name,
      email: userInput.email,
      whatsapp: userInput.whatsapp,
      goal: userInput.goal
    },
    answers: {
      trainingFrequency: Number(userInput.trainingFrequency),
      trainingExperience: Number(userInput.trainingExperience),
      foodAdherence: Number(userInput.foodAdherence),
      sleepQuality: Number(userInput.sleepQuality),
      stressLevel: Number(userInput.stressLevel),
      painInjury: Number(userInput.painInjury),
      consistencyHistory: Number(userInput.consistencyHistory),
      motivationLevel: Number(userInput.motivationLevel)
    },
    meta: {
      source: 'diagnostic_form',
      variant
    }
  };
}
