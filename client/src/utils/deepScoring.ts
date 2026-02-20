import type { DeepFormData, WealthPillarScores, WealthScoreResult } from '../lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const n = (s: string): number => parseFloat(s) || 0;

export function fmt(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Individual pillar scorers ────────────────────────────────────────────────

/** Savings Rate — max 25 */
function scoreSavingsRate(income: number, expenses: number, emi: number): number {
  if (income <= 0) return 0;
  const rate = (income - expenses - emi) / income;
  if (rate >= 0.35) return 25;
  if (rate >= 0.20) return 18;
  if (rate >= 0.10) return 10;
  return 5;
}

/** Emergency Fund — max 15 */
function scoreEmergencyFund(months: number): number {
  if (months >= 6) return 15;
  if (months >= 4) return 12;
  if (months >= 2) return 7;
  return 3;
}

/** Allocation Suitability — max 20 */
function scoreAllocationSuitability(age: number, currentEquityPct: number): number {
  const ideal = Math.min(100 - age, 75);
  const gap = Math.abs(currentEquityPct - ideal);
  if (gap <= 10) return 20;
  if (gap <= 20) return 12;
  return 5;
}

/** Protection — max 15 */
function scoreProtection(lifeCoverage: number, annualIncome: number, healthCoverage: number): number {
  const ratio = annualIncome > 0 ? lifeCoverage / annualIncome : 0;
  let score = ratio >= 10 ? 15 : ratio >= 5 ? 10 : 5;
  if (healthCoverage < 500_000) score -= 5;
  return Math.max(0, score);
}

/** Diversification — max 15 */
function scoreDiversification(
  realEstateNonPrimary: number,
  gold: number,
  equity: number,
  investableBase: number,
  age: number,
): number {
  let score = 15;
  if (investableBase > 0) {
    if ((realEstateNonPrimary / investableBase) > 0.60) score -= 5;
    if ((gold / investableBase) > 0.20) score -= 3;
    if (age < 40 && (equity / investableBase) < 0.30) score -= 5;
  }
  return Math.max(0, Math.min(15, score));
}

/** Income & Debt Stability — max 10 */
function scoreStability(jobStability: string, emiRatio: number, dependents: number): number {
  const stabilityPts: Record<string, number> = {
    'Very Stable': 5, 'Stable': 4, 'Moderate': 2, 'Uncertain': 0,
  };
  let score = stabilityPts[jobStability] ?? 2;
  score += emiRatio < 0.20 ? 3 : emiRatio < 0.35 ? 2 : emiRatio < 0.50 ? 1 : 0;
  score += dependents === 0 ? 2 : dependents <= 2 ? 1 : 0;
  return Math.min(10, score);
}

// ─── Deterministic recommendations ───────────────────────────────────────────
function getRecommendations(
  data: DeepFormData,
  pillarScores: WealthPillarScores,
  savingsRatePct: number,
  allocationGap: number,
): string[] {
  const income = n(data.monthlyIncome);
  const emi = n(data.emiAmount);
  const emergencyMonths = n(data.emergencyFundMonths);

  interface Candidate { score: number; msg: string }
  const candidates: Candidate[] = [
    {
      score: pillarScores.savingsRate,
      msg: savingsRatePct < 0.15
        ? 'Improve savings discipline — automate a SIP to reach a 20%+ savings rate consistently.'
        : 'Fine-tune your savings rate — even a 5% increase compounded over 10 years creates significant wealth.',
    },
    {
      score: pillarScores.emergencyFund,
      msg: emergencyMonths < 3
        ? 'Build an emergency reserve immediately — target 6 months of expenses in a liquid fund.'
        : 'Strengthen your emergency buffer to 6 full months before increasing investment exposure.',
    },
    {
      score: pillarScores.allocationSuitability,
      msg: allocationGap < -10
        ? 'Increase equity exposure gradually — your allocation is below ideal for your age and horizon.'
        : allocationGap > 10
          ? 'Rebalance toward debt or gold — your equity concentration is above your ideal range.'
          : 'Maintain annual portfolio rebalancing to stay within your target allocation band.',
    },
    {
      score: pillarScores.protection,
      msg: 'Close your protection gap — secure term life cover at 10× income and health insurance above ₹10 Lakhs.',
    },
    {
      score: pillarScores.diversification,
      msg: income > 0 && (emi / income) > 0.40
        ? 'High EMI burden detected — prioritise prepaying high-interest debt to free up monthly cash flow.'
        : 'Reduce asset concentration — spread investments across equity, debt, and gold for resilience.',
    },
    {
      score: pillarScores.stability,
      msg: 'Build income stability — develop a secondary income stream or upskill to reduce career risk.',
    },
  ];

  return candidates
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((c) => c.msg);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function calculateWealthScore(data: DeepFormData): WealthScoreResult {
  const age = n(data.age);
  const monthlyIncome = n(data.monthlyIncome) + (data.hasSecondaryIncome ? n(data.secondaryIncome) : 0);
  const annualIncome = monthlyIncome * 12;
  const monthlyExpenses = n(data.monthlyExpenses);
  const emi = n(data.emiAmount);

  // Assets
  const equity = n(data.equityAssets);
  const fixedIncome = n(data.fixedIncome);
  const epfPpfNps = n(data.epfPpfNps);
  const gold = n(data.goldAssets);
  const realEstateTotal = n(data.realEstateTotal);
  const primaryResidence = n(data.primaryResidenceValue);
  const cash = n(data.cashAssets);
  const realEstateNonPrimary = Math.max(0, realEstateTotal - primaryResidence);

  // Net worth includes all assets including primary residence
  const netWorth = equity + fixedIncome + epfPpfNps + gold + realEstateTotal + cash;

  // Investable base excludes primary residence (for allocation suitability)
  const investableBase = equity + fixedIncome + epfPpfNps + gold + realEstateNonPrimary + cash;

  const currentEquityPct = investableBase > 0 ? (equity / investableBase) * 100 : 0;
  const idealEquityPct = Math.min(100 - age, 75);
  const allocationGap = currentEquityPct - idealEquityPct; // + = over, - = under

  const savingsRatePct = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses - emi) / monthlyIncome : 0;
  const emiRatio = monthlyIncome > 0 ? emi / monthlyIncome : 0;

  const lifeCoverage = n(data.lifeCoverageAmount);
  const healthCoverage = n(data.healthCoverageAmount);
  const lifeCoverRatio = annualIncome > 0 ? lifeCoverage / annualIncome : 0;
  const hasProtectionGap = lifeCoverRatio < 10 || healthCoverage < 500_000;

  const pillarScores: WealthPillarScores = {
    savingsRate: scoreSavingsRate(monthlyIncome, monthlyExpenses, emi),
    emergencyFund: scoreEmergencyFund(n(data.emergencyFundMonths)),
    allocationSuitability: scoreAllocationSuitability(age, currentEquityPct),
    protection: scoreProtection(lifeCoverage, annualIncome, healthCoverage),
    diversification: scoreDiversification(realEstateNonPrimary, gold, equity, investableBase, age),
    stability: scoreStability(data.jobStability, emiRatio, n(data.dependentsCount)),
  };

  const totalScore = Math.round(
    pillarScores.savingsRate +
    pillarScores.emergencyFund +
    pillarScores.allocationSuitability +
    pillarScores.protection +
    pillarScores.diversification +
    pillarScores.stability,
  );

  return {
    totalScore,
    savingsRatePct,
    netWorth,
    currentEquityPct,
    idealEquityPct,
    allocationGap,
    hasProtectionGap,
    lifeCoverRatio,
    pillarScores,
    recommendations: getRecommendations(data, pillarScores, savingsRatePct, allocationGap),
  };
}
