CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  goal TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS diagnostic_results (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  engine_version TEXT,
  lm_score INTEGER,
  classification TEXT,
  result_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);