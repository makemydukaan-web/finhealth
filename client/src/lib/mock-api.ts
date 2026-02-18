import { AssessmentResult } from "./types";

// Mocking the Claude API response
export const generateAssessment = async (answers: Record<number, string>): Promise<AssessmentResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const age = answers[1];
  const risk = answers[6]; // Market drop reaction
  
  // Basic logic to vary the mock response based on inputs
  let equity = 60;
  let debt = 30;
  let gold = 10;

  // Younger + Aggressive = More Equity
  if ((age === "Under 25" || age === "25-30") && risk.includes("buying opportunity")) {
    equity = 80;
    debt = 15;
    gold = 5;
  } else if (risk.includes("Panic")) {
    equity = 40;
    debt = 50;
    gold = 10;
  }

  // Calculate emergency fund based on expenses (approximate midpoint of range * 6)
  const expenses = answers[7];
  let monthlyExp = 30000;
  if (expenses.includes("30,000-60,000")) monthlyExp = 45000;
  if (expenses.includes("60,000-1,00,000")) monthlyExp = 80000;
  if (expenses.includes("Above")) monthlyExp = 120000;
  
  const emergencyFund = monthlyExp * 6;

  // Generate Score
  const score = Math.floor(Math.random() * (85 - 60 + 1) + 60); // Random score between 60-85 for demo

  return {
    allocation: { equity, debt, gold },
    emergency_fund: emergencyFund,
    health_score: score,
    action_items: [
      `Start a SIP of ₹${Math.floor(monthlyExp * 0.2)} per month in a Nifty 50 index fund.`,
      `Build emergency fund to ₹${(emergencyFund / 100000).toFixed(1)} Lakhs - keep it in a liquid fund.`,
      risk.includes("Panic") 
        ? "Consider a conservative hybrid fund to reduce volatility anxiety."
        : "Review and cut discretionary spending by 10% to increase savings rate."
    ],
    reasoning: "Based on your age and risk profile, a balanced approach with a tilt towards equity will help you beat inflation while keeping volatility manageable."
  };
};
