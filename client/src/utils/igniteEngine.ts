/**
 * Ignite Dashboard Calculation Engine
 * Deterministic scoring and projection calculations
 */

import type { 
  Stage1Answers, 
  Stage2Data, 
  IgniteMetrics, 
  IgniteUserData,
  RiskProfile 
} from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const AGE_MIDPOINTS: Record<string, number> = {
  'Under 25': 23,
  '25-30': 27,
  '30-35': 32,
  '35-40': 37,
  '40-45': 42,
  '45+': 50,
};

const INCOME_MIDPOINTS: Record<string, number> = {
  'Under ₹50,000': 40000,
  '₹50,000-1,00,000': 75000,
  '₹1,00,000-2,00,000': 150000,
  'Above ₹2,00,000': 300000,
};

const EXPENSE_MIDPOINTS: Record<string, number> = {
  'Under ₹30,000': 25000,
  '₹30,000-60,000': 45000,
  '₹60,000-1,00,000': 80000,
  'Above ₹1,00,000': 130000,
};

const SAVINGS_MIDPOINTS: Record<string, number> = {
  'Under ₹5 lakhs': 300000,
  '₹5-10 lakhs': 750000,
  '₹10-25 lakhs': 1750000,
  '₹25-50 lakhs': 3750000,
  'Above ₹50 lakhs': 7500000,
};

// Growth assumptions
const EQUITY_RETURN = 0.12; // 12% annual
const DEBT_RETURN = 0.07; // 7% annual
const INFLATION = 0.06; // 6% annual
const RETIREMENT_WITHDRAWAL_RATE = 0.04; // 4% safe withdrawal rate

// ─── Utility Functions ────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Ideal Allocation Calculator ──────────────────────────────────────────────

export function calculateIdealEquityPercent(age: number, riskProfile: RiskProfile): number {
  // Base: 100 - age
  let baseEquity = 100 - age;
  
  // Adjust for risk profile
  if (riskProfile === 'Conservative') {
    baseEquity -= 10;
  } else if (riskProfile === 'Aggressive') {
    baseEquity += 10;
  }
  
  return clamp(baseEquity, 30, 80);
}

// ─── Retirement Projections ───────────────────────────────────────────────────

export function calculateRetirementCorpus(
  currentSavings: number,
  monthlySIP: number,
  yearsToRetirement: number,
  equityPercent: number
): number {
  const equityAlloc = equityPercent / 100;
  const blendedReturn = equityAlloc * EQUITY_RETURN + (1 - equityAlloc) * DEBT_RETURN;
  
  // Future value of current savings
  const fvCurrentSavings = currentSavings * Math.pow(1 + blendedReturn, yearsToRetirement);
  
  // Future value of monthly SIP
  const monthlyRate = blendedReturn / 12;
  const months = yearsToRetirement * 12;
  const fvSIP = monthlySIP * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  
  return fvCurrentSavings + fvSIP;
}

export function calculateRequiredCorpus(
  currentMonthlyExpenses: number,
  currentAge: number,
  retirementAge: number
): number {
  const yearsToRetirement = retirementAge - currentAge;
  
  // Inflate current expenses to retirement
  const expensesAtRetirement = currentMonthlyExpenses * 12 * Math.pow(1 + INFLATION, yearsToRetirement);
  
  // Required corpus using 4% withdrawal rule
  return expensesAtRetirement / RETIREMENT_WITHDRAWAL_RATE;
}

// ─── Salary Increment Simulator ───────────────────────────────────────────────

export interface SalarySimulationResult {
  year: number;
  age: number;
  salary: number;
  savings: number;
  corpus: number;
}

export function simulateSalaryIncrements(
  currentAge: number,
  currentSalary: number,
  currentCorpus: number,
  savingsRate: number,
  annualIncrement: number, // as decimal (0.08 = 8%)
  equityPercent: number,
  targetAge: number = 60
): SalarySimulationResult[] {
  const results: SalarySimulationResult[] = [];
  const blendedReturn = (equityPercent / 100) * EQUITY_RETURN + (1 - equityPercent / 100) * DEBT_RETURN;
  
  let salary = currentSalary * 12; // Annual
  let corpus = currentCorpus;
  
  for (let age = currentAge; age <= targetAge; age++) {
    const annualSavings = salary * savingsRate;
    
    results.push({
      year: age - currentAge,
      age,
      salary,
      savings: annualSavings,
      corpus: Math.round(corpus),
    });
    
    // Apply growth for next year
    corpus = (corpus + annualSavings) * (1 + blendedReturn);
    salary = salary * (1 + annualIncrement);
  }
  
  return results;
}

// ─── Main Metrics Calculator ──────────────────────────────────────────────────

export function calculateIgniteMetrics(data: IgniteUserData): IgniteMetrics {
  const { stage1, stage2 } = data;
  
  // Extract basic info from Stage 1
  const currentAge = AGE_MIDPOINTS[stage1.age] ?? 30;
  const estimatedIncome = INCOME_MIDPOINTS[stage1.monthlyIncome] ?? 75000;
  const estimatedExpenses = EXPENSE_MIDPOINTS[stage1.monthlyExpenses] ?? 45000;
  const estimatedSavings = SAVINGS_MIDPOINTS[stage1.totalSavings] ?? 500000;
  
  // Use Stage 2 data if available, otherwise use estimates
  const monthlyIncome = stage2.exactMonthlyIncome || estimatedIncome;
  const secondaryIncome = stage2.hasSecondaryIncome ? stage2.secondaryIncomeAmount : 0;
  const totalMonthlyIncome = monthlyIncome + secondaryIncome;
  
  // Calculate total assets
  const totalAssets = stage2.equityMF + stage2.fixedIncome + stage2.epfPpfNps + 
    stage2.goldAssets + stage2.realEstate + stage2.cashSavings + 
    (stage2.hasRSU ? stage2.rsuValue : 0);
  
  // Use estimated savings if Stage 2 data is empty
  const effectiveAssets = totalAssets > 0 ? totalAssets : estimatedSavings;
  
  // Calculate liquid assets (excluding real estate)
  const liquidAssets = stage2.equityMF + stage2.fixedIncome + stage2.epfPpfNps + 
    stage2.goldAssets + stage2.cashSavings + (stage2.hasRSU ? stage2.rsuValue : 0);
  
  // Calculate total liabilities
  const totalLiabilities = stage2.homeLoanOutstanding + stage2.carLoanOutstanding + 
    stage2.personalLoanOutstanding + stage2.creditCardDebt;
  
  // Net worth calculations
  const netWorth = effectiveAssets - totalLiabilities;
  const liquidNetWorth = (totalAssets > 0 ? liquidAssets : estimatedSavings) - totalLiabilities;
  
  // Calculate EMIs and expenses
  const totalEMIs = stage2.homeLoanEMI + stage2.carLoanEMI + stage2.personalLoanEMI + stage2.otherEMIs;
  const totalMonthlyExpenses = estimatedExpenses + totalEMIs;
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? monthlySurplus / totalMonthlyIncome : 0;
  
  // Retirement projections
  const retirementAge = stage2.retirementAge || 60;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const idealEquityPercent = calculateIdealEquityPercent(currentAge, stage2.riskProfile || 'Moderate');
  
  const projectedCorpus = calculateRetirementCorpus(
    effectiveAssets,
    Math.max(0, monthlySurplus),
    yearsToRetirement,
    idealEquityPercent
  );
  
  const requiredCorpus = calculateRequiredCorpus(
    totalMonthlyExpenses,
    currentAge,
    retirementAge
  );
  
  const retirementGap = requiredCorpus - projectedCorpus;
  const retirementReadinessPercent = requiredCorpus > 0 
    ? Math.min(100, (projectedCorpus / requiredCorpus) * 100) 
    : 0;
  
  // Asset allocation analysis
  const equityAssets = stage2.equityMF + (stage2.hasRSU ? stage2.rsuValue : 0);
  const currentEquityPercent = effectiveAssets > 0 
    ? (equityAssets / effectiveAssets) * 100 
    : 0;
  const equityAlignmentGap = currentEquityPercent - idealEquityPercent;
  
  // Real estate concentration
  const realEstateConcentration = effectiveAssets > 0 
    ? (stage2.realEstate / effectiveAssets) * 100 
    : 0;
  
  // Protection analysis
  const annualIncome = totalMonthlyIncome * 12;
  const idealLifeCover = annualIncome * 12; // 12x annual income
  const currentLifeCover = stage2.termLifeCover;
  const lifeCoverGap = Math.max(0, idealLifeCover - currentLifeCover);
  
  const idealHealthCover = 1500000; // 15 lakhs recommended
  const currentHealthCover = stage2.healthCover;
  const healthCoverGap = Math.max(0, idealHealthCover - currentHealthCover);
  
  const emergencyMonths = stage2.emergencyFundMonths || 
    (stage2.cashSavings > 0 ? Math.floor(stage2.cashSavings / totalMonthlyExpenses) : 0);
  const idealEmergencyMonths = 6;
  
  // Calculate Wealth Score (0-100)
  const wealthScore = calculateWealthScore({
    savingsRate,
    emergencyMonths,
    idealEmergencyMonths,
    currentEquityPercent,
    idealEquityPercent,
    lifeCoverGap,
    healthCoverGap,
    realEstateConcentration,
    retirementReadinessPercent,
  });
  
  return {
    wealthScore,
    totalAssets: effectiveAssets,
    totalLiabilities,
    netWorth,
    liquidNetWorth,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    totalEMIs,
    monthlySurplus,
    savingsRate,
    currentAge,
    retirementAge,
    yearsToRetirement,
    projectedCorpusAtRetirement: projectedCorpus,
    requiredCorpusAtRetirement: requiredCorpus,
    retirementGap,
    retirementReadinessPercent,
    currentEquityPercent,
    idealEquityPercent,
    equityAlignmentGap,
    realEstateConcentration,
    idealLifeCover,
    currentLifeCover,
    lifeCoverGap,
    idealHealthCover,
    currentHealthCover,
    healthCoverGap,
    emergencyMonths,
    idealEmergencyMonths,
    riskProfile: stage2.riskProfile || 'Moderate',
    hasPersonalLoan: stage2.personalLoanOutstanding > 0,
    hasRSU: stage2.hasRSU,
    highRealEstateConcentration: realEstateConcentration > 50,
  };
}

// ─── Wealth Score Calculator ──────────────────────────────────────────────────

interface WealthScoreInputs {
  savingsRate: number;
  emergencyMonths: number;
  idealEmergencyMonths: number;
  currentEquityPercent: number;
  idealEquityPercent: number;
  lifeCoverGap: number;
  healthCoverGap: number;
  realEstateConcentration: number;
  retirementReadinessPercent: number;
}

function calculateWealthScore(inputs: WealthScoreInputs): number {
  let score = 0;
  
  // Savings Rate (max 25 points)
  if (inputs.savingsRate >= 0.4) score += 25;
  else if (inputs.savingsRate >= 0.3) score += 22;
  else if (inputs.savingsRate >= 0.2) score += 18;
  else if (inputs.savingsRate >= 0.1) score += 12;
  else if (inputs.savingsRate >= 0.05) score += 8;
  else if (inputs.savingsRate > 0) score += 4;
  
  // Emergency Fund (max 15 points)
  const emergencyRatio = inputs.emergencyMonths / inputs.idealEmergencyMonths;
  if (emergencyRatio >= 1) score += 15;
  else if (emergencyRatio >= 0.75) score += 12;
  else if (emergencyRatio >= 0.5) score += 8;
  else if (emergencyRatio >= 0.25) score += 4;
  else score += 2;
  
  // Asset Allocation (max 20 points)
  const allocationGap = Math.abs(inputs.currentEquityPercent - inputs.idealEquityPercent);
  if (allocationGap <= 5) score += 20;
  else if (allocationGap <= 10) score += 16;
  else if (allocationGap <= 20) score += 12;
  else if (allocationGap <= 30) score += 8;
  else score += 4;
  
  // Life Insurance (max 12 points)
  if (inputs.lifeCoverGap <= 0) score += 12;
  else if (inputs.lifeCoverGap <= 2000000) score += 9;
  else if (inputs.lifeCoverGap <= 5000000) score += 6;
  else score += 2;
  
  // Health Insurance (max 8 points)
  if (inputs.healthCoverGap <= 0) score += 8;
  else if (inputs.healthCoverGap <= 500000) score += 6;
  else score += 2;
  
  // Diversification / Real Estate concentration (max 10 points)
  if (inputs.realEstateConcentration <= 30) score += 10;
  else if (inputs.realEstateConcentration <= 50) score += 7;
  else if (inputs.realEstateConcentration <= 70) score += 4;
  else score += 2;
  
  // Retirement Readiness (max 10 points)
  if (inputs.retirementReadinessPercent >= 100) score += 10;
  else if (inputs.retirementReadinessPercent >= 80) score += 8;
  else if (inputs.retirementReadinessPercent >= 60) score += 6;
  else if (inputs.retirementReadinessPercent >= 40) score += 4;
  else score += 2;
  
  return Math.round(clamp(score, 0, 100));
}

// ─── Teaser Score (Estimated from Stage 1 only) ───────────────────────────────

export function calculateTeaserScore(stage1: Stage1Answers): {
  estimatedScore: number;
  estimatedNetWorth: number;
  savingsRate: number;
  retirementReadiness: number;
} {
  const income = INCOME_MIDPOINTS[stage1.monthlyIncome] ?? 75000;
  const expenses = EXPENSE_MIDPOINTS[stage1.monthlyExpenses] ?? 45000;
  const savings = SAVINGS_MIDPOINTS[stage1.totalSavings] ?? 500000;
  const age = AGE_MIDPOINTS[stage1.age] ?? 30;
  
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  
  // Simplified retirement readiness estimate
  const yearsToRetirement = 60 - age;
  const projectedCorpus = savings * Math.pow(1.10, yearsToRetirement);
  const requiredCorpus = expenses * 12 * 25; // Simple 25x rule
  const retirementReadiness = Math.min(100, (projectedCorpus / requiredCorpus) * 100);
  
  // Simplified score
  let score = 0;
  score += savingsRate >= 0.3 ? 30 : savingsRate >= 0.2 ? 22 : savingsRate >= 0.1 ? 14 : 6;
  score += savings >= 2500000 ? 25 : savings >= 1000000 ? 18 : savings >= 500000 ? 12 : 6;
  score += retirementReadiness >= 60 ? 20 : retirementReadiness >= 40 ? 14 : retirementReadiness >= 20 ? 8 : 4;
  
  // Insurance and behavior based adjustments
  if (stage1.insurance === 'Both health and term') score += 15;
  else if (stage1.insurance === 'Only one') score += 8;
  
  if (stage1.marketBehavior === 'See it as buying opportunity') score += 10;
  else if (stage1.marketBehavior === 'Feel nervous but hold') score += 6;
  
  return {
    estimatedScore: Math.round(clamp(score, 0, 100)),
    estimatedNetWorth: savings,
    savingsRate,
    retirementReadiness,
  };
}

// ─── Get Income/Investable Bracket Labels ─────────────────────────────────────

export function getIncomeBracket(monthlyIncome: number): string {
  if (monthlyIncome < 50000) return 'Below 50K';
  if (monthlyIncome < 100000) return '50K-1L';
  if (monthlyIncome < 200000) return '1L-2L';
  if (monthlyIncome < 500000) return '2L-5L';
  return '5L+';
}

export function getInvestableBracket(liquidNetWorth: number): string {
  if (liquidNetWorth < 500000) return 'Below 5L';
  if (liquidNetWorth < 1000000) return '5L-10L';
  if (liquidNetWorth < 2500000) return '10L-25L';
  if (liquidNetWorth < 5000000) return '25L-50L';
  if (liquidNetWorth < 10000000) return '50L-1Cr';
  return '1Cr+';
}
