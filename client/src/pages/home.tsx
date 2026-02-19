import { useState } from "react";
import { questions } from "@/lib/quiz-data";
import { QuizState, ScoreResult } from "@/lib/types";
import { calculateFinancialHealthScore } from "@/utils/scoring";
import { LandingView } from "@/components/landing-view";
import { QuestionView } from "@/components/question-view";
import { ResultsView } from "@/components/results-view";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TOTAL_QUESTIONS = questions.length; // 8

// Steps: 0=landing, 1–8=questions, 9=loading, 10=results
export default function Home() {
  const [state, setState] = useState<QuizState>({
    currentStep: 0,
    answers: {},
  });
  const [result, setResult] = useState<ScoreResult | null>(null);

  const startQuiz = () => {
    setState({ currentStep: 1, answers: {} });
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...state.answers, [state.currentStep]: answer };

    if (state.currentStep === TOTAL_QUESTIONS) {
      // All questions answered — compute result deterministically
      setState((prev) => ({ ...prev, answers: newAnswers, currentStep: 9 }));
      // Small delay for UX, then show results
      setTimeout(() => {
        const scoreResult = calculateFinancialHealthScore(newAnswers);
        setResult(scoreResult);
        setState((prev) => ({ ...prev, currentStep: 10 }));
      }, 1600);
    } else {
      setState({ answers: newAnswers, currentStep: state.currentStep + 1 });
    }
  };

  const handleBack = () => {
    if (state.currentStep <= 1) {
      setState({ currentStep: 0, answers: {} });
    } else {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center max-w-3xl mx-auto w-full">
        <button
          data-testid="logo"
          onClick={() => setState({ currentStep: 0, answers: {} })}
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow"
            style={{ background: "#FF9933" }}
          >
            fH
          </div>
          <span className="text-foreground">
            fin<span style={{ color: "#FF9933" }}>Health</span>
          </span>
        </button>

        {state.currentStep >= 1 && state.currentStep <= TOTAL_QUESTIONS && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            Financial Health Assessment
          </span>
        )}
      </header>

      <main className="container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {state.currentStep === 0 && (
            <LandingView key="landing" onStart={startQuiz} />
          )}

          {state.currentStep >= 1 && state.currentStep <= TOTAL_QUESTIONS && (
            <QuestionView
              key={`question-${state.currentStep}`}
              question={questions[state.currentStep - 1]}
              currentStep={state.currentStep}
              totalSteps={TOTAL_QUESTIONS}
              selectedAnswer={state.answers[state.currentStep]}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}

          {state.currentStep === 9 && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "rgba(255,153,51,0.1)" }}
              >
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#FF9933" }} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">
                Calculating your score...
              </h3>
              <p className="text-muted-foreground text-sm">
                Analysing your financial profile
              </p>
            </motion.div>
          )}

          {state.currentStep === 10 && result && (
            <ResultsView key="results" result={result} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
