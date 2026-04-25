const API_URL = "https://lm-system-api.lucasmoreno115.workers.dev";

export async function evaluateDiagnosticRemote(payload) {
  try {
    const response = await fetch(`${API_URL}/api/diagnostic/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Erro na API");
    }

    return data;

  } catch (error) {
    console.error("REMOTE ERROR:", error);
    throw new Error("Não foi possível processar seu diagnóstico agora.");
  }
}
