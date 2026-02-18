import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingViewProps {
  onStart: () => void;
}

export function LandingView({ onStart }: LandingViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 max-w-2xl mx-auto"
    >
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <img 
          src="/hero-finance.png" 
          alt="Financial Growth" 
          className="relative w-64 h-64 object-contain drop-shadow-xl rounded-2xl"
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
        Know Exactly Where <br/> 
        <span className="text-primary">Your Money Should Go</span>
      </h1>
      
      <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
        Get personalized asset allocation in 2 minutes. No signup, no personal details needed.
      </p>

      <Button 
        size="lg" 
        onClick={onStart}
        className="text-lg px-8 py-6 h-auto rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:-translate-y-1 bg-primary text-primary-foreground font-semibold"
      >
        Start Free Assessment 
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
      
      <div className="mt-12 flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Free
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Private
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          Instant
        </div>
      </div>
    </motion.div>
  );
}
