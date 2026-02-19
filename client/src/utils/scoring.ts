import type { PillarBreakdown, ScoreResult } from '../lib/types';
import { calculateAllocation, calculateEquityPercent } from './allocation';

// --- Numeric midpoints for answer ranges ---
const AGE_MIDPOINTS: Record<string, number> = {
  'Under 25': 22,
  '25-30': 27,
  '30-35': 32,
  '35-40': 37,
  '40-45': 42,
  '45+': 50,
};

const INCOME_MIDPOINTS: Record<string, number> = {
  'Under ₹50,000': 35_000,
  '₹50,000-1,00,000': 75_000,
  '₹1,00,000-2,00,000': 150_000,
  'Above ₹2,00,000': 250_000,
};

const EXPENSE_MIDPOINTS: Record<string, number> = {
  'Under ₹30,000': 20_000,
  '₹30,000-60,000': 45_000,
  '₹60,000-1,00,000': 80_000,
  'Above ₹1,00,000': 125_000,
};

const SAVINGS_MIDPOINTS: Record<string, number> = {
  'Under ₹5 lakhs': 250_000,
  '₹5-10 lakhs': 750_000,
  '₹10-25 lakhs': 1_750_000,
  '₹25-50 lakhs': 3_750_000,
  'Above ₹50 lakhs': 6_000_000,
};

// --- Pillar max scores ---
const PILLAR_MAX = {
  SAVINGS_RATE: 25,
  EMERGENCY_FUND: 25,
  RISK_ALIGNMENT: 20,
  DEBT_HEALTH: 15,
  INSURANCE: 15,
} as const;

// --- Individual pillar scorers ---
function scoreSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const rate = (income - expenses) / income;
  if (rate >= 0.40) return PILLAR_MAX.SAVINGS_RATE;      // 25
  if (rate >= 0.25) return 18;
  if (rate >= 0.10) return 10;
  if (rate >= 0) return 5;
  return 0; // negative savings rate
}

function scoreEmergencyFund(savings: number, expenses: number): number {
  if (expenses <= 0) return 2;
  if (savings >= 6 * expenses) return PILLAR_MAX.EMERGENCY_FUND; // 25
  if (savings >= 3 * expenses) return 15;
  if (savings >= expenses) return 8;
  return 2;
}

function scoreRiskAlignment(behavior: string): number {
  if (behavior.includes('buying opportunity')) return PILLAR_MAX.RISK_ALIGNMENT; // 20
  if (behavior.includes('nervous') || behavior.includes('hold')) return 12;
  return 5; // panic and sell
}

function scoreDebtHealth(loanType: string): number {
  if (loanType === 'No loans') return PILLAR_MAX.DEBT_HEALTH; // 15
  if (loanType === 'Home loan only') return 12;
  if (loanType === 'Car/Personal loan') return 8;
  return 4; // Multiple loans
}

function scoreInsurance(insurance: string): number {
  if (insurance === 'Both health and term') return PILLAR_MAX.INSURANCE; // 15
  if (insurance === 'Only one') return 8;
  return 0; // None
}

// --- Format money for action items ---
function formatAmount(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Crores`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} Lakhs`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

// --- Deterministic action items based on 3 weakest pillars ---
function getActionItems(
  breakdown: PillarBreakdown,
  emergencyRequired: number,
): string[] {
  const pillars = [
    { key: 'savingsRate', score: breakdown.savingsRate, max: PILLAR_MAX.SAVINGS_RATE },
    { key: 'emergencyFund', score: breakdown.emergencyFund, max: PILLAR_MAX.EMERGENCY_FUND },
    { key: 'riskAlignment', score: breakdown.riskAlignment, max: PILLAR_MAX.RISK_ALIGNMENT },
    { key: 'debtHealth', score: breakdown.debtHealth, max: PILLAR_MAX.DEBT_HEALTH },
    { key: 'insurance', score: breakdown.insurance, max: PILLAR_MAX.INSURANCE },
  ];

  const actionMap: Record<string, string> = {
    savingsRate:
      'Increase your savings rate by 10% — automate a SIP to eliminate the temptation to spend.',
    emergencyFund: `Build a ${formatAmount(emergencyRequired)} emergency buffer in a liquid fund or high-yield savings account.`,
    riskAlignment:
      'Build investing confidence — start small SIPs so market dips feel like opportunities, not threats.',
    debtHealth:
      'Clear high-interest debt (personal/car loans) aggressively before increasing investments.',
    insurance:
      'Get term life + health insurance immediately — these are your non-negotiable financial safety net.',
  };

  return pillars
    .sort((a, b) => a.score / a.max - b.score / b.max)
    .slice(0, 3)
    .map((p) => actionMap[p.key]);
}

// --- Main exported scoring function ---
export function calculateFinancialHealthScore(
  answers: Record<number, string>,
): ScoreResult {
  const age = AGE_MIDPOINTS[answers[1]] ?? 30;
  const income = INCOME_MIDPOINTS[answers[2]] ?? 75_000;
  const expenses = EXPENSE_MIDPOINTS[answers[3]] ?? 45_000;
  const savings = SAVINGS_MIDPOINTS[answers[4]] ?? 250_000;
  const loanType = answers[5] ?? 'No loans';
  const insurance = answers[6] ?? 'None';
  const behavior = answers[7] ?? 'Feel nervous but hold';

  const pillarBreakdown: PillarBreakdown = {
    savingsRate: scoreSavingsRate(income, expenses),
    emergencyFund: scoreEmergencyFund(savings, expenses),
    riskAlignment: scoreRiskAlignment(behavior),
    debtHealth: scoreDebtHealth(loanType),
    insurance: scoreInsurance(insurance),
  };

  const score =
    pillarBreakdown.savingsRate +
    pillarBreakdown.emergencyFund +
    pillarBreakdown.riskAlignment +
    pillarBreakdown.debtHealth +
    pillarBreakdown.insurance;

  const { equity, debt, gold } = calculateAllocation(age, behavior);
  const emergencyRequired = 6 * expenses;
  const actionItems = getActionItems(pillarBreakdown, emergencyRequired);

  return {
    score,
    equity,
    debt,
    gold,
    emergencyRequired,
    pillarBreakdown,
    actionItems,
  };
}

// Exported for use in results display
export { calculateEquityPercent };
