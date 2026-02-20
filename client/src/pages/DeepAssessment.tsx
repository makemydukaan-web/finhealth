import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { DeepFormData, DEEP_FORM_DEFAULTS } from '@/lib/types';
import { calculateWealthScore } from '@/utils/deepScoring';
import { StepIncome } from '@/components/deep-assessment/StepIncome';
import { StepExpenses } from '@/components/deep-assessment/StepExpenses';
import { StepAssets } from '@/components/deep-assessment/StepAssets';
import { StepProtection } from '@/components/deep-assessment/StepProtection';
import { StepGoals } from '@/components/deep-assessment/StepGoals';

const STEPS = [
  { title: 'Income & Stability', subtitle: 'Tell us about your earnings and job security' },
  { title: 'Expenses & EMIs', subtitle: 'How do you spend your monthly income?' },
  { title: 'Assets Snapshot', subtitle: "What does your current portfolio look like?" },
  { title: 'Protection Layer', subtitle: 'Review your insurance and safety net' },
  { title: 'Goals & Risk', subtitle: 'Define your financial ambitions' },
];

const STEP_COLORS = ['#FF9933', '#138808', '#f59e0b', '#000080', '#8b5cf6'];

function isStepValid(step: number, data: DeepFormData): boolean {
  if (step === 1) return !!data.age && !!data.monthlyIncome && !!data.jobStability;
  if (step === 2) return !!data.monthlyExpenses && !!data.housingStatus;
  if (step === 3) {
    const hasAny = [
      data.equityAssets, data.fixedIncome, data.epfPpfNps,
      data.goldAssets, data.cashAssets, data.realEstateTotal,
    ].some(v => parseFloat(v) > 0);
    return hasAny;
  }
  if (step === 4) return !!data.lifeCoverageAmount && !!data.healthCoverageAmount && !!data.emergencyFundMonths;
  if (step === 5) return !!data.retirementAge && !!data.primaryGoal && !!data.riskComfort;
  return false;
}

export default function DeepAssessment() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [computing, setComputing] = useState(false);
  const [formData, setFormData] = useState<DeepFormData>(DEEP_FORM_DEFAULTS);

  const updateField = (updates: Partial<DeepFormData>) =>
    setFormData(prev => ({ ...prev, ...updates }));

  const canContinue = isStepValid(step, formData);

  const handleContinue = () => {
    if (step < 5) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setComputing(true);
      setTimeout(() => {
        const result = calculateWealthScore(formData);
        sessionStorage.setItem('deepResult', JSON.stringify(result));
        sessionStorage.setItem('deepFormData', JSON.stringify(formData));
        navigate('/deep-result');
      }, 1800);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
    } else {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const stepColor = STEP_COLORS[step - 1];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-2xl mx-auto border-b border-border/40">
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
          <span>fin<span style={{ color: '#FF9933' }}>Health</span></span>
        </button>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: `${stepColor}15`, color: stepColor }}
        >
          Deep Wealth Diagnostic
        </span>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 pb-24">
        {/* Progress */}
        <div className="mb-8">
          {/* Step dots */}
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300"
                  style={
                    i + 1 < step
                      ? { background: stepColor, color: '#fff' }
                      : i + 1 === step
                        ? { background: stepColor, color: '#fff', boxShadow: `0 0 0 3px ${stepColor}30` }
                        : { background: '#f1f5f9', color: '#94a3b8' }
                  }
                >
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                {i < 4 && (
                  <div
                    className="h-0.5 flex-1 rounded-full transition-all duration-500"
                    style={{ background: i + 1 < step ? stepColor : '#f1f5f9' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step title */}
          <div className="mt-4">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{STEPS[step - 1].title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{STEPS[step - 1].subtitle}</p>
          </div>
        </div>

        {/* Step content */}
        {computing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(255,153,51,0.1)' }}
            >
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#FF9933' }} />
            </div>
            <h3 className="text-xl font-bold mb-2">Generating your Wealth Report...</h3>
            <p className="text-muted-foreground text-sm">Analysing 6 dimensions of your financial health</p>
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
              {step === 2 && <StepExpenses data={formData} onChange={updateField} />}
              {step === 3 && <StepAssets data={formData} onChange={updateField} />}
              {step === 4 && <StepProtection data={formData} onChange={updateField} />}
              {step === 5 && <StepGoals data={formData} onChange={updateField} />}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        {!computing && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/60 px-4 py-4">
            <div className="max-w-xl mx-auto flex items-center gap-3">
              <button
                data-testid="deep-back-btn"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                data-testid="deep-continue-btn"
                onClick={handleContinue}
                disabled={!canContinue}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: stepColor, boxShadow: canContinue ? `0 4px 16px ${stepColor}40` : 'none' }}
              >
                {step === 5 ? 'Generate Wealth Report' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
