import { createD1Client } from '../db/d1Client.js';

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function persistDiagnosticEvaluation({ dbBinding, normalizedPayload, evaluation }) {
  const client = createD1Client(dbBinding);
  const leadId = createId('lead');

  if (!client) {
    return { leadId };
  }

  const now = new Date().toISOString();
  await client.ensureSchema();

  await client.run(
    'INSERT INTO leads (id, name, email, whatsapp, goal, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)',
    leadId,
    normalizedPayload.lead.name,
    normalizedPayload.lead.email,
    normalizedPayload.lead.whatsapp,
    normalizedPayload.lead.goal,
    now
  );

  await client.run(
    'INSERT INTO diagnostic_results (id, lead_id, engine_version, lm_score, classification, result_json, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
    createId('diag'),
    leadId,
    evaluation.engineVersion,
    evaluation.result.lmScore,
    evaluation.result.classification,
    JSON.stringify(evaluation.result),
    now
  );

  return { leadId };
}
