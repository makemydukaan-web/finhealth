import { useState } from "react";
import { questions } from "@/lib/quiz-data";
import { QuizState, AssessmentResult } from "@/lib/types";
import { generateAssessment } from "@/lib/mock-api";
import { LandingView } from "@/components/landing-view";
import { QuestionView } from "@/components/question-view";
import { ResultsView } from "@/components/results-view";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [state, setState] = useState<QuizState>({
    currentStep: 0,
    answers: {},
  });
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const startQuiz = () => {
    setState((prev) => ({ ...prev, currentStep: 1 }));
  };

  const handleAnswer = async (answer: string) => {
    const nextStep = state.currentStep + 1;
    const newAnswers = { ...state.answers, [state.currentStep]: answer };
    
    setState((prev) => ({ 
      ...prev, 
      answers: newAnswers
    }));

    if (state.currentStep === questions.length) {
      // Quiz complete, show loader then results
      setState((prev) => ({ ...prev, currentStep: 8 })); // 8 = loading
      
      try {
        const data = await generateAssessment(newAnswers);
        setResult(data);
        setState((prev) => ({ ...prev, currentStep: 9 })); // 9 = results
      } catch (error) {
        console.error("Failed to generate assessment", error);
        // Handle error state if needed
      }
    } else {
      // Next question
      // Small delay to let animation play if needed, but for now instant
      setTimeout(() => {
        setState((prev) => ({ ...prev, currentStep: nextStep }));
      }, 300);
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    } else {
      setState((prev) => ({ ...prev, currentStep: 0 }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-yellow-400 flex items-center justify-center text-white font-serif italic shadow-md">
            ₹
          </div>
          <span>FinHealth<span className="text-primary">.in</span></span>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {state.currentStep === 0 && (
            <LandingView key="landing" onStart={startQuiz} />
          )}

          {state.currentStep > 0 && state.currentStep <= questions.length && (
            <QuestionView
              key={`question-${state.currentStep}`}
              question={questions[state.currentStep - 1]}
              currentStep={state.currentStep}
              totalSteps={questions.length}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
          )}

          {state.currentStep === 8 && (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Analyzing your profile...</h3>
              <p className="text-muted-foreground">Calculating your optimal asset allocation</p>
            </motion.div>
          )}

          {state.currentStep === 9 && result && (
            <ResultsView key="results" result={result} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
