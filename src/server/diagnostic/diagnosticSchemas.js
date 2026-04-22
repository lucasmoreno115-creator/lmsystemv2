export class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'INVALID_INPUT';
    this.fields = fields;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function toScore(value) {
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) return null;
  return numeric;
}

function readAnswer(answers, keys) {
  for (const key of keys) {
    if (answers[key] !== undefined) return answers[key];
  }
  return undefined;
}

export function validateAndNormalizeDiagnosticPayload(payload) {
  const fields = {};

  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Payload inválido.', { payload: 'expected_object' });
  }

  const lead = payload.lead && typeof payload.lead === 'object' ? payload.lead : {};
  const answers = payload.answers && typeof payload.answers === 'object' ? payload.answers : {};

  if (!isNonEmptyString(lead.name)) fields['lead.name'] = 'required';
  if (!isNonEmptyString(lead.email)) fields['lead.email'] = 'required';
  if (!isNonEmptyString(lead.whatsapp)) fields['lead.whatsapp'] = 'required';
  if (!isNonEmptyString(lead.goal)) fields['lead.goal'] = 'required';

  const normalizedAnswers = {
    trainingFrequency: toScore(readAnswer(answers, ['trainingFrequency'])),
    trainingExperience: toScore(readAnswer(answers, ['trainingExperience'])),
    foodAdherence: toScore(readAnswer(answers, ['foodAdherence', 'nutritionConsistency'])),
    sleepQuality: toScore(readAnswer(answers, ['sleepQuality'])),
    stressLevel: toScore(readAnswer(answers, ['stressLevel'])),
    painInjury: toScore(readAnswer(answers, ['painInjury'])),
    consistencyHistory: toScore(readAnswer(answers, ['consistencyHistory', 'routineStability'])),
    motivationLevel: toScore(readAnswer(answers, ['motivationLevel', 'motivation']))
  };

  for (const [key, value] of Object.entries(normalizedAnswers)) {
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      fields[`answers.${key}`] = 'expected_number_between_1_and_5';
    }
  }

  if (Object.keys(fields).length) {
    throw new ValidationError('Payload inválido.', fields);
  }

  return {
    lead: {
      name: lead.name.trim(),
      email: lead.email.trim(),
      whatsapp: lead.whatsapp.trim(),
      goal: lead.goal.trim()
    },
    answers: normalizedAnswers,
    meta: payload.meta && typeof payload.meta === 'object' ? payload.meta : {}
  };
}
