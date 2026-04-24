import { createD1Client } from '../db/d1Client.js';

function createId(prefix) {
<<<<<<< HEAD
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().replace(/-/g, '')
    : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}_${random}`;
}

export async function persistDiagnosticEvaluation({ dbBinding, normalizedPayload, evaluation }) {
  const client = createD1Client(dbBinding);
  const leadId = createId('lead');

=======
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function persistDiagnosticEvaluation({
  dbBinding,
  normalizedPayload,
  evaluation
}) {
  const client = createD1Client(dbBinding);

  const leadId = createId('lead');
  const now = new Date().toISOString();

  // 🔥 fallback seguro (se DB falhar)
>>>>>>> 8d70a70 (fix: stabilize backend and D1)
  if (!client) {
    return { leadId };
  }

<<<<<<< HEAD
  const now = new Date().toISOString();
  await client.ensureSchema();

=======
  // 👉 INSERT LEAD
>>>>>>> 8d70a70 (fix: stabilize backend and D1)
  await client.run(
    `INSERT INTO leads (id, name, email, whatsapp, goal, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    leadId,
    normalizedPayload.lead.name,
    normalizedPayload.lead.email,
    normalizedPayload.lead.whatsapp,
    normalizedPayload.lead.goal,
    now
  );

<<<<<<< HEAD
  const result = evaluation.result;

=======
  // 👉 INSERT RESULTADO (ALINHADO COM SEU SCHEMA)
>>>>>>> 8d70a70 (fix: stabilize backend and D1)
  await client.run(
    `INSERT INTO diagnostic_results (
      id,
      lead_id,
      engine_version,
      lm_score,
      classification,
<<<<<<< HEAD
      dimensions_json,
      tags_json,
      client_state,
      recommended_offer,
      lead_priority,
      strategic_result_json,
      raw_answers_json,
      meta_json,
      created_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`,
    createId('diag'),
    leadId,
    evaluation.engineVersion,
    result.lmScore,
    result.classification,
    JSON.stringify(result.dimensions),
    JSON.stringify(result.tags),
    result.clientState,
    result.recommendedOffer,
    JSON.stringify(result.leadPriority),
    JSON.stringify(result.strategicResult),
    JSON.stringify(normalizedPayload.answers),
    JSON.stringify(normalizedPayload.meta || {}),
=======
      result_json,
      created_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    createId('diag'),
    leadId,
    evaluation.engineVersion,
    evaluation.result.lmScore,
    evaluation.result.classification,
    JSON.stringify(evaluation.result),
>>>>>>> 8d70a70 (fix: stabilize backend and D1)
    now
  );

  return { leadId };
<<<<<<< HEAD
}
=======
}
>>>>>>> 8d70a70 (fix: stabilize backend and D1)
