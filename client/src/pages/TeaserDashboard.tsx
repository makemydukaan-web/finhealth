import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Lock, 
  TrendingUp, 
  Shield, 
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { Stage1Answers } from '@/lib/types';
import { calculateTeaserScore, formatINR, formatPercent } from '@/utils/igniteEngine';

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayValue}{suffix}</span>;
}

// Blurred insight card
function BlurredInsightCard({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="relative overflow-hidden rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(255,153,51,0.15)' }}>
          <Icon className="w-4 h-4" style={{ color: '#FF9933' }} />
        </div>
        <span className="text-sm font-medium text-white/80">{title}</span>
      </div>
      <div className="h-16 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-full h-full rounded-lg flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Lock className="w-5 h-5 text-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeaserDashboard() {
  const [, navigate] = useLocation();
  const [stage1Data, setStage1Data] = useState<Stage1Answers | null>(null);
  const [scores, setScores] = useState<ReturnType<typeof calculateTeaserScore> | null>(null);
  
  useEffect(() => {
    const raw = sessionStorage.getItem('stage1Data');
    if (raw) {
      const data = JSON.parse(raw) as Stage1Answers;
      setStage1Data(data);
      setScores(calculateTeaserScore(data));
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  if (!scores || !stage1Data) return null;
  
  const scoreColor = scores.estimatedScore >= 70 ? '#22C55E' : 
    scores.estimatedScore >= 50 ? '#F59E0B' : '#EF4444';
  
  const circumference = 2 * Math.PI * 60;
  const dashOffset = circumference - (circumference * scores.estimatedScore) / 100;
  
  const handleUnlock = () => {
    navigate('/stage2');
  };
  
  return (
    <div className="ignite-theme">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          data-testid="teaser-logo"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: '#FF9933' }}
          >
            fH
          </div>
          <span className="text-white">
            fin<span style={{ color: '#FF9933' }}>Health</span>
          </span>
        </button>
        <span 
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,153,51,0.15)', color: '#FF9933' }}
        >
          Estimated Report
        </span>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">
            Your Wealth Snapshot
          </h1>
          <p className="text-base text-white/60 max-w-md mx-auto">
            Based on your quick answers, here's an estimated view of your financial health.
          </p>
        </motion.div>
        
        {/* Score Circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          data-testid="teaser-score-circle"
          className="ignite-card ignite-glow-accent p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Ring */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
                <circle 
                  cx="70" cy="70" r="60" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="12" 
                />
                <motion.circle
                  cx="70" cy="70" r="60"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white mono">
                  <AnimatedCounter value={scores.estimatedScore} />
                </span>
                <span className="text-sm text-white/50">/ 100</span>
              </div>
            </div>
            
            {/* Score Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3" 
                style={{ background: 'rgba(255,153,51,0.15)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#FF9933' }} />
                <span className="text-sm font-medium" style={{ color: '#FF9933' }}>
                  Estimated Wealth Score
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {scores.estimatedScore >= 70 ? "You're on a solid path!" :
                 scores.estimatedScore >= 50 ? "Good foundation, room to grow" :
                 "Time to strengthen your finances"}
              </h2>
              <p className="text-white/60 text-sm">
                This is a preliminary estimate. Unlock your full report for precise insights.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Estimated Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { 
              label: 'Est. Net Worth', 
              value: formatINR(scores.estimatedNetWorth),
              icon: TrendingUp,
              color: '#22C55E'
            },
            { 
              label: 'Savings Rate', 
              value: formatPercent(scores.savingsRate),
              icon: Target,
              color: scores.savingsRate >= 0.25 ? '#22C55E' : '#F59E0B'
            },
            { 
              label: 'Retirement Ready', 
              value: `${Math.round(scores.retirementReadiness)}%`,
              icon: Shield,
              color: scores.retirementReadiness >= 60 ? '#22C55E' : '#F59E0B'
            },
            { 
              label: 'Primary Goal', 
              value: stage1Data.primaryGoal.split(' ')[0],
              icon: Target,
              color: '#3B82F6'
            },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="ignite-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                <span className="text-xs text-white/50">{metric.label}</span>
              </div>
              <p className="text-xl font-bold text-white mono">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Blurred Insights Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="ignite-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Detailed Insights</h3>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <BlurredInsightCard title="Retirement Projection" icon={TrendingUp} />
            <BlurredInsightCard title="Asset Allocation" icon={Target} />
            <BlurredInsightCard title="Protection Analysis" icon={Shield} />
          </div>
        </motion.div>
        
        {/* What You'll Unlock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="ignite-card p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-4">Unlock Your Full Report</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Wealth Identity Card', desc: 'Your personalized financial identity' },
              { title: 'Retirement Simulator', desc: 'Interactive salary increment projections' },
              { title: 'Portfolio Analysis', desc: 'Asset allocation & diversification check' },
              { title: 'Protection Gaps', desc: 'Life & health cover recommendations' },
              { title: 'Peer Benchmarks', desc: 'Compare with similar profiles' },
              { title: 'Personalized Action Plan', desc: 'Step-by-step wealth building guide' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(34,197,94,0.2)' }}
                >
                  <ChevronRight className="w-4 h-4" style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-white/50">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      
      {/* Fixed CTA */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ 
          background: 'linear-gradient(to top, #0A0F1E 80%, transparent)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.button
            data-testid="unlock-full-report-btn"
            onClick={handleUnlock}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all"
            style={{ 
              background: 'linear-gradient(135deg, #FF9933, #FF7700)',
              boxShadow: '0 8px 32px rgba(255,153,51,0.35)'
            }}
          >
            <Sparkles className="w-5 h-5" />
            Unlock Full Ignite Report
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <p className="text-center text-xs text-white/40 mt-3">
            5 more questions • Takes 2 minutes • 100% Free
          </p>
        </div>
      </div>
    </div>
  );
}
