PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  goal TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON leads (whatsapp);

CREATE TABLE IF NOT EXISTS diagnostic_results (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  lm_score INTEGER NOT NULL,
  classification TEXT NOT NULL,
  dimensions_json TEXT NOT NULL,
  weights_json TEXT,
  tags_json TEXT,
  client_state TEXT,
  recommended_offer TEXT,
  lead_priority TEXT,
  strategic_result_json TEXT,
  raw_answers_json TEXT,
  meta_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_diag_created_at ON diagnostic_results (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diag_score ON diagnostic_results (lm_score DESC);
CREATE INDEX IF NOT EXISTS idx_diag_classification ON diagnostic_results (classification);
CREATE INDEX IF NOT EXISTS idx_diag_lead ON diagnostic_results (lead_id);

CREATE VIEW IF NOT EXISTS vw_leads_latest AS
SELECT
  l.id AS lead_id,
  l.name,
  l.email,
  l.whatsapp,
  l.goal,
  d.lm_score,
  d.classification,
  d.recommended_offer,
  d.lead_priority,
  d.created_at
FROM leads l
JOIN diagnostic_results d ON d.lead_id = l.id
WHERE d.created_at = (
  SELECT MAX(created_at)
  FROM diagnostic_results
  WHERE lead_id = l.id
);
