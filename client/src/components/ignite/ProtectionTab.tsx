import { motion } from 'framer-motion';
import { 
  Shield, 
  Heart, 
  AlertTriangle, 
  CheckCircle,
  Wallet,
  Users
} from 'lucide-react';
import type { IgniteMetrics } from '@/lib/types';
import { formatINR } from '@/utils/igniteEngine';

interface ProtectionTabProps {
  metrics: IgniteMetrics;
}

// Life Cover Analyzer
function LifeCoverAnalyzer({ metrics }: { metrics: IgniteMetrics }) {
  const coverageRatio = metrics.currentLifeCover / metrics.idealLifeCover;
  const isAdequate = coverageRatio >= 0.8;
  const color = isAdequate ? '#22C55E' : coverageRatio >= 0.5 ? '#F59E0B' : '#EF4444';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5" style={{ color }} />
        <h3 className="text-lg font-bold text-white">Life Insurance Cover</h3>
      </div>
      
      {/* Coverage Meter */}
      <div className="relative h-32 flex items-end justify-center mb-6">
        <div className="w-full max-w-xs">
          {/* Background bar */}
          <div 
            className="h-8 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, coverageRatio * 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          
          {/* Labels */}
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/40">0</span>
            <span 
              className="text-sm font-bold"
              style={{ color }}
            >
              {Math.round(coverageRatio * 100)}% Covered
            </span>
            <span className="text-xs text-white/40">100%</span>
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Current Cover</p>
          <p className="text-xl font-bold mono text-white">
            {formatINR(metrics.currentLifeCover)}
          </p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)' }}>
          <p className="text-xs text-white/50 mb-1">Recommended</p>
          <p className="text-xl font-bold mono" style={{ color: '#22C55E' }}>
            {formatINR(metrics.idealLifeCover)}
          </p>
        </div>
      </div>
      
      {/* Gap Alert */}
      {metrics.lifeCoverGap > 0 && (
        <div 
          className="p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#EF4444' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                Life Cover Gap: {formatINR(metrics.lifeCoverGap)}
              </p>
              <p className="text-xs text-white/60 mt-1">
                Based on 12x annual income for your dependents' security.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isAdequate && (
        <div 
          className="p-4 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
            <p className="text-sm" style={{ color: '#22C55E' }}>
              Adequate life insurance coverage
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Health Cover Analyzer
function HealthCoverAnalyzer({ metrics }: { metrics: IgniteMetrics }) {
  const coverageRatio = metrics.currentHealthCover / metrics.idealHealthCover;
  const isAdequate = coverageRatio >= 0.8;
  const color = isAdequate ? '#22C55E' : coverageRatio >= 0.5 ? '#F59E0B' : '#EF4444';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5" style={{ color }} />
        <h3 className="text-lg font-bold text-white">Health Insurance Cover</h3>
      </div>
      
      {/* Visual Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Current Cover</p>
          <p className="text-xl font-bold mono text-white">
            {formatINR(metrics.currentHealthCover)}
          </p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)' }}>
          <p className="text-xs text-white/50 mb-1">Recommended</p>
          <p className="text-xl font-bold mono" style={{ color: '#3B82F6' }}>
            {formatINR(metrics.idealHealthCover)}
          </p>
        </div>
      </div>
      
      {/* Progress */}
      <div className="mb-4">
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, coverageRatio * 100)}%` }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>
        <p className="text-right text-xs mt-1" style={{ color }}>
          {Math.round(coverageRatio * 100)}% of recommended
        </p>
      </div>
      
      {/* Gap/Success Message */}
      {metrics.healthCoverGap > 0 ? (
        <div 
          className="p-4 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#F59E0B' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#F59E0B' }}>
                Consider increasing cover by {formatINR(metrics.healthCoverGap)}
              </p>
              <p className="text-xs text-white/60 mt-1">
                Medical inflation is 10-15% annually. Ensure adequate family coverage.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="p-4 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
            <p className="text-sm" style={{ color: '#22C55E' }}>
              Health insurance coverage looks adequate
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Emergency Fund Gauge
function EmergencyFundGauge({ metrics }: { metrics: IgniteMetrics }) {
  const progress = Math.min(1, metrics.emergencyMonths / metrics.idealEmergencyMonths);
  const isAdequate = progress >= 1;
  const color = isAdequate ? '#22C55E' : progress >= 0.5 ? '#F59E0B' : '#EF4444';
  
  const circumference = 2 * Math.PI * 50;
  const dashOffset = circumference - (circumference * progress);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" style={{ color }} />
        <h3 className="text-lg font-bold text-white">Emergency Fund</h3>
      </div>
      
      {/* Gauge */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle 
              cx="60" cy="60" r="50" 
              fill="none" 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="12" 
            />
            <motion.circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold mono" style={{ color }}>
              {metrics.emergencyMonths}
            </span>
            <span className="text-xs text-white/50">months</span>
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="text-center mb-4">
        <p className="text-sm text-white/70">
          {isAdequate 
            ? `You have ${metrics.emergencyMonths} months of expenses covered`
            : `Target: ${metrics.idealEmergencyMonths} months of expenses`
          }
        </p>
      </div>
      
      {/* Status */}
      <div 
        className="p-4 rounded-xl"
        style={{ background: isAdequate ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)' }}
      >
        {isAdequate ? (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
            <p className="text-sm" style={{ color: '#22C55E' }}>
              Excellent emergency fund coverage
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#F59E0B' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#F59E0B' }}>
                Build {metrics.idealEmergencyMonths - metrics.emergencyMonths} more months
              </p>
              <p className="text-xs text-white/60 mt-1">
                Target: {formatINR(metrics.totalMonthlyExpenses * metrics.idealEmergencyMonths)} in liquid savings
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Liquid Net Worth Card
function LiquidNetWorthCard({ metrics }: { metrics: IgniteMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-1">Liquid Net Worth</h3>
      <p className="text-sm text-white/50 mb-4">Assets you can access quickly</p>
      
      <div className="text-center py-6">
        <p className="text-4xl font-bold mono" style={{ color: '#22C55E' }}>
          {formatINR(metrics.liquidNetWorth)}
        </p>
        <p className="text-sm text-white/50 mt-2">
          Excluding real estate
        </p>
      </div>
      
      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Total Net Worth</p>
          <p className="text-lg font-bold mono text-white">
            {formatINR(metrics.netWorth)}
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Liquidity Ratio</p>
          <p className="text-lg font-bold mono" style={{ color: '#3B82F6' }}>
            {metrics.netWorth > 0 
              ? Math.round((metrics.liquidNetWorth / metrics.netWorth) * 100) 
              : 0}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Protection Summary
function ProtectionSummary({ metrics }: { metrics: IgniteMetrics }) {
  const items = [
    {
      label: 'Life Cover',
      status: metrics.lifeCoverGap <= 0,
      current: formatINR(metrics.currentLifeCover),
      icon: Shield
    },
    {
      label: 'Health Cover',
      status: metrics.healthCoverGap <= 0,
      current: formatINR(metrics.currentHealthCover),
      icon: Heart
    },
    {
      label: 'Emergency Fund',
      status: metrics.emergencyMonths >= metrics.idealEmergencyMonths,
      current: `${metrics.emergencyMonths} months`,
      icon: Wallet
    },
  ];
  
  const protectionScore = items.filter(i => i.status).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-4">Protection Checklist</h3>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.label}
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: item.status ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}
              >
                <item.icon 
                  className="w-4 h-4" 
                  style={{ color: item.status ? '#22C55E' : '#EF4444' }} 
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-white/50">{item.current}</p>
              </div>
            </div>
            {item.status ? (
              <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
            ) : (
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
            )}
          </div>
        ))}
      </div>
      
      {/* Score */}
      <div className="mt-4 p-4 rounded-xl" style={{ 
        background: protectionScore === 3 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)'
      }}>
        <p className="text-sm text-center" style={{ 
          color: protectionScore === 3 ? '#22C55E' : '#F59E0B'
        }}>
          Protection Score: {protectionScore}/3
        </p>
      </div>
    </motion.div>
  );
}

export function ProtectionTab({ metrics }: ProtectionTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <LifeCoverAnalyzer metrics={metrics} />
        <HealthCoverAnalyzer metrics={metrics} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <EmergencyFundGauge metrics={metrics} />
        <LiquidNetWorthCard metrics={metrics} />
      </div>
      
      <ProtectionSummary metrics={metrics} />
    </div>
  );
}
