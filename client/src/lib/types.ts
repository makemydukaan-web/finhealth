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
