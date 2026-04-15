const DEFAULT_DIMENSIONS = {
  clinical: 0,
  adherence: 0,
  behavior: 0
};

function toSafeNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

export function resolveClientState({ lmScore = 0, dimensions = {} } = {}) {
  const safeDimensions = {
    clinical: toSafeNumber(dimensions.clinical ?? DEFAULT_DIMENSIONS.clinical),
    adherence: toSafeNumber(dimensions.adherence ?? DEFAULT_DIMENSIONS.adherence),
    behavior: toSafeNumber(dimensions.behavior ?? DEFAULT_DIMENSIONS.behavior)
  };

  if (safeDimensions.clinical < 40) return 'HIGH_RISK';
  if (safeDimensions.adherence < 40 && safeDimensions.behavior < 50) return 'LOW_ADHERENCE';
  if (safeDimensions.behavior < 50) return 'INCONSISTENT';
  if (lmScore >= 70 && safeDimensions.adherence >= 70) return 'HIGH_PERFORMER';
  if (lmScore >= 50 && safeDimensions.adherence >= 50) return 'PLATEAU';

  return 'BEGINNER_LOST';
}
