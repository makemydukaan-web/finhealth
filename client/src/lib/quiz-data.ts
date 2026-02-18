import { Question } from "./types";

export const questions: Question[] = [
  {
    id: 1,
    text: "What's your age?",
    options: ["Under 25", "25-30", "30-35", "35-40", "40-45", "45+"],
  },
  {
    id: 2,
    text: "What's your monthly in-hand salary?",
    options: ["Under ₹50,000", "₹50,000-1,00,000", "₹1,00,000-2,00,000", "Above ₹2,00,000"],
  },
  {
    id: 3,
    text: "How much have you saved so far (approximate total)?",
    options: ["Under ₹5 lakhs", "₹5-10 lakhs", "₹10-25 lakhs", "₹25-50 lakhs", "Above ₹50 lakhs"],
  },
  {
    id: 4,
    text: "Do you have financial dependents (kids, parents, spouse)?",
    options: ["Yes", "No"],
  },
  {
    id: 5,
    text: "What's your top financial goal?",
    options: ["Retirement", "Buy a home", "Kids' education", "Financial freedom", "Emergency fund"],
  },
  {
    id: 6,
    text: "If the stock market drops 20% tomorrow, you would:",
    options: ["Panic and sell everything", "Feel nervous but hold on", "See it as a buying opportunity"],
  },
  {
    id: 7,
    text: "Current monthly expenses (approximate)?",
    options: ["Under ₹30,000", "₹30,000-60,000", "₹60,000-1,00,000", "Above ₹1,00,000"],
  },
];
