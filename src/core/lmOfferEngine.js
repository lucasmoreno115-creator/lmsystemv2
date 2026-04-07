export function recommendOffer({ leadValue, dimensions }) {
  if (leadValue === 'low' || dimensions.adherence < 50) return 'produto_digital';
  if (leadValue === 'high' && dimensions.recovery >= 60) return 'presencial';
  return 'consultoria_online';
}
