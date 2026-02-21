import { motion } from 'framer-motion';
import { 
  PieChart as PieIcon,
  Building2,
  AlertTriangle,
  TrendingUp,
  Coins,
  Wallet,
  Scale
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Treemap
} from 'recharts';
import type { IgniteMetrics, Stage2Data } from '@/lib/types';
import { formatINR } from '@/utils/igniteEngine';

interface PortfolioTabProps {
  metrics: IgniteMetrics;
  stage2Data: Stage2Data;
}

// Custom Treemap Content
const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, color, percent } = props;
  
  if (width < 50 || height < 30) return null;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="rgba(10,15,30,0.8)"
        strokeWidth={2}
        rx={4}
      />
      {width > 80 && height > 50 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize={10}
          >
            {percent}%
          </text>
        </>
      )}
    </g>
  );
};

// Asset Class Terrain Map
function AssetTerrainMap({ metrics, stage2Data }: { metrics: IgniteMetrics; stage2Data: Stage2Data }) {
  const totalAssets = metrics.totalAssets;
  
  const assetClasses = [
    { 
      name: 'Equity & MF', 
      value: stage2Data.equityMF + (stage2Data.hasRSU ? stage2Data.rsuValue : 0),
      color: '#FF9933'
    },
    { name: 'Real Estate', value: stage2Data.realEstate, color: '#8B5CF6' },
    { name: 'Fixed Income', value: stage2Data.fixedIncome, color: '#3B82F6' },
    { name: 'EPF/PPF/NPS', value: stage2Data.epfPpfNps, color: '#22C55E' },
    { name: 'Gold', value: stage2Data.goldAssets, color: '#EAB308' },
    { name: 'Cash', value: stage2Data.cashSavings, color: '#6B7280' },
  ].filter(a => a.value > 0).map(a => ({
    ...a,
    percent: totalAssets > 0 ? Math.round((a.value / totalAssets) * 100) : 0
  }));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ignite-card p-6"
      data-testid="asset-terrain-map"
    >
      <div className="flex items-center gap-2 mb-1">
        <PieIcon className="w-5 h-5" style={{ color: '#FF9933' }} />
        <h3 className="text-lg font-bold text-white">Asset Class Terrain</h3>
      </div>
      <p className="text-sm text-white/50 mb-6">Your wealth distribution visualized</p>
      
      {/* Treemap */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={assetClasses}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="rgba(10,15,30,0.8)"
            content={<TreemapContent />}
          />
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {assetClasses.map((asset) => (
          <div 
            key={asset.name}
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: asset.color }}
            />
            <div className="min-w-0">
              <p className="text-xs text-white/60 truncate">{asset.name}</p>
              <p className="text-sm font-medium mono text-white">{formatINR(asset.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Real Estate Concentration Warning
function RealEstateWarning({ metrics }: { metrics: IgniteMetrics }) {
  if (!metrics.highRealEstateConcentration) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-5 rounded-xl"
      style={{ 
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)'
      }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.15)' }}
        >
          <Building2 className="w-5 h-5" style={{ color: '#EF4444' }} />
        </div>
        <div>
          <h4 className="text-base font-semibold" style={{ color: '#EF4444' }}>
            High Real Estate Concentration
          </h4>
          <p className="text-sm text-white/60 mt-1 mb-3">
            {Math.round(metrics.realEstateConcentration)}% of your assets are in real estate. 
            This reduces liquidity and diversification.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}>
              Consider: Diversify into liquid assets
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}>
              Target: Keep RE below 40%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Allocation Alignment Check
function AllocationAlignment({ metrics }: { metrics: IgniteMetrics }) {
  const gap = metrics.equityAlignmentGap;
  const isAligned = Math.abs(gap) <= 10;
  const color = isAligned ? '#22C55E' : gap > 0 ? '#F59E0B' : '#3B82F6';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5" style={{ color }} />
        <h3 className="text-lg font-bold text-white">Equity Alignment</h3>
      </div>
      
      {/* Visual Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs text-white/50 mb-2">Current Equity</p>
          <p className="text-3xl font-bold mono" style={{ color: '#FF9933' }}>
            {Math.round(metrics.currentEquityPercent)}%
          </p>
        </div>
        <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)' }}>
          <p className="text-xs text-white/50 mb-2">Ideal for You</p>
          <p className="text-3xl font-bold mono" style={{ color: '#22C55E' }}>
            {Math.round(metrics.idealEquityPercent)}%
          </p>
        </div>
      </div>
      
      {/* Gap Analysis */}
      <div 
        className="p-4 rounded-xl"
        style={{ background: isAligned ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)' }}
      >
        {isAligned ? (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#22C55E' }} />
            <p className="text-sm" style={{ color: '#22C55E' }}>
              Your equity allocation is well-aligned with your risk profile
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
              <p className="text-sm font-medium" style={{ color: '#F59E0B' }}>
                {gap > 0 ? 'Over-allocated to Equity' : 'Under-allocated to Equity'}
              </p>
            </div>
            <p className="text-xs text-white/60">
              {gap > 0 
                ? `Consider reducing equity exposure by ${Math.round(gap)}% to match your risk profile.`
                : `Consider increasing equity exposure by ${Math.round(Math.abs(gap))}% for better long-term returns.`
              }
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Debt vs Invest Analysis
function DebtVsInvest({ metrics, stage2Data }: { metrics: IgniteMetrics; stage2Data: Stage2Data }) {
  const hasHighInterestDebt = stage2Data.personalLoanOutstanding > 0 || stage2Data.creditCardDebt > 0;
  const totalHighInterestDebt = stage2Data.personalLoanOutstanding + stage2Data.creditCardDebt;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="ignite-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-1">Debt Payoff vs Invest</h3>
      <p className="text-sm text-white/50 mb-4">Should you pay off debt or invest?</p>
      
      {hasHighInterestDebt ? (
        <div className="space-y-4">
          <div 
            className="p-4 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#EF4444' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                  Prioritize High-Interest Debt
                </p>
                <p className="text-xs text-white/60 mt-1">
                  You have {formatINR(totalHighInterestDebt)} in high-interest debt. 
                  Paying this off guarantees 12-18% returns.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs text-white/50 mb-1">Personal Loan</p>
              <p className="text-lg font-bold mono text-white">
                {formatINR(stage2Data.personalLoanOutstanding)}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs text-white/50 mb-1">Credit Card</p>
              <p className="text-lg font-bold mono text-white">
                {formatINR(stage2Data.creditCardDebt)}
              </p>
            </div>
          </div>
          
          <p className="text-xs text-white/40">
            Recommendation: Clear high-interest debt before aggressive investing.
          </p>
        </div>
      ) : (
        <div 
          className="p-4 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
                Focus on Investing
              </p>
              <p className="text-xs text-white/60 mt-1">
                No high-interest debt detected. You can focus on growing your investments.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Cost Leakage Detector
function CostLeakageDetector({ metrics, stage2Data }: { metrics: IgniteMetrics; stage2Data: Stage2Data }) {
  const totalEMIs = stage2Data.homeLoanEMI + stage2Data.carLoanEMI + 
    stage2Data.personalLoanEMI + stage2Data.otherEMIs;
  const emiToIncomeRatio = metrics.totalMonthlyIncome > 0 
    ? totalEMIs / metrics.totalMonthlyIncome 
    : 0;
  
  const isHighEMI = emiToIncomeRatio > 0.4;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="ignite-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" style={{ color: isHighEMI ? '#EF4444' : '#22C55E' }} />
        <h3 className="text-lg font-bold text-white">EMI Load Analysis</h3>
      </div>
      
      {/* EMI to Income Ratio */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">EMI to Income Ratio</span>
          <span 
            className="text-lg font-bold mono"
            style={{ color: isHighEMI ? '#EF4444' : '#22C55E' }}
          >
            {Math.round(emiToIncomeRatio * 100)}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ 
              background: emiToIncomeRatio <= 0.3 ? '#22C55E' : 
                emiToIncomeRatio <= 0.4 ? '#F59E0B' : '#EF4444'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, emiToIncomeRatio * 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Safe (&lt;30%)</span>
          <span>High (&gt;40%)</span>
        </div>
      </div>
      
      {/* EMI Breakdown */}
      <div className="space-y-2">
        {[
          { label: 'Home Loan EMI', value: stage2Data.homeLoanEMI },
          { label: 'Car Loan EMI', value: stage2Data.carLoanEMI },
          { label: 'Personal Loan EMI', value: stage2Data.personalLoanEMI },
          { label: 'Other EMIs', value: stage2Data.otherEMIs },
        ].filter(emi => emi.value > 0).map((emi) => (
          <div 
            key={emi.label}
            className="flex items-center justify-between p-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="text-sm text-white/70">{emi.label}</span>
            <span className="text-sm font-medium mono text-white">{formatINR(emi.value)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function PortfolioTab({ metrics, stage2Data }: PortfolioTabProps) {
  return (
    <div className="space-y-6">
      <AssetTerrainMap metrics={metrics} stage2Data={stage2Data} />
      <RealEstateWarning metrics={metrics} />
      
      <div className="grid md:grid-cols-2 gap-6">
        <AllocationAlignment metrics={metrics} />
        <DebtVsInvest metrics={metrics} stage2Data={stage2Data} />
      </div>
      
      <CostLeakageDetector metrics={metrics} stage2Data={stage2Data} />
    </div>
  );
}
