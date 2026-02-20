import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  Shield, TrendingUp, AlertTriangle, CheckCircle2,
  CheckCircle, ArrowRight, Loader2, Users, BarChart3,
} from 'lucide-react';
import { WealthScoreResult, DeepLeadData, WealthPillarScores } from '@/lib/types';
import { fmt } from '@/utils/deepScoring';
import { supabase } from '@/lib/supabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score < 40) return '#ef4444';
  if (score < 60) return '#f97316';
  if (score < 75) return '#eab308';
  return '#22c55e';
}

function getScoreLabel(score: number) {
  if (score < 40) return 'Needs Restructuring';
  if (score < 60) return 'Building Foundations';
  if (score < 75) return 'Wealth in Progress';
  return 'Strong Wealth Profile';
}

const PILLAR_CONFIG: { key: keyof WealthPillarScores; label: string; max: number }[] = [
  { key: 'savingsRate', label: 'Savings Rate', max: 25 },
  { key: 'emergencyFund', label: 'Emergency Fund', max: 15 },
  { key: 'allocationSuitability', label: 'Allocation', max: 20 },
  { key: 'protection', label: 'Protection', max: 15 },
  { key: 'diversification', label: 'Diversification', max: 15 },
  { key: 'stability', label: 'Stability', max: 10 },
];

// ─── Lead Form ────────────────────────────────────────────────────────────────
function LeadForm({ result, intent }: { result: WealthScoreResult; intent: 'masterclass' | 'review' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const lead: DeepLeadData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        wealth_score: result.totalScore,
        savings_rate: Math.round(result.savingsRatePct * 100),
        net_worth: Math.round(result.netWorth),
        allocation_gap: Math.round(result.allocationGap),
      };
      const { error: sbError } = await supabase.from('deep_assessment_leads').insert(lead);
      if (sbError) throw sbError;
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 transition-all";

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        data-testid="deep-success-message"
        className="flex flex-col items-center text-center py-6 gap-3"
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(19,136,8,0.12)' }}>
          <CheckCircle className="w-7 h-7" style={{ color: '#138808' }} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-lg">You're on the list!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {intent === 'masterclass'
              ? "We'll reach out with workshop details and early bird pricing."
              : "Our advisor will contact you within 24 hours for your 1:1 review."}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="deep-lead-form">
      <input
        data-testid="deep-lead-name"
        type="text" placeholder="Your name *" required
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className={inputCls}
        style={{ '--tw-ring-color': '#FF9933' } as React.CSSProperties}
      />
      <input
        data-testid="deep-lead-email"
        type="email" placeholder="Email address *" required
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        className={inputCls}
        style={{ '--tw-ring-color': '#FF9933' } as React.CSSProperties}
      />
      <input
        data-testid="deep-lead-phone"
        type="tel" placeholder="Phone number (optional)"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        className={inputCls}
        style={{ '--tw-ring-color': '#FF9933' } as React.CSSProperties}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        data-testid="deep-lead-submit"
        type="submit"
        disabled={submitting || !form.name.trim() || !form.email.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: '#FF9933' }}
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <>{intent === 'masterclass' ? 'Reserve Masterclass Seat' : 'Request Portfolio Review'}<ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DeepResult() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<WealthScoreResult | null>(null);
  const [activeIntent, setActiveIntent] = useState<'masterclass' | 'review' | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('deepResult');
    if (raw) setResult(JSON.parse(raw));
    else navigate('/');
  }, [navigate]);

  if (!result) return null;

  const scoreColor = getScoreColor(result.totalScore);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * result.totalScore) / 100;

  const radarData = PILLAR_CONFIG.map(({ key, label, max }) => ({
    subject: label,
    score: Math.round((result.pillarScores[key] / max) * 100),
    fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-2xl mx-auto border-b border-border/40">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#FF9933' }}>fH</div>
          <span>fin<span style={{ color: '#FF9933' }}>Health</span></span>
        </button>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(255,153,51,0.1)', color: '#FF9933' }}>
          Wealth Diagnostic Report
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-16 space-y-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Your Wealth Score</h2>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive 6-pillar wealth diagnostic</p>
        </motion.div>

        {/* Score Circle */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          data-testid="wealth-score-circle"
          className="flex flex-col items-center py-8 rounded-2xl bg-card border border-border/60 shadow-sm"
        >
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none"
                stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold" style={{ color: scoreColor }}>{result.totalScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold" style={{ color: scoreColor }}>{getScoreLabel(result.totalScore)}</p>

          {/* Key metrics row */}
          <div className="mt-6 grid grid-cols-3 gap-0 w-full border-t border-border/40 divide-x divide-border/40">
            {[
              { label: 'Net Worth', value: fmt(result.netWorth) },
              { label: 'Savings Rate', value: `${(result.savingsRatePct * 100).toFixed(0)}%` },
              {
                label: 'Equity Gap',
                value: `${result.allocationGap >= 0 ? '+' : ''}${result.allocationGap.toFixed(0)}%`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center py-4 px-2 text-center">
                <span className="text-xs text-muted-foreground mb-1">{label}</span>
                <span className="text-base font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Radar chart — 6 pillars */}
        <div data-testid="wealth-radar-chart" className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-1">6-Pillar Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Score as % of maximum in each dimension</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Radar dataKey="score" stroke="#FF9933" fill="#FF9933" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Pillar bars */}
          <div className="space-y-2.5 mt-4">
            {PILLAR_CONFIG.map(({ key, label, max }, i) => {
              const score = result.pillarScores[key];
              const pct = Math.round((score / max) * 100);
              const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444';
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <span className="text-xs font-semibold" style={{ color }}>{score}/{max}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + 0.08 * i }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {(result.hasProtectionGap || Math.abs(result.allocationGap) > 15) && (
          <div className="space-y-3" data-testid="wealth-alerts">
            {result.hasProtectionGap && (
              <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Protection Gap Detected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Life cover is {result.lifeCoverRatio.toFixed(1)}× income. Recommended: 10× income minimum.
                  </p>
                </div>
              </div>
            )}
            {Math.abs(result.allocationGap) > 15 && (
              <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <BarChart3 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#d97706' }}>Allocation Mismatch</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Equity is {result.allocationGap > 0 ? 'over' : 'under'}-allocated by {Math.abs(result.allocationGap).toFixed(0)}% vs your ideal {result.idealEquityPct.toFixed(0)}%.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        <div data-testid="wealth-recommendations" className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: '#FF9933' }} />
            Your Wealth Action Plan
          </h3>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex gap-3 p-3.5 rounded-xl"
                style={{ background: 'rgba(255,153,51,0.06)' }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#FF9933' }}>
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          data-testid="deep-cta-section"
          className="rounded-2xl overflow-hidden border border-border/40"
        >
          <div
            className="p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #000080 0%, #1a1a8c 60%, #2d1b69 100%)' }}
          >
            <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: '#FF9933' }}>
              Take the next step
            </p>
            <h3 className="text-lg font-bold mb-1">Ready to act on your Wealth Report?</h3>
            <p className="text-sm opacity-80">Choose how you'd like to move forward.</p>
          </div>

          <div className="p-5 bg-card space-y-4">
            {/* CTA Toggle Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                data-testid="cta-masterclass-btn"
                onClick={() => setActiveIntent(activeIntent === 'masterclass' ? null : 'masterclass')}
                className="flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all"
                style={activeIntent === 'masterclass'
                  ? { borderColor: '#FF9933', background: 'rgba(255,153,51,0.08)' }
                  : { borderColor: 'var(--color-border)' }
                }
              >
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,153,51,0.1)' }}>
                  <Users className="w-4 h-4" style={{ color: '#FF9933' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Wealth Masterclass</p>
                  <p className="text-xs text-muted-foreground">Live workshop · ₹999</p>
                </div>
              </button>

              <button
                data-testid="cta-review-btn"
                onClick={() => setActiveIntent(activeIntent === 'review' ? null : 'review')}
                className="flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all"
                style={activeIntent === 'review'
                  ? { borderColor: '#138808', background: 'rgba(19,136,8,0.06)' }
                  : { borderColor: 'var(--color-border)' }
                }
              >
                <div className="p-2 rounded-lg" style={{ background: 'rgba(19,136,8,0.1)' }}>
                  <Shield className="w-4 h-4" style={{ color: '#138808' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">1:1 Portfolio Review</p>
                  <p className="text-xs text-muted-foreground">Advisor-led · Free consultation</p>
                </div>
              </button>
            </div>

            {/* Inline form */}
            {activeIntent && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <LeadForm result={result} intent={activeIntent} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Retake link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Back to Basic Assessment
          </button>
        </div>
      </main>
    </div>
  );
}
