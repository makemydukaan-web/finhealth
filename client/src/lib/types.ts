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

// ─── Phase 2: Deep Wealth Diagnostic ─────────────────────────────────────────

export type JobStability = 'Very Stable' | 'Stable' | 'Moderate' | 'Uncertain';
export type HousingStatus = 'Own' | 'Rent';
export type RiskComfort = 'Conservative' | 'Moderate' | 'Aggressive';

export interface DeepFormData {
  // Step 1: Income & Stability
  age: string;
  monthlyIncome: string;
  hasSecondaryIncome: boolean;
  secondaryIncome: string;
  jobStability: JobStability | '';
  dependentsCount: string;

  // Step 2: Expenses & EMIs
  monthlyExpenses: string;
  emiAmount: string;
  housingStatus: HousingStatus | '';

  // Step 3: Assets Snapshot
  equityAssets: string;
  fixedIncome: string;
  epfPpfNps: string;
  goldAssets: string;
  realEstateTotal: string;
  primaryResidenceValue: string;
  cashAssets: string;

  // Step 4: Protection
  lifeCoverageAmount: string;
  healthCoverageAmount: string;
  emergencyFundMonths: string;

  // Step 5: Goals
  retirementAge: string;
  primaryGoal: string;
  riskComfort: RiskComfort | '';
}

export const DEEP_FORM_DEFAULTS: DeepFormData = {
  age: '', monthlyIncome: '', hasSecondaryIncome: false, secondaryIncome: '',
  jobStability: '', dependentsCount: '',
  monthlyExpenses: '', emiAmount: '0', housingStatus: '',
  equityAssets: '', fixedIncome: '', epfPpfNps: '', goldAssets: '',
  realEstateTotal: '', primaryResidenceValue: '0', cashAssets: '',
  lifeCoverageAmount: '', healthCoverageAmount: '', emergencyFundMonths: '',
  retirementAge: '', primaryGoal: '', riskComfort: '',
};

export interface WealthPillarScores {
  savingsRate: number;           // max 25
  emergencyFund: number;         // max 15
  allocationSuitability: number; // max 20
  protection: number;            // max 15
  diversification: number;       // max 15
  stability: number;             // max 10
}

export interface WealthScoreResult {
  totalScore: number;
  savingsRatePct: number;
  netWorth: number;
  currentEquityPct: number;
  idealEquityPct: number;
  allocationGap: number;
  hasProtectionGap: boolean;
  lifeCoverRatio: number;
  pillarScores: WealthPillarScores;
  recommendations: string[];
}

export interface DeepLeadData {
  name: string;
  email: string;
  phone?: string;
  wealth_score: number;
  savings_rate: number;
  net_worth: number;
  allocation_gap: number;
}
