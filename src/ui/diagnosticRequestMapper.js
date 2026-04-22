export function mapUserInputToDiagnosticRequest(userInput, { variant = null } = {}) {
  return {
    lead: {
      name: userInput.name,
      email: userInput.email,
      whatsapp: userInput.whatsapp,
      goal: userInput.goal
    },
    answers: {
      trainingFrequency: userInput.trainingFrequency,
      trainingExperience: userInput.trainingExperience,
      sleepQuality: userInput.sleepQuality,
      stressLevel: userInput.stressLevel,
      painInjury: userInput.painInjury,
      nutritionConsistency: userInput.foodAdherence,
      foodAdherence: userInput.foodAdherence,
      routineStability: userInput.consistencyHistory,
      consistencyHistory: userInput.consistencyHistory,
      motivation: userInput.motivationLevel,
      motivationLevel: userInput.motivationLevel
    },
    meta: {
      source: 'diagnostic_form',
      variant
    }
  };
}
