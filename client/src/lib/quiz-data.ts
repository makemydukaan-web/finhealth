import { Question } from "./types";

export const questions: Question[] = [
  {
    id: 1,
    text: "What is your age?",
    options: ["Under 25", "25-30", "30-35", "35-40", "40-45", "45+"],
  },
  {
    id: 2,
    text: "What is your monthly in-hand salary?",
    options: [
      "Under ₹50,000",
      "₹50,000-1,00,000",
      "₹1,00,000-2,00,000",
      "Above ₹2,00,000",
    ],
  },
  {
    id: 3,
    text: "What are your average monthly expenses?",
    options: [
      "Under ₹30,000",
      "₹30,000-60,000",
      "₹60,000-1,00,000",
      "Above ₹1,00,000",
    ],
  },
  {
    id: 4,
    text: "What is your total current savings (all investments + bank)?",
    options: [
      "Under ₹5 lakhs",
      "₹5-10 lakhs",
      "₹10-25 lakhs",
      "₹25-50 lakhs",
      "Above ₹50 lakhs",
    ],
  },
  {
    id: 5,
    text: "Do you currently have any EMIs or loans?",
    options: [
      "No loans",
      "Home loan only",
      "Car/Personal loan",
      "Multiple loans",
    ],
  },
  {
    id: 6,
    text: "Do you have health insurance and/or term life insurance?",
    options: ["Both health and term", "Only one", "None"],
  },
  {
    id: 7,
    text: "If markets fall 20%, what would you do?",
    options: [
      "Panic and sell",
      "Feel nervous but hold",
      "See it as buying opportunity",
    ],
  },
  {
    id: 8,
    text: "What is your primary financial goal right now?",
    options: [
      "Retirement",
      "Buy a home",
      "Kids education",
      "Financial freedom",
      "Just getting started",
    ],
  },
];
