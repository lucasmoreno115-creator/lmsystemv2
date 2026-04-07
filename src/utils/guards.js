export function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

export function assertNumberInRange(value, min, max, field) {
  invariant(Number.isFinite(value), `${field} must be a finite number`);
  invariant(value >= min && value <= max, `${field} must be between ${min} and ${max}`);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
