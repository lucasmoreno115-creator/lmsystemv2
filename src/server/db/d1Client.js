export function createD1Client(dbBinding) {
  if (!dbBinding || typeof dbBinding.prepare !== 'function') {
    return null;
  }

  return {
    async run(sql, ...params) {
      const statement = dbBinding.prepare(sql);
      return statement.bind(...params).run();
    }
  };
}