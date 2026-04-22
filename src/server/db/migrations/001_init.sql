CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  goal TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS diagnostic_results (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  lm_score INTEGER NOT NULL,
  classification TEXT NOT NULL,
  dimensions_json TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  client_state TEXT NOT NULL,
  recommended_offer TEXT NOT NULL,
  lead_priority TEXT NOT NULL,
  strategic_result_json TEXT NOT NULL,
  raw_answers_json TEXT NOT NULL,
  meta_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_results_lead_id
ON diagnostic_results (lead_id);

CREATE INDEX IF NOT EXISTS idx_leads_email
ON leads (email);

CREATE INDEX IF NOT EXISTS idx_leads_whatsapp
ON leads (whatsapp);
