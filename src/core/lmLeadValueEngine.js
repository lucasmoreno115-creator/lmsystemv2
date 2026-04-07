export function evaluateLeadValue({ dimensions }) {
  if (dimensions.adherence >= 70 && dimensions.behavior >= 70 && dimensions.clinical >= 70) return 'high';
  if (dimensions.adherence < 45 || dimensions.behavior < 45) return 'low';
  return 'medium';
}
