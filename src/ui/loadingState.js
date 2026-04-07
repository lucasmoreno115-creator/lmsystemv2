export function setLoading(submitButton, isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processando...' : 'Gerar Diagnóstico';
}
