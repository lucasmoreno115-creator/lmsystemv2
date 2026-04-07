export function mapErrorToMessage(error) {
  if (error instanceof Error) return error.message;
  return 'Erro inesperado. Tente novamente.';
}
