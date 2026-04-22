export function createD1Client(dbBinding) {
  if (!dbBinding || typeof dbBinding.prepare !== 'function') {
    return null;
  }

  return {
    async ensureSchema() {
      if (typeof dbBinding.exec !== 'function') return;

      await dbBinding.exec(`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          whatsapp TEXT NOT NULL,
          goal TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      await dbBinding.exec(`
        CREATE TABLE IF NOT EXISTS diagnostic_results (
          id TEXT PRIMARY KEY,
          lead_id TEXT NOT NULL,
          engine_version TEXT NOT NULL,
          lm_score INTEGER NOT NULL,
          classification TEXT NOT NULL,
          result_json TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    },
    async run(sql, ...params) {
      const statement = dbBinding.prepare(sql);
      return statement.bind(...params).run();
    }
  };
}
