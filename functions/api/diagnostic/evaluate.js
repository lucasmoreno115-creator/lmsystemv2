export async function persistDiagnosticEvaluation({ dbBinding, normalizedPayload, evaluation }) {
  console.log("🚀 persist START");

  const client = createD1Client(dbBinding);
  const leadId = createId('lead');

  if (!client) {
    console.log("❌ DB client null");
    return { leadId };
  }

  const now = new Date().toISOString();

  try {
    console.log("👉 ensureSchema");
    await client.ensureSchema();

    console.log("👉 insert lead");
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

    console.log("✅ lead OK");

    const result = evaluation.result;

    console.log("👉 insert diagnostic");

    await client.run(
      `INSERT INTO diagnostic_results (
        id, lead_id, engine_version, lm_score, classification,
        dimensions_json, tags_json, client_state, recommended_offer,
        lead_priority, strategic_result_json, raw_answers_json,
        meta_json, created_at
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
      now
    );

    console.log("✅ diagnostic OK");

    return { leadId };

  } catch (error) {
    console.error("💥 ERRO NA PERSISTÊNCIA:", error);
    throw error;
  }
}
