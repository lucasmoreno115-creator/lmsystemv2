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

  const leadInsert = await client.run(
    `
      INSERT INTO leads (
        id,
        name,
        email,
        whatsapp,
        goal,
        created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    `,
    leadId,
    normalizedPayload.lead.name,
    normalizedPayload.lead.email,
    normalizedPayload.lead.whatsapp,
    normalizedPayload.lead.goal,
    now
  );

  const diagnosticId = createId('diag');

  const resultInsert = await client.run(
    `
      INSERT INTO diagnostic_results (
        id,
        lead_id,
        engine_version,
        lm_score,
        classification,
        dimensions_json,
        tags_json,
        client_state,
        recommended_offer,
        lead_priority,
        strategic_result_json,
        raw_answers_json,
        meta_json,
        created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
    `,
    diagnosticId,
    leadId,
    evaluation.engineVersion,
    evaluation.result.lmScore,
    evaluation.result.classification,
    JSON.stringify(evaluation.result.dimensions ?? {}),
    JSON.stringify(evaluation.result.tags ?? []),
    evaluation.result.clientState ?? '',
    evaluation.result.recommendedOffer ?? '',
    JSON.stringify(evaluation.result.leadPriority ?? {}),
    JSON.stringify(evaluation.result.strategicResult ?? {}),
    JSON.stringify(normalizedPayload.answers ?? {}),
    JSON.stringify(normalizedPayload.meta ?? {}),
    now
  );

  console.log('leadInsert:', leadInsert);
  console.log('resultInsert:', resultInsert);

  return {
    leadId,
    diagnosticId,
  };
}
