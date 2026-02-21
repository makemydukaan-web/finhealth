import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calculator,
  Zap,
  Target,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend
} from 'recharts';
import type { IgniteMetrics, Stage2Data } from '@/lib/types';
import { formatINR, simulateSalaryIncrements } from '@/utils/igniteEngine';

interface RetirementTabProps {
  metrics: IgniteMetrics;
  stage2Data: Stage2Data;
  onSimulatorInteract: () => void;
  onScenarioCardUsed: (cardId: string) => void;
}

// Retirement Readiness Meter
function RetirementReadinessMeter({ metrics }: { metrics: IgniteMetrics }) {
  const readiness = Math.min(100, metrics.retirementReadinessPercent);
  const meterColor = readiness >= 80 ? '#22C55E' : readiness >= 50 ? '#F59E0B' : '#EF4444';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-1">Retirement Readiness</h3>
      <p className="text-sm text-white/50 mb-6">Are you on track for your target retirement?</p>
      
      {/* Gauge */}
      <div className="relative h-4 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${meterColor}, ${meterColor}aa)` }}
          initial={{ width: 0 }}
          animate={{ width: `${readiness}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        {/* Markers */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div 
              key={mark} 
              className="w-px h-full"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-white/40 mb-6">
        <span>0%</span>
        <span className="font-medium" style={{ color: meterColor }}>
          {Math.round(readiness)}% Ready
        </span>
        <span>100%</span>
      </div>
      
      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Current Age</p>
          <p className="text-xl font-bold mono text-white">{metrics.currentAge}</p>
        </div>
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Target Age</p>
          <p className="text-xl font-bold mono text-white">{metrics.retirementAge}</p>
        </div>
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-1">Years Left</p>
          <p className="text-xl font-bold mono" style={{ color: '#FF9933' }}>
            {metrics.yearsToRetirement}
          </p>
        </div>
      </div>
      
      {/* Gap Analysis */}
      <div className="mt-6 p-4 rounded-xl" style={{ 
        background: metrics.retirementGap > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)'
      }}>
        <div className="flex items-start gap-3">
          {metrics.retirementGap > 0 ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#EF4444' }} />
          ) : (
            <Target className="w-5 h-5 flex-shrink-0" style={{ color: '#22C55E' }} />
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: metrics.retirementGap > 0 ? '#EF4444' : '#22C55E' }}>
              {metrics.retirementGap > 0 ? 'Retirement Gap Detected' : 'On Track for Retirement'}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {metrics.retirementGap > 0 
                ? `You need ${formatINR(metrics.retirementGap)} more to maintain your lifestyle.`
                : `Your projected corpus exceeds your requirement by ${formatINR(Math.abs(metrics.retirementGap))}.`
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Salary Increment Simulator (CRITICAL FEATURE)
function SalaryIncrementSimulator({ 
  metrics, 
  onInteract 
}: { 
  metrics: IgniteMetrics;
  onInteract: () => void;
}) {
  const [incrementRate, setIncrementRate] = useState(8);
  const [projectionData, setProjectionData] = useState<ReturnType<typeof simulateSalaryIncrements>>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  useEffect(() => {
    const data = simulateSalaryIncrements(
      metrics.currentAge,
      metrics.totalMonthlyIncome,
      metrics.netWorth,
      metrics.savingsRate,
      incrementRate / 100,
      metrics.idealEquityPercent,
      metrics.retirementAge
    );
    setProjectionData(data);
  }, [metrics, incrementRate]);
  
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIncrementRate(parseInt(e.target.value));
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract();
    }
  }, [hasInteracted, onInteract]);
  
  const finalCorpus = projectionData.length > 0 
    ? projectionData[projectionData.length - 1].corpus 
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="ignite-card ignite-glow-accent p-6"
      data-testid="salary-simulator"
    >
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-5 h-5" style={{ color: '#FF9933' }} />
        <h3 className="text-lg font-bold text-white">Salary Increment Simulator</h3>
      </div>
      <p className="text-sm text-white/50 mb-6">See how your salary growth impacts retirement wealth</p>
      
      {/* Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70">Annual Increment</span>
          <span 
            className="text-lg font-bold mono px-3 py-1 rounded-lg"
            style={{ background: 'rgba(255,153,51,0.15)', color: '#FF9933' }}
          >
            {incrementRate}%
          </span>
        </div>
        <input
          type="range"
          min="3"
          max="20"
          value={incrementRate}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FF9933 0%, #FF9933 ${(incrementRate - 3) / 17 * 100}%, rgba(255,255,255,0.1) ${(incrementRate - 3) / 17 * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
          data-testid="increment-slider"
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>3%</span>
          <span>20%</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="age" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              tickFormatter={(val) => `${(val / 10000000).toFixed(0)}Cr`}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#111827', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
              labelFormatter={(age) => `Age ${age}`}
              formatter={(value: number, name: string) => [
                formatINR(value),
                name === 'corpus' ? 'Projected Corpus' : name
              ]}
            />
            <Area
              type="monotone"
              dataKey="corpus"
              fill="url(#corpusGradient)"
              stroke="#FF9933"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="corpusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9933" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FF9933" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Result */}
      <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)' }}>
        <p className="text-sm text-white/60 mb-1">Projected Corpus at {metrics.retirementAge}</p>
        <p className="text-3xl font-bold mono" style={{ color: '#22C55E' }}>
          {formatINR(finalCorpus)}
        </p>
        <p className="text-xs text-white/50 mt-2">
          With {incrementRate}% annual increment and {Math.round(metrics.savingsRate * 100)}% savings rate
        </p>
      </div>
    </motion.div>
  );
}

// What-If Scenario Cards
function WhatIfScenarios({ 
  metrics,
  onCardUsed 
}: { 
  metrics: IgniteMetrics;
  onCardUsed: (cardId: string) => void;
}) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  const scenarios = [
    {
      id: 'early-retirement',
      title: 'Retire 5 Years Early',
      icon: Zap,
      color: '#8B5CF6',
      question: `What if you retire at ${metrics.retirementAge - 5}?`,
      impact: 'Need 25% more corpus',
      detail: `To retire at ${metrics.retirementAge - 5}, you'd need approximately ${formatINR(metrics.requiredCorpusAtRetirement * 1.25)} instead of ${formatINR(metrics.requiredCorpusAtRetirement)}.`
    },
    {
      id: 'increase-sip',
      title: 'Increase SIP by 10%',
      icon: TrendingUp,
      color: '#22C55E',
      question: 'What if you save 10% more each month?',
      impact: '+₹45L at retirement',
      detail: `Increasing your monthly savings by just 10% (${formatINR(metrics.monthlySurplus * 0.1)}) could add approximately ${formatINR(4500000)} to your retirement corpus.`
    },
    {
      id: 'inflation-impact',
      title: 'Higher Inflation',
      icon: AlertCircle,
      color: '#EF4444',
      question: 'What if inflation averages 8%?',
      impact: 'Need 40% more',
      detail: `If inflation averages 8% instead of 6%, your required corpus would increase to approximately ${formatINR(metrics.requiredCorpusAtRetirement * 1.4)}.`
    },
  ];
  
  const handleCardClick = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
      onCardUsed(cardId);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-1">What-If Scenarios</h3>
      <p className="text-sm text-white/50 mb-4">Explore different financial scenarios</p>
      
      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <div key={scenario.id}>
            <button
              data-testid={`scenario-${scenario.id}`}
              onClick={() => handleCardClick(scenario.id)}
              className="w-full p-4 rounded-xl text-left transition-all"
              style={{ 
                background: expandedCard === scenario.id 
                  ? `${scenario.color}15` 
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${expandedCard === scenario.id ? scenario.color : 'rgba(255,255,255,0.06)'}`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: `${scenario.color}20` }}
                  >
                    <scenario.icon className="w-4 h-4" style={{ color: scenario.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{scenario.title}</p>
                    <p className="text-xs text-white/50">{scenario.question}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ background: `${scenario.color}20`, color: scenario.color }}
                  >
                    {scenario.impact}
                  </span>
                  <ChevronRight 
                    className="w-4 h-4 text-white/30 transition-transform"
                    style={{ transform: expandedCard === scenario.id ? 'rotate(90deg)' : 'none' }}
                  />
                </div>
              </div>
            </button>
            
            {expandedCard === scenario.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-4 rounded-xl"
                style={{ background: `${scenario.color}08` }}
              >
                <p className="text-sm text-white/70">{scenario.detail}</p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Corpus Comparison
function CorpusComparison({ metrics }: { metrics: IgniteMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-4">Corpus Comparison</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Required Corpus</span>
            <span className="text-sm font-bold mono text-white">
              {formatINR(metrics.requiredCorpusAtRetirement)}
            </span>
          </div>
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div 
              className="h-full rounded-full"
              style={{ background: '#3B82F6', width: '100%' }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Projected Corpus</span>
            <span className="text-sm font-bold mono" style={{ 
              color: metrics.retirementGap > 0 ? '#F59E0B' : '#22C55E'
            }}>
              {formatINR(metrics.projectedCorpusAtRetirement)}
            </span>
          </div>
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                background: metrics.retirementGap > 0 ? '#F59E0B' : '#22C55E'
              }}
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (metrics.projectedCorpusAtRetirement / metrics.requiredCorpusAtRetirement) * 100)}%` 
              }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function RetirementTab({ 
  metrics, 
  stage2Data,
  onSimulatorInteract,
  onScenarioCardUsed
}: RetirementTabProps) {
  return (
    <div className="space-y-6">
      <RetirementReadinessMeter metrics={metrics} />
      
      <div className="grid md:grid-cols-2 gap-6">
        <SalaryIncrementSimulator 
          metrics={metrics} 
          onInteract={onSimulatorInteract}
        />
        <div className="space-y-6">
          <WhatIfScenarios 
            metrics={metrics}
            onCardUsed={onScenarioCardUsed}
          />
          <CorpusComparison metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
