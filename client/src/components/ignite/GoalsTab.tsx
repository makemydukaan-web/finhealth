import { motion } from 'framer-motion';
import { 
  Target, 
  Rocket,
  Lock,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Star,
  Sparkles
} from 'lucide-react';
import type { IgniteMetrics, Stage2Data } from '@/lib/types';
import { formatINR } from '@/utils/igniteEngine';

interface GoalsTabProps {
  metrics: IgniteMetrics;
  stage2Data: Stage2Data;
  onOpenLeadForm: () => void;
}

// Goals Overview
function GoalsOverview({ stage2Data }: { stage2Data: Stage2Data }) {
  const goals = stage2Data.topGoals || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5" style={{ color: '#FF9933' }} />
        <h3 className="text-lg font-bold text-white">Your Financial Goals</h3>
      </div>
      
      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal, i) => (
            <motion.div
              key={goal}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `rgba(255,153,51,${0.2 - i * 0.05})` }}
              >
                <span className="text-sm font-bold" style={{ color: '#FF9933' }}>
                  {i + 1}
                </span>
              </div>
              <p className="text-sm font-medium text-white">{goal}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-white/50">No specific goals selected</p>
        </div>
      )}
    </motion.div>
  );
}

// Quick Wins
function QuickWins({ metrics }: { metrics: IgniteMetrics }) {
  const wins: { title: string; description: string; impact: string; priority: 'high' | 'medium' | 'low' }[] = [];
  
  // Generate personalized quick wins
  if (metrics.savingsRate < 0.25) {
    wins.push({
      title: 'Boost Savings Rate',
      description: `Increase monthly savings by ${formatINR(metrics.totalMonthlyIncome * 0.05)} (5%)`,
      impact: '+₹12L over 10 years',
      priority: 'high'
    });
  }
  
  if (metrics.emergencyMonths < 6) {
    wins.push({
      title: 'Build Emergency Fund',
      description: `Add ${formatINR(metrics.totalMonthlyExpenses * (6 - metrics.emergencyMonths))} to liquid savings`,
      impact: 'Financial security',
      priority: 'high'
    });
  }
  
  if (metrics.lifeCoverGap > 0) {
    wins.push({
      title: 'Get Term Insurance',
      description: `Cover gap of ${formatINR(metrics.lifeCoverGap)}`,
      impact: 'Family protection',
      priority: 'high'
    });
  }
  
  if (metrics.hasPersonalLoan) {
    wins.push({
      title: 'Clear High-Interest Debt',
      description: 'Pay off personal loans before investing',
      impact: 'Save 12-18% interest',
      priority: 'high'
    });
  }
  
  if (Math.abs(metrics.equityAlignmentGap) > 15) {
    wins.push({
      title: 'Rebalance Portfolio',
      description: metrics.equityAlignmentGap > 0 
        ? 'Reduce equity exposure to match risk profile'
        : 'Increase equity allocation for better returns',
      impact: 'Risk-adjusted returns',
      priority: 'medium'
    });
  }
  
  // Default wins if none generated
  if (wins.length === 0) {
    wins.push({
      title: 'Stay the Course',
      description: "You're doing great! Keep up your current habits.",
      impact: 'Compound growth',
      priority: 'low'
    });
  }
  
  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#22C55E'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-5 h-5" style={{ color: '#22C55E' }} />
        <h3 className="text-lg font-bold text-white">Quick Wins</h3>
      </div>
      <p className="text-sm text-white/50 mb-4">Actionable steps for immediate impact</p>
      
      <div className="space-y-3">
        {wins.slice(0, 4).map((win, i) => (
          <motion.div
            key={win.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + 0.1 * i }}
            className="p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" style={{ color: priorityColors[win.priority] }} />
                  <p className="text-sm font-medium text-white">{win.title}</p>
                </div>
                <p className="text-xs text-white/60">{win.description}</p>
              </div>
              <span 
                className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                style={{ 
                  background: `${priorityColors[win.priority]}20`,
                  color: priorityColors[win.priority]
                }}
              >
                {win.impact}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// FIRE Calculator Preview
function FIRECalculator({ metrics }: { metrics: IgniteMetrics }) {
  // Simple FIRE calculation
  const annualExpenses = metrics.totalMonthlyExpenses * 12;
  const fireNumber = annualExpenses * 25; // 4% rule
  const currentProgress = Math.min(100, (metrics.liquidNetWorth / fireNumber) * 100);
  
  const yearsToFIRE = metrics.savingsRate > 0 && metrics.monthlySurplus > 0
    ? Math.ceil(Math.log(
        (fireNumber * (0.10 / 12) + metrics.monthlySurplus) / 
        (metrics.liquidNetWorth * (0.10 / 12) + metrics.monthlySurplus)
      ) / Math.log(1 + 0.10 / 12) / 12)
    : 99;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5" style={{ color: '#8B5CF6' }} />
        <h3 className="text-lg font-bold text-white">FIRE Progress</h3>
      </div>
      <p className="text-sm text-white/50 mb-6">Financial Independence, Retire Early</p>
      
      {/* Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle 
              cx="60" cy="60" r="50" 
              fill="none" 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="10" 
            />
            <motion.circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 50}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - currentProgress / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold mono" style={{ color: '#8B5CF6' }}>
              {Math.round(currentProgress)}%
            </span>
            <span className="text-xs text-white/50">to FIRE</span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)' }}>
          <p className="text-xs text-white/50 mb-1">FIRE Number</p>
          <p className="text-lg font-bold mono" style={{ color: '#8B5CF6' }}>
            {formatINR(fireNumber)}
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Years to FIRE</p>
          <p className="text-lg font-bold mono text-white">
            {yearsToFIRE > 50 ? '50+' : yearsToFIRE}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Blurred Advisor Insights
function BlurredAdvisorInsights({ onOpenLeadForm }: { onOpenLeadForm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-xl"
      style={{ 
        background: 'linear-gradient(135deg, rgba(255,153,51,0.1), rgba(139,92,246,0.1))'
      }}
    >
      {/* Blurred Content */}
      <div className="p-6 filter blur-sm pointer-events-none">
        <h3 className="text-lg font-bold text-white mb-4">Personalized Advisor Insights</h3>
        <div className="space-y-3">
          <div className="h-12 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="h-12 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="h-12 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent">
        <div 
          className="p-3 rounded-full mb-4"
          style={{ background: 'rgba(255,153,51,0.2)' }}
        >
          <Lock className="w-6 h-6" style={{ color: '#FF9933' }} />
        </div>
        <h4 className="text-lg font-bold text-white mb-2">Unlock Expert Insights</h4>
        <p className="text-sm text-white/60 text-center mb-4 max-w-xs">
          Get personalized recommendations from our wealth advisors
        </p>
        <button
          data-testid="unlock-insights-btn"
          onClick={onOpenLeadForm}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
          style={{ 
            background: 'linear-gradient(135deg, #FF9933, #FF7700)',
            boxShadow: '0 4px 20px rgba(255,153,51,0.3)'
          }}
        >
          <Sparkles className="w-4 h-4" />
          Talk to Advisor
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Wealth Journey Summary
function WealthJourneySummary({ metrics }: { metrics: IgniteMetrics }) {
  const milestones = [
    {
      title: 'Emergency Fund',
      achieved: metrics.emergencyMonths >= 6,
      value: metrics.emergencyMonths >= 6 ? 'Complete' : `${metrics.emergencyMonths}/6 months`
    },
    {
      title: 'Insurance Coverage',
      achieved: metrics.lifeCoverGap <= 0 && metrics.healthCoverGap <= 0,
      value: metrics.lifeCoverGap <= 0 && metrics.healthCoverGap <= 0 ? 'Adequate' : 'Gaps exist'
    },
    {
      title: '25% Savings Rate',
      achieved: metrics.savingsRate >= 0.25,
      value: `${Math.round(metrics.savingsRate * 100)}%`
    },
    {
      title: 'Portfolio Aligned',
      achieved: Math.abs(metrics.equityAlignmentGap) <= 10,
      value: Math.abs(metrics.equityAlignmentGap) <= 10 ? 'Balanced' : 'Needs rebalancing'
    },
  ];
  
  const achievedCount = milestones.filter(m => m.achieved).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />
          <h3 className="text-lg font-bold text-white">Wealth Milestones</h3>
        </div>
        <span 
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
        >
          {achievedCount}/{milestones.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {milestones.map((milestone, i) => (
          <motion.div
            key={milestone.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + 0.1 * i }}
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ 
                  background: milestone.achieved ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'
                }}
              >
                {milestone.achieved ? (
                  <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                )}
              </div>
              <span className="text-sm text-white">{milestone.title}</span>
            </div>
            <span 
              className="text-xs"
              style={{ color: milestone.achieved ? '#22C55E' : 'rgba(255,255,255,0.5)' }}
            >
              {milestone.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function GoalsTab({ metrics, stage2Data, onOpenLeadForm }: GoalsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <GoalsOverview stage2Data={stage2Data} />
        <QuickWins metrics={metrics} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <FIRECalculator metrics={metrics} />
        <WealthJourneySummary metrics={metrics} />
      </div>
      
      <BlurredAdvisorInsights onOpenLeadForm={onOpenLeadForm} />
    </div>
  );
}
