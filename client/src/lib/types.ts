export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface QuizState {
  currentStep: number; // 0 = landing, 1-7 = questions, 8 = loading, 9 = results
  answers: Record<number, string>;
}

export interface AssetAllocation {
  equity: number;
  debt: number;
  gold: number;
}

export interface AssessmentResult {
  allocation: AssetAllocation;
  emergency_fund: number;
  health_score: number;
  action_items: string[];
  reasoning: string;
}
