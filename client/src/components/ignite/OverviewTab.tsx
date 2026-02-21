import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Building2,
  PiggyBank,
  Target,
  Users
} from 'lucide-react';
import type { IgniteMetrics, Stage1Answers } from '@/lib/types';
import { formatINR, formatPercent } from '@/utils/igniteEngine';

interface OverviewTabProps {
  metrics: IgniteMetrics;
  stage1Data: Stage1Answers;
}

// Wealth Identity Card
function WealthIdentityCard({ metrics }: { metrics: IgniteMetrics }) {
  const scoreColor = metrics.wealthScore >= 70 ? '#22C55E' : 
    metrics.wealthScore >= 50 ? '#F59E0B' : '#EF4444';
  
  const circumference = 2 * Math.PI * 50;
  const dashOffset = circumference - (circumference * metrics.wealthScore) / 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ignite-gradient-border p-6"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Score Circle */}
        <div className="relative w-32 h-32 flex-shrink-0">
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
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold mono" style={{ color: scoreColor }}>
              {metrics.wealthScore}
            </span>
            <span className="text-xs text-white/50">/100</span>
          </div>
        </div>
        
        {/* Identity Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-1">Your Wealth Score</h2>
          <p className="text-white/60 mb-4">
            {metrics.wealthScore >= 70 ? "You're building wealth effectively" :
             metrics.wealthScore >= 50 ? "Solid foundation with room to grow" :
             "Time to accelerate your wealth journey"}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {metrics.wealthScore >= 70 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                High Performer
              </span>
            )}
            {metrics.savingsRate >= 0.3 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
                Strong Saver
              </span>
            )}
            {metrics.hasRSU && (
              <span className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                Equity Earner
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Key Metrics Grid
function MetricsGrid({ metrics }: { metrics: IgniteMetrics }) {
  const cards = [
    {
      label: 'Net Worth',
      value: formatINR(metrics.netWorth),
      icon: Wallet,
      color: metrics.netWorth > 0 ? '#22C55E' : '#EF4444',
      trend: metrics.netWorth > 0 ? 'up' : 'down'
    },
    {
      label: 'Liquid Net Worth',
      value: formatINR(metrics.liquidNetWorth),
      icon: PiggyBank,
      color: '#3B82F6',
      hint: 'Excluding real estate'
    },
    {
      label: 'Monthly Surplus',
      value: formatINR(metrics.monthlySurplus),
      icon: metrics.monthlySurplus > 0 ? TrendingUp : TrendingDown,
      color: metrics.monthlySurplus > 0 ? '#22C55E' : '#EF4444',
      trend: metrics.monthlySurplus > 0 ? 'up' : 'down'
    },
    {
      label: 'Savings Rate',
      value: formatPercent(metrics.savingsRate),
      icon: Target,
      color: metrics.savingsRate >= 0.25 ? '#22C55E' : metrics.savingsRate >= 0.15 ? '#F59E0B' : '#EF4444',
      hint: 'Target: 25%+'
    },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className="ignite-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <card.icon className="w-4 h-4" style={{ color: card.color }} />
            <span className="text-xs text-white/50">{card.label}</span>
          </div>
          <p className="text-xl font-bold mono text-white">{card.value}</p>
          {card.hint && (
            <p className="text-xs text-white/40 mt-1">{card.hint}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Wealth Mirror - Current vs Optimized
function WealthMirror({ metrics }: { metrics: IgniteMetrics }) {
  const currentPath = metrics.projectedCorpusAtRetirement;
  const optimizedPath = currentPath * 1.35; // 35% improvement with optimization
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-1">The Wealth Mirror</h3>
      <p className="text-sm text-white/50 mb-6">Your current trajectory vs. optimized path</p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Current Path */}
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
            <span className="text-sm text-white/60">Current Path</span>
          </div>
          <p className="text-2xl font-bold mono" style={{ color: '#F59E0B' }}>
            {formatINR(currentPath)}
          </p>
          <p className="text-xs text-white/40 mt-2">
            At age {metrics.retirementAge} with current savings rate
          </p>
        </div>
        
        {/* Optimized Path */}
        <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
            <span className="text-sm text-white/60">Optimized Path</span>
          </div>
          <p className="text-2xl font-bold mono" style={{ color: '#22C55E' }}>
            {formatINR(optimizedPath)}
          </p>
          <p className="text-xs text-white/40 mt-2">
            +35% with advisor-guided optimization
          </p>
        </div>
      </div>
      
      <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(255,153,51,0.08)' }}>
        <p className="text-sm text-white/80">
          <span style={{ color: '#FF9933' }} className="font-semibold">
            {formatINR(optimizedPath - currentPath)}
          </span>{' '}
          potential additional wealth with the right strategy
        </p>
      </div>
    </motion.div>
  );
}

// Peer Benchmarks (Placeholder - shows blurred preview)
function PeerBenchmarks({ metrics }: { metrics: IgniteMetrics }) {
  const benchmarks = [
    { metric: 'Net Worth', userValue: formatINR(metrics.netWorth), percentile: 65 },
    { metric: 'Savings Rate', userValue: formatPercent(metrics.savingsRate), percentile: metrics.savingsRate >= 0.25 ? 78 : 45 },
    { metric: 'Retirement Readiness', userValue: `${Math.round(metrics.retirementReadinessPercent)}%`, percentile: Math.min(90, metrics.retirementReadinessPercent * 0.9) },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Peer Benchmarks</h3>
          <p className="text-sm text-white/50">How you compare to similar profiles</p>
        </div>
        <Users className="w-5 h-5 text-white/30" />
      </div>
      
      <div className="space-y-4">
        {benchmarks.map((benchmark, i) => (
          <div key={benchmark.metric}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">{benchmark.metric}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium mono text-white">{benchmark.userValue}</span>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    background: benchmark.percentile >= 70 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    color: benchmark.percentile >= 70 ? '#22C55E' : '#F59E0B'
                  }}
                >
                  Top {100 - Math.round(benchmark.percentile)}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  background: benchmark.percentile >= 70 ? '#22C55E' : '#F59E0B'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${benchmark.percentile}%` }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Asset Composition Preview
function AssetComposition({ metrics }: { metrics: IgniteMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-1">Quick Asset Overview</h3>
      <p className="text-sm text-white/50 mb-4">Current allocation snapshot</p>
      
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-3">
          {[
            { label: 'Equity', percent: metrics.currentEquityPercent, color: '#FF9933' },
            { label: 'Fixed Income', percent: 100 - metrics.currentEquityPercent - metrics.realEstateConcentration, color: '#3B82F6' },
            { label: 'Real Estate', percent: metrics.realEstateConcentration, color: '#8B5CF6' },
          ].filter(item => item.percent > 0).map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">{item.label}</span>
                  <span className="text-xs font-medium mono text-white">{Math.round(item.percent)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {metrics.highRealEstateConcentration && (
        <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)' }}>
          <p className="text-xs" style={{ color: '#EF4444' }}>
            <Building2 className="w-3 h-3 inline mr-1" />
            High real estate concentration ({Math.round(metrics.realEstateConcentration)}%) - consider diversifying
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function OverviewTab({ metrics, stage1Data }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <WealthIdentityCard metrics={metrics} />
      <MetricsGrid metrics={metrics} />
      
      <div className="grid md:grid-cols-2 gap-6">
        <WealthMirror metrics={metrics} />
        <PeerBenchmarks metrics={metrics} />
      </div>
      
      <AssetComposition metrics={metrics} />
    </div>
  );
}
