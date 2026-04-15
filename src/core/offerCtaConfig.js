export const OFFER_CTA_HREF = {
  produto_digital: './planos.html#produto-digital',
  consultoria_online: './planos.html#consultoria-online',
  presencial: './planos.html#presencial'
};

export function resolveOfferHref(recommendedOffer) {
  return OFFER_CTA_HREF[recommendedOffer] || './planos.html';
}
