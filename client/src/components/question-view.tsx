import { motion } from "framer-motion";
import { Question } from "@/lib/types";
import { ChevronLeft } from "lucide-react";

interface QuestionViewProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  onBack: () => void;
}

export function QuestionView({
  question,
  currentStep,
  totalSteps,
  selectedAnswer,
  onAnswer,
  onBack,
}: QuestionViewProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="max-w-xl mx-auto w-full px-4 pt-8"
    >
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <button
            data-testid="back-button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-1 px-2 py-1 rounded-lg hover:bg-muted/50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-sm font-medium" style={{ color: "#FF9933" }}>
            Question {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            data-testid="progress-bar"
            className="h-full rounded-full"
            style={{ background: "#FF9933" }}
            initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl sm:text-2xl font-semibold mb-6 text-foreground leading-snug"
      >
        {question.text}
      </motion.h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          return (
            <motion.button
              key={option}
              data-testid={`option-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onAnswer(option)}
              className="w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group"
              style={
                isSelected
                  ? {
                      borderColor: "#FF9933",
                      background: "rgba(255,153,51,0.08)",
                    }
                  : {
                      borderColor: "var(--color-border)",
                      background: "var(--color-card)",
                    }
              }
            >
              <span
                className="text-base font-medium transition-colors"
                style={isSelected ? { color: "#FF9933" } : {}}
              >
                {option}
              </span>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={
                  isSelected
                    ? { borderColor: "#FF9933" }
                    : { borderColor: "var(--color-muted-foreground, #9ca3af)" }
                }
              >
                {isSelected && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: "#FF9933" }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
