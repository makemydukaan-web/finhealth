import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Target } from "lucide-react";

interface LandingViewProps {
  onStart: () => void;
}

const features = [
  { icon: TrendingUp, label: "Financial Health Score", desc: "Know exactly where you stand" },
  { icon: Shield, label: "Asset Allocation", desc: "Equity, Debt & Gold split" },
  { icon: Target, label: "Action Plan", desc: "3 steps to improve your score" },
];

export function LandingView({ onStart }: LandingViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 max-w-2xl mx-auto"
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
        style={{ background: "rgba(255,153,51,0.12)", color: "#FF9933" }}
      >
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        Free • Instant • Private
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight"
      >
        What's Your{" "}
        <span style={{ color: "#FF9933" }}>Financial Health</span>{" "}
        Score?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
      >
        Answer 8 simple questions and get your personalised Financial Health Score,
        asset allocation strategy and emergency fund target.
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-10"
      >
        {features.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-card border border-border/60"
          >
            <div className="p-2 rounded-lg" style={{ background: "rgba(255,153,51,0.1)" }}>
              <Icon className="w-4 h-4" style={{ color: "#FF9933" }} />
            </div>
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA button */}
      <motion.button
        data-testid="start-assessment-btn"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg transition-shadow hover:shadow-xl"
        style={{ background: "#FF9933", boxShadow: "0 8px 24px rgba(255,153,51,0.35)" }}
      >
        Start Free Assessment
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        8 questions · Takes 2 minutes · No signup needed
      </motion.p>
    </motion.div>
  );
}
