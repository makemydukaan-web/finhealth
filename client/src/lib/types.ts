export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface QuizState {
  // 0 = landing, 1–8 = questions, 9 = loading, 10 = results
  currentStep: number;
  answers: Record<number, string>;
}

export interface PillarBreakdown {
  savingsRate: number;      // max 25
  emergencyFund: number;    // max 25
  riskAlignment: number;    // max 20
  debtHealth: number;       // max 15
  insurance: number;        // max 15
}

export interface ScoreResult {
  score: number;
  equity: number;
  debt: number;
  gold: number;
  emergencyRequired: number;
  pillarBreakdown: PillarBreakdown;
  actionItems: string[];
}

export interface LeadData {
  name: string;
  email: string;
  phone?: string;
  score: number;
  equity_percent: number;
  debt_percent: number;
  gold_percent: number;
  emergency_required: number;
  interested: boolean;
}

// ─── Ignite Dashboard Types ─────────────────────────────────────────────────

export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';
export type JobStability = 'Very Stable' | 'Stable' | 'Moderate' | 'Uncertain';
export type HousingStatus = 'Own' | 'Rent';

// Stage 1 Quiz Answers (from existing quiz)
export interface Stage1Answers {
  age: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  totalSavings: string;
  loans: string;
  insurance: string;
  marketBehavior: string;
  primaryGoal: string;
}

// Stage 2 Detailed Questionnaire Data
export interface Stage2Data {
  // Screen 1: Income Details
  exactMonthlyIncome: number;
  hasSecondaryIncome: boolean;
  secondaryIncomeAmount: number;
  jobStability: JobStability;
  dependentsCount: number;
  
  // Screen 2: Assets Snapshot
  equityMF: number; // Mutual funds, stocks, ETFs
  fixedIncome: number; // FDs, Bonds
  epfPpfNps: number; // Retirement accounts
  goldAssets: number; // Physical + digital gold
  realEstate: number; // Total real estate value
  primaryResidenceValue: number; // Of the above, primary home value
  cashSavings: number; // Bank balance, liquid funds
  hasRSU: boolean; // Has RSU/ESOP
  rsuValue: number;
  
  // Screen 3: Liabilities
  homeLoanOutstanding: number;
  homeLoanEMI: number;
  carLoanOutstanding: number;
  carLoanEMI: number;
  personalLoanOutstanding: number;
  personalLoanEMI: number;
  creditCardDebt: number;
  otherEMIs: number;
  
  // Screen 4: Protection
  termLifeCover: number;
  healthCover: number;
  emergencyFundMonths: number;
  
  // Screen 5: Future Goals
  retirementAge: number;
  desiredRetirementCorpus: number;
  riskProfile: RiskProfile;
  topGoals: string[]; // up to 3
}

export const STAGE2_DEFAULTS: Stage2Data = {
  exactMonthlyIncome: 0,
  hasSecondaryIncome: false,
  secondaryIncomeAmount: 0,
  jobStability: 'Stable',
  dependentsCount: 0,
  
  equityMF: 0,
  fixedIncome: 0,
  epfPpfNps: 0,
  goldAssets: 0,
  realEstate: 0,
  primaryResidenceValue: 0,
  cashSavings: 0,
  hasRSU: false,
  rsuValue: 0,
  
  homeLoanOutstanding: 0,
  homeLoanEMI: 0,
  carLoanOutstanding: 0,
  carLoanEMI: 0,
  personalLoanOutstanding: 0,
  personalLoanEMI: 0,
  creditCardDebt: 0,
  otherEMIs: 0,
  
  termLifeCover: 0,
  healthCover: 0,
  emergencyFundMonths: 0,
  
  retirementAge: 60,
  desiredRetirementCorpus: 0,
  riskProfile: 'Moderate',
  topGoals: [],
};

// Combined data from both stages
export interface IgniteUserData {
  stage1: Stage1Answers;
  stage2: Stage2Data;
}

// Calculated metrics for Ignite Dashboard
export interface IgniteMetrics {
  // Core scores
  wealthScore: number; // 0-100
  
  // Net worth breakdown
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidNetWorth: number; // Excluding real estate
  
  // Income & savings
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  totalEMIs: number;
  monthlySurplus: number;
  savingsRate: number; // as decimal 0.25 = 25%
  
  // Retirement projections
  currentAge: number;
  retirementAge: number;
  yearsToRetirement: number;
  projectedCorpusAtRetirement: number;
  requiredCorpusAtRetirement: number;
  retirementGap: number;
  retirementReadinessPercent: number;
  
  // Asset allocation
  currentEquityPercent: number;
  idealEquityPercent: number;
  equityAlignmentGap: number; // positive = over, negative = under
  realEstateConcentration: number;
  
  // Protection analysis
  idealLifeCover: number; // 10-15x annual income
  currentLifeCover: number;
  lifeCoverGap: number;
  idealHealthCover: number;
  currentHealthCover: number;
  healthCoverGap: number;
  emergencyMonths: number;
  idealEmergencyMonths: number;
  
  // Risk profile
  riskProfile: RiskProfile;
  
  // Special flags
  hasPersonalLoan: boolean;
  hasRSU: boolean;
  highRealEstateConcentration: boolean;
}

// Peer benchmark data
export interface PeerBenchmark {
  metric: string;
  userValue: number;
  peerAverage: number;
  peerTop20: number;
  percentile: number;
}

// Scenario simulation result
export interface ScenarioResult {
  label: string;
  currentPath: number;
  optimizedPath: number;
  difference: number;
  percentImprovement: number;
}

// Detailed leads for Supabase
export interface DetailedLeadData {
  name: string;
  email: string;
  phone?: string;
  wealth_score: number;
  net_worth: number;
  liquid_net_worth: number;
  retirement_gap: number;
  savings_rate: number;
  life_cover_gap: number;
  health_cover_gap: number;
  equity_alignment: number;
  emergency_months: number;
  primary_goal: string;
  risk_profile: string;
  investable_bracket: string;
  income_bracket: string;
  has_rsu: boolean;
  has_personal_loan: boolean;
  real_estate_concentration: number;
  simulator_interacted: boolean;
  scenario_cards_used: number;
  interested_1to1: boolean;
}

// Behavioral tracking state
export interface BehavioralState {
  simulatorInteracted: boolean;
  scenarioCardsUsed: string[];
  timeOnSalarySimulator: number;
  tabsVisited: string[];
}
