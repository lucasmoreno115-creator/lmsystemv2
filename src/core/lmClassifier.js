import { invariant } from '../utils/guards.js';

export function classifyLead({ lmScore, dimensions }) {
  invariant(Number.isFinite(lmScore), 'score inválido para classificação');
  invariant(dimensions && typeof dimensions === 'object', 'dimensions inválidas para classificação');

  if (dimensions.clinical < 40) return 'Perfil de risco';
  if (lmScore < 45 || dimensions.adherence < 45) return 'Iniciante desorganizado';
  if (lmScore < 70) return 'Intermediário inconsistente';
  if (dimensions.recovery < 55) return 'Avançado com baixa recuperação';
  return 'Avançado disciplinado';
}
