import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  Shield, 
  Target,
  Share2,
  Lock,
  ArrowRight
} from 'lucide-react';
import type { Stage1Answers, Stage2Data, IgniteMetrics, BehavioralState } from '@/lib/types';
import { STAGE2_DEFAULTS } from '@/lib/types';
import { calculateIgniteMetrics } from '@/utils/igniteEngine';

// Tab Components
import { OverviewTab } from '@/components/ignite/OverviewTab';
import { RetirementTab } from '@/components/ignite/RetirementTab';
import { PortfolioTab } from '@/components/ignite/PortfolioTab';
import { ProtectionTab } from '@/components/ignite/ProtectionTab';
import { GoalsTab } from '@/components/ignite/GoalsTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'retirement', label: 'Retirement', icon: TrendingUp },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'protection', label: 'Protection', icon: Shield },
  { id: 'goals', label: 'Goals', icon: Target },
];

// Animated counter
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
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
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
}

export default function IgniteDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<IgniteMetrics | null>(null);
  const [stage1Data, setStage1Data] = useState<Stage1Answers | null>(null);
  const [stage2Data, setStage2Data] = useState<Stage2Data>(STAGE2_DEFAULTS);
  const [showLeadModal, setShowLeadModal] = useState(false);
  
  // Behavioral tracking
  const [behavioralState, setBehavioralState] = useState<BehavioralState>({
    simulatorInteracted: false,
    scenarioCardsUsed: [],
    timeOnSalarySimulator: 0,
    tabsVisited: ['overview'],
  });
  
  // Track simulator interaction
  const trackSimulatorInteraction = useCallback(() => {
    setBehavioralState(prev => ({ ...prev, simulatorInteracted: true }));
  }, []);
  
  // Track scenario card usage
  const trackScenarioCard = useCallback((cardId: string) => {
    setBehavioralState(prev => ({
      ...prev,
      scenarioCardsUsed: prev.scenarioCardsUsed.includes(cardId) 
        ? prev.scenarioCardsUsed 
        : [...prev.scenarioCardsUsed, cardId]
    }));
  }, []);
  
  // Track tab visits
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setBehavioralState(prev => ({
      ...prev,
      tabsVisited: prev.tabsVisited.includes(tabId) ? prev.tabsVisited : [...prev.tabsVisited, tabId]
    }));
  };
  
  useEffect(() => {
    const s1Raw = sessionStorage.getItem('stage1Data');
    const s2Raw = sessionStorage.getItem('stage2Data');
    
    if (!s1Raw) {
      navigate('/');
      return;
    }
    
    const s1 = JSON.parse(s1Raw) as Stage1Answers;
    const s2 = s2Raw ? JSON.parse(s2Raw) as Stage2Data : STAGE2_DEFAULTS;
    
    setStage1Data(s1);
    setStage2Data(s2);
    
    const calculatedMetrics = calculateIgniteMetrics({ stage1: s1, stage2: s2 });
    setMetrics(calculatedMetrics);
  }, [navigate]);
  
  if (!metrics || !stage1Data) return null;
  
  const scoreColor = metrics.wealthScore >= 70 ? '#22C55E' : 
    metrics.wealthScore >= 50 ? '#F59E0B' : '#EF4444';
  
  return (
    <div className="ignite-theme">
      {/* Header */}
      <header className="px-4 py-3 border-b sticky top-0 z-50" style={{ 
        borderColor: 'rgba(255,255,255,0.08)',
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            data-testid="ignite-logo"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#FF9933' }}
            >
              fH
            </div>
            <span className="text-white hidden sm:inline">
              fin<span style={{ color: '#FF9933' }}>Health</span>
            </span>
          </button>
          
          {/* Score Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${scoreColor}20` }}>
              <span className="text-sm font-bold mono" style={{ color: scoreColor }}>
                <AnimatedCounter value={metrics.wealthScore} />
              </span>
              <span className="text-xs text-white/60">Score</span>
            </div>
            <button
              data-testid="share-btn"
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              onClick={() => {
                // TODO: Implement share functionality with URL encoding
              }}
            >
              <Share2 className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <nav className="border-b sticky top-[57px] z-40" style={{ 
        borderColor: 'rgba(255,255,255,0.08)',
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    background: isActive ? 'rgba(255,153,51,0.15)' : 'transparent',
                    color: isActive ? '#FF9933' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-32">
        {activeTab === 'overview' && (
          <OverviewTab 
            metrics={metrics} 
            stage1Data={stage1Data} 
          />
        )}
        
        {activeTab === 'retirement' && (
          <RetirementTab 
            metrics={metrics}
            stage2Data={stage2Data}
            onSimulatorInteract={trackSimulatorInteraction}
            onScenarioCardUsed={trackScenarioCard}
          />
        )}
        
        {activeTab === 'portfolio' && (
          <PortfolioTab 
            metrics={metrics}
            stage2Data={stage2Data}
          />
        )}
        
        {activeTab === 'protection' && (
          <ProtectionTab metrics={metrics} />
        )}
        
        {activeTab === 'goals' && (
          <GoalsTab 
            metrics={metrics}
            stage2Data={stage2Data}
            onOpenLeadForm={() => setShowLeadModal(true)}
          />
        )}
      </main>
      
      {/* Fixed CTA Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ 
          background: 'linear-gradient(to top, #0A0F1E 80%, transparent)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div 
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ 
              background: 'rgba(17,24,39,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: 'rgba(255,153,51,0.15)' }}
              >
                <Lock className="w-5 h-5" style={{ color: '#FF9933' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Unlock Advisor Insights</p>
                <p className="text-xs text-white/50">Get personalized recommendations</p>
              </div>
            </div>
            <button
              data-testid="unlock-advisor-btn"
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #FF9933, #FF7700)',
                boxShadow: '0 4px 20px rgba(255,153,51,0.3)'
              }}
            >
              Talk to Expert
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Lead Capture Modal */}
      {showLeadModal && (
        <LeadCaptureModal 
          metrics={metrics}
          behavioralState={behavioralState}
          onClose={() => setShowLeadModal(false)}
        />
      )}
    </div>
  );
}

// Lead Capture Modal
function LeadCaptureModal({ 
  metrics, 
  behavioralState,
  onClose 
}: { 
  metrics: IgniteMetrics; 
  behavioralState: BehavioralState;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    
    setSubmitting(true);
    
    // Import supabase dynamically to avoid circular deps
    const { supabase } = await import('@/lib/supabaseClient');
    const { getIncomeBracket, getInvestableBracket } = await import('@/utils/igniteEngine');
    
    try {
      const leadData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        wealth_score: metrics.wealthScore,
        net_worth: Math.round(metrics.netWorth),
        liquid_net_worth: Math.round(metrics.liquidNetWorth),
        retirement_gap: Math.round(metrics.retirementGap),
        savings_rate: Math.round(metrics.savingsRate * 100),
        life_cover_gap: Math.round(metrics.lifeCoverGap),
        health_cover_gap: Math.round(metrics.healthCoverGap),
        equity_alignment: Math.round(metrics.equityAlignmentGap),
        emergency_months: metrics.emergencyMonths,
        primary_goal: metrics.riskProfile, // Using risk profile as proxy
        risk_profile: metrics.riskProfile,
        investable_bracket: getInvestableBracket(metrics.liquidNetWorth),
        income_bracket: getIncomeBracket(metrics.totalMonthlyIncome),
        has_rsu: metrics.hasRSU,
        has_personal_loan: metrics.hasPersonalLoan,
        real_estate_concentration: Math.round(metrics.realEstateConcentration),
        simulator_interacted: behavioralState.simulatorInteracted,
        scenario_cards_used: behavioralState.scenarioCardsUsed.length,
        interested_1to1: true,
      };
      
      const { error } = await supabase.from('detailed_leads').insert(leadData);
      if (error) throw error;
      
      setSuccess(true);
    } catch (err) {
      console.error('Lead capture error:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="ignite-card p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >
              <Target className="w-8 h-8" style={{ color: '#22C55E' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're In!</h3>
            <p className="text-white/60 text-sm mb-6">
              Our wealth advisor will reach out within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Talk to a Wealth Expert</h3>
            <p className="text-white/60 text-sm mb-6">
              Get personalized guidance on building your wealth faster.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                data-testid="lead-name"
                type="text"
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm"
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <input
                data-testid="lead-email"
                type="email"
                placeholder="Email address *"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm"
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <input
                data-testid="lead-phone"
                type="tel"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white text-sm"
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                >
                  Cancel
                </button>
                <button
                  data-testid="lead-submit"
                  type="submit"
                  disabled={submitting || !form.name.trim() || !form.email.trim()}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                  style={{ 
                    background: '#FF9933',
                    color: 'white'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Get Expert Help'}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
