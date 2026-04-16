export const COACH_STORAGE_KEYS = {
  lastResult: 'LM_LAST_RESULT',
  lastInput: 'LM_LAST_INPUT',
  lastTimestamp: 'LM_LAST_TS',
  selectedPlan: 'LM_SELECTED_PLAN'
};

function safeStorage(storage = globalThis?.localStorage) {
  return storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function'
    ? storage
    : null;
}

export function saveCoachSnapshot({ result, input, selectedPlan, storage = globalThis?.localStorage, timestamp = Date.now() }) {
  const safe = safeStorage(storage);
  if (!safe) return;

  if (result) safe.setItem(COACH_STORAGE_KEYS.lastResult, JSON.stringify(result));
  if (input) safe.setItem(COACH_STORAGE_KEYS.lastInput, JSON.stringify(input));
  if (selectedPlan) safe.setItem(COACH_STORAGE_KEYS.selectedPlan, String(selectedPlan));
  safe.setItem(COACH_STORAGE_KEYS.lastTimestamp, String(timestamp));
}

export function saveSelectedPlan(plan, storage = globalThis?.localStorage) {
  const safe = safeStorage(storage);
  if (!safe || !plan) return;

  safe.setItem(COACH_STORAGE_KEYS.selectedPlan, String(plan));
}

export function loadCoachSnapshot(storage = globalThis?.localStorage) {
  const safe = safeStorage(storage);
  if (!safe) return null;

  return {
    rawResult: safe.getItem(COACH_STORAGE_KEYS.lastResult),
    rawInput: safe.getItem(COACH_STORAGE_KEYS.lastInput),
    rawTimestamp: safe.getItem(COACH_STORAGE_KEYS.lastTimestamp),
    selectedPlan: safe.getItem(COACH_STORAGE_KEYS.selectedPlan)
  };
}
