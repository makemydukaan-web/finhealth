const EQUITY_MIN = 35;
const EQUITY_MAX = 75;
const GOLD_FIXED = 10;
const PANIC_ADJUSTMENT = -15;
const OPPORTUNITY_ADJUSTMENT = 10;

export function calculateEquityPercent(age: number, behavior: string): number {
  let equity = 100 - age;
  if (behavior.includes('Panic')) {
    equity += PANIC_ADJUSTMENT;
  } else if (behavior.includes('buying opportunity')) {
    equity += OPPORTUNITY_ADJUSTMENT;
  }
  return Math.min(EQUITY_MAX, Math.max(EQUITY_MIN, equity));
}

export function calculateAllocation(age: number, behavior: string) {
  const equity = calculateEquityPercent(age, behavior);
  const gold = GOLD_FIXED;
  const debt = 100 - equity - gold;
  return { equity, debt, gold };
}
