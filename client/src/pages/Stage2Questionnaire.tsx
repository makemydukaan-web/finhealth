import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Stage2Data, RiskProfile, JobStability } from '@/lib/types';
import { STAGE2_DEFAULTS } from '@/lib/types';
import { formatINR } from '@/utils/igniteEngine';

const STEPS = [
  { title: 'Income Details', subtitle: 'Your earnings & stability' },
  { title: 'Assets Snapshot', subtitle: 'What you own today' },
  { title: 'Liabilities', subtitle: 'Your debts & EMIs' },
  { title: 'Protection', subtitle: 'Insurance & emergency fund' },
  { title: 'Future Goals', subtitle: 'Your retirement & aspirations' },
];

const STEP_COLORS = ['#FF9933', '#22C55E', '#EF4444', '#3B82F6', '#8B5CF6'];

// Input component with INR formatting
function CurrencyInput({ 
  label, 
  value, 
  onChange, 
  placeholder = '0',
  hint 
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  placeholder?: string;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const displayValue = focused ? (value || '') : (value ? formatINR(value) : '');
  
  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>
      <input
        type={focused ? 'number' : 'text'}
        value={displayValue}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border text-white text-sm focus:outline-none focus:ring-2 transition-all mono"
        style={{ 
          background: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.1)',
          '--tw-ring-color': '#FF9933'
        } as React.CSSProperties}
      />
      {hint && <p className="text-xs text-white/40 mt-1.5">{hint}</p>}
    </div>
  );
}

// Toggle button group
function ToggleGroup<T extends string>({ 
  options, 
  value, 
  onChange,
  columns = 2 
}: { 
  options: { value: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
          style={{
            background: value === opt.value ? 'rgba(255,153,51,0.15)' : 'rgba(255,255,255,0.03)',
            borderColor: value === opt.value ? '#FF9933' : 'rgba(255,255,255,0.08)',
            border: '1px solid',
            color: value === opt.value ? '#FF9933' : 'rgba(255,255,255,0.7)'
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Step 1: Income
function StepIncome({ data, onChange }: { data: Stage2Data; onChange: (updates: Partial<Stage2Data>) => void }) {
  return (
    <div className="space-y-6">
      <CurrencyInput
        label="Monthly In-Hand Income"
        value={data.exactMonthlyIncome}
        onChange={(val) => onChange({ exactMonthlyIncome: val })}
        hint="Your take-home salary after tax"
      />
      
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.hasSecondaryIncome}
            onChange={(e) => onChange({ hasSecondaryIncome: e.target.checked })}
            className="w-5 h-5 rounded"
            style={{ accentColor: '#FF9933' }}
          />
          <span className="text-sm text-white/80">I have secondary income (freelance, rental, etc.)</span>
        </label>
      </div>
      
      {data.hasSecondaryIncome && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <CurrencyInput
            label="Monthly Secondary Income"
            value={data.secondaryIncomeAmount}
            onChange={(val) => onChange({ secondaryIncomeAmount: val })}
          />
        </motion.div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Job Stability</label>
        <ToggleGroup
          options={[
            { value: 'Very Stable', label: 'Very Stable (Govt/MNC)' },
            { value: 'Stable', label: 'Stable' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'Uncertain', label: 'Uncertain' },
          ]}
          value={data.jobStability}
          onChange={(val) => onChange({ jobStability: val as JobStability })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Number of Dependents</label>
        <ToggleGroup
          options={[
            { value: '0', label: 'None' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3+' },
          ]}
          value={String(data.dependentsCount)}
          onChange={(val) => onChange({ dependentsCount: parseInt(val) })}
          columns={4}
        />
      </div>
    </div>
  );
}

// Step 2: Assets
function StepAssets({ data, onChange }: { data: Stage2Data; onChange: (updates: Partial<Stage2Data>) => void }) {
  const totalAssets = data.equityMF + data.fixedIncome + data.epfPpfNps + 
    data.goldAssets + data.realEstate + data.cashSavings + (data.hasRSU ? data.rsuValue : 0);
  
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <p className="text-sm text-white/60 mb-1">Total Assets</p>
        <p className="text-2xl font-bold mono" style={{ color: '#22C55E' }}>{formatINR(totalAssets)}</p>
      </div>
      
      <CurrencyInput
        label="Equity & Mutual Funds"
        value={data.equityMF}
        onChange={(val) => onChange({ equityMF: val })}
        hint="Stocks, equity MFs, ETFs"
      />
      
      <CurrencyInput
        label="Fixed Income"
        value={data.fixedIncome}
        onChange={(val) => onChange({ fixedIncome: val })}
        hint="FDs, Bonds, Debt MFs"
      />
      
      <CurrencyInput
        label="EPF + PPF + NPS"
        value={data.epfPpfNps}
        onChange={(val) => onChange({ epfPpfNps: val })}
        hint="Retirement accounts"
      />
      
      <CurrencyInput
        label="Gold"
        value={data.goldAssets}
        onChange={(val) => onChange({ goldAssets: val })}
        hint="Physical + Digital gold"
      />
      
      <CurrencyInput
        label="Real Estate (Total Value)"
        value={data.realEstate}
        onChange={(val) => onChange({ realEstate: val })}
        hint="All properties including home"
      />
      
      <CurrencyInput
        label="Cash & Savings"
        value={data.cashSavings}
        onChange={(val) => onChange({ cashSavings: val })}
        hint="Bank balance, liquid funds"
      />
      
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.hasRSU}
            onChange={(e) => onChange({ hasRSU: e.target.checked })}
            className="w-5 h-5 rounded"
            style={{ accentColor: '#FF9933' }}
          />
          <span className="text-sm text-white/80">I have RSU/ESOP</span>
        </label>
      </div>
      
      {data.hasRSU && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <CurrencyInput
            label="Vested RSU/ESOP Value"
            value={data.rsuValue}
            onChange={(val) => onChange({ rsuValue: val })}
          />
        </motion.div>
      )}
    </div>
  );
}

// Step 3: Liabilities
function StepLiabilities({ data, onChange }: { data: Stage2Data; onChange: (updates: Partial<Stage2Data>) => void }) {
  const totalLiabilities = data.homeLoanOutstanding + data.carLoanOutstanding + 
    data.personalLoanOutstanding + data.creditCardDebt;
  const totalEMIs = data.homeLoanEMI + data.carLoanEMI + data.personalLoanEMI + data.otherEMIs;
  
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm text-white/60 mb-1">Total Debt</p>
          <p className="text-xl font-bold mono" style={{ color: '#EF4444' }}>{formatINR(totalLiabilities)}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-sm text-white/60 mb-1">Monthly EMIs</p>
          <p className="text-xl font-bold mono" style={{ color: '#F59E0B' }}>{formatINR(totalEMIs)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          label="Home Loan Outstanding"
          value={data.homeLoanOutstanding}
          onChange={(val) => onChange({ homeLoanOutstanding: val })}
        />
        <CurrencyInput
          label="Home Loan EMI"
          value={data.homeLoanEMI}
          onChange={(val) => onChange({ homeLoanEMI: val })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          label="Car Loan Outstanding"
          value={data.carLoanOutstanding}
          onChange={(val) => onChange({ carLoanOutstanding: val })}
        />
        <CurrencyInput
          label="Car Loan EMI"
          value={data.carLoanEMI}
          onChange={(val) => onChange({ carLoanEMI: val })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          label="Personal Loan Outstanding"
          value={data.personalLoanOutstanding}
          onChange={(val) => onChange({ personalLoanOutstanding: val })}
        />
        <CurrencyInput
          label="Personal Loan EMI"
          value={data.personalLoanEMI}
          onChange={(val) => onChange({ personalLoanEMI: val })}
        />
      </div>
      
      <CurrencyInput
        label="Credit Card Debt"
        value={data.creditCardDebt}
        onChange={(val) => onChange({ creditCardDebt: val })}
        hint="Outstanding balance on cards"
      />
      
      <CurrencyInput
        label="Other EMIs"
        value={data.otherEMIs}
        onChange={(val) => onChange({ otherEMIs: val })}
        hint="Any other monthly payments"
      />
    </div>
  );
}

// Step 4: Protection
function StepProtection({ data, onChange }: { data: Stage2Data; onChange: (updates: Partial<Stage2Data>) => void }) {
  return (
    <div className="space-y-6">
      <CurrencyInput
        label="Term Life Insurance Cover"
        value={data.termLifeCover}
        onChange={(val) => onChange({ termLifeCover: val })}
        hint="Recommended: 10-15x annual income"
      />
      
      <CurrencyInput
        label="Health Insurance Cover"
        value={data.healthCover}
        onChange={(val) => onChange({ healthCover: val })}
        hint="Recommended: ₹10-25 lakhs for family"
      />
      
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Emergency Fund (in months of expenses)</label>
        <ToggleGroup
          options={[
            { value: '0', label: 'None' },
            { value: '1', label: '1-2 months' },
            { value: '3', label: '3 months' },
            { value: '6', label: '6 months' },
            { value: '12', label: '12+ months' },
          ]}
          value={String(data.emergencyFundMonths)}
          onChange={(val) => onChange({ emergencyFundMonths: parseInt(val) })}
          columns={3}
        />
        <p className="text-xs text-white/40 mt-2">Recommended: 6 months of expenses in liquid savings</p>
      </div>
    </div>
  );
}

// Step 5: Goals
function StepGoals({ data, onChange }: { data: Stage2Data; onChange: (updates: Partial<Stage2Data>) => void }) {
  const goals = [
    'Early Retirement',
    'Buy a Home', 
    'Kids Education',
    'Wealth Building',
    'Financial Freedom',
    'Travel & Lifestyle',
  ];
  
  const toggleGoal = (goal: string) => {
    const current = data.topGoals || [];
    if (current.includes(goal)) {
      onChange({ topGoals: current.filter(g => g !== goal) });
    } else if (current.length < 3) {
      onChange({ topGoals: [...current, goal] });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Target Retirement Age</label>
        <ToggleGroup
          options={[
            { value: '45', label: '45' },
            { value: '50', label: '50' },
            { value: '55', label: '55' },
            { value: '60', label: '60' },
            { value: '65', label: '65' },
          ]}
          value={String(data.retirementAge)}
          onChange={(val) => onChange({ retirementAge: parseInt(val) })}
          columns={5}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Risk Profile</label>
        <ToggleGroup
          options={[
            { value: 'Conservative', label: 'Conservative' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'Aggressive', label: 'Aggressive' },
          ]}
          value={data.riskProfile}
          onChange={(val) => onChange({ riskProfile: val as RiskProfile })}
          columns={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Top 3 Financial Goals <span className="text-white/40">(Select up to 3)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {goals.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: data.topGoals?.includes(goal) ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                borderColor: data.topGoals?.includes(goal) ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                border: '1px solid',
                color: data.topGoals?.includes(goal) ? '#8B5CF6' : 'rgba(255,255,255,0.7)'
              }}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Validation
function isStepValid(step: number, data: Stage2Data): boolean {
  if (step === 1) return data.exactMonthlyIncome > 0;
  if (step === 2) return true; // Optional
  if (step === 3) return true; // Optional
  if (step === 4) return true; // Optional
  if (step === 5) return data.retirementAge > 0 && data.riskProfile !== 'Moderate'; // Must select
  return true;
}

export default function Stage2Questionnaire() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [computing, setComputing] = useState(false);
  const [formData, setFormData] = useState<Stage2Data>(STAGE2_DEFAULTS);
  
  const updateField = (updates: Partial<Stage2Data>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  const canContinue = isStepValid(step, formData);
  
  const handleContinue = () => {
    if (step < 5) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setComputing(true);
      setTimeout(() => {
        // Store data and navigate to Ignite Dashboard
        sessionStorage.setItem('stage2Data', JSON.stringify(formData));
        navigate('/ignite');
      }, 1500);
    }
  };
  
  const handleBack = () => {
    if (step === 1) {
      navigate('/teaser');
    } else {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const stepColor = STEP_COLORS[step - 1];
  
  return (
    <div className="ignite-theme">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-2xl mx-auto border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: '#FF9933' }}
          >
            fH
          </div>
          <span className="text-white">fin<span style={{ color: '#FF9933' }}>Health</span></span>
        </button>
        <span 
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: `${stepColor}20`, color: stepColor }}
        >
          Step {step} of 5
        </span>
      </header>
      
      <main className="max-w-xl mx-auto px-4 pt-6 pb-32">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300"
                  style={
                    i + 1 < step
                      ? { background: stepColor, color: '#fff' }
                      : i + 1 === step
                        ? { background: stepColor, color: '#fff', boxShadow: `0 0 0 3px ${stepColor}30` }
                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                  }
                >
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                {i < 4 && (
                  <div
                    className="h-0.5 flex-1 rounded-full transition-all duration-500"
                    style={{ background: i + 1 < step ? stepColor : 'rgba(255,255,255,0.1)' }}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{STEPS[step - 1].title}</h1>
            <p className="text-sm text-white/60 mt-0.5">{STEPS[step - 1].subtitle}</p>
          </div>
        </div>
        
        {/* Step Content */}
        {computing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(255,153,51,0.15)' }}
            >
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#FF9933' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Building your Ignite Dashboard...</h3>
            <p className="text-white/60 text-sm">Analyzing your complete financial profile</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {step === 1 && <StepIncome data={formData} onChange={updateField} />}
              {step === 2 && <StepAssets data={formData} onChange={updateField} />}
              {step === 3 && <StepLiabilities data={formData} onChange={updateField} />}
              {step === 4 && <StepProtection data={formData} onChange={updateField} />}
              {step === 5 && <StepGoals data={formData} onChange={updateField} />}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Navigation */}
        {!computing && (
          <div 
            className="fixed bottom-0 left-0 right-0 px-4 py-4"
            style={{ background: 'linear-gradient(to top, #0A0F1E 80%, transparent)' }}
          >
            <div className="max-w-xl mx-auto flex items-center gap-3">
              <button
                data-testid="stage2-back-btn"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)'
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                data-testid="stage2-continue-btn"
                onClick={handleContinue}
                disabled={!canContinue}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ 
                  background: stepColor, 
                  boxShadow: canContinue ? `0 4px 16px ${stepColor}40` : 'none' 
                }}
              >
                {step === 5 ? 'Generate Ignite Report' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
