import { motion } from "framer-motion";
import { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface QuestionViewProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  onAnswer: (answer: string) => void;
  onBack: () => void;
}

export function QuestionView({ question, currentStep, totalSteps, onAnswer, onBack }: QuestionViewProps) {
  return (
    <motion.div 
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="max-w-xl mx-auto w-full px-4 pt-8"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {currentStep} of {totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-foreground leading-tight">
        {question.text}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onAnswer(option)}
            className="w-full text-left p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all duration-200 group flex items-center justify-between"
          >
            <span className="text-lg font-medium group-hover:text-primary transition-colors">
              {option}
            </span>
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
