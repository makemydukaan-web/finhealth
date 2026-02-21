import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ScoreResult, LeadData, Stage1Answers } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { questions } from "@/lib/quiz-data";

interface ResultsViewProps {
  result: ScoreResult;
  answers: Record<number, string>;
}

const PILLAR_CONFIG = [
  { key: "savingsRate", label: "Savings Rate", max: 25, icon: TrendingUp },
  { key: "emergencyFund", label: "Emergency Fund", max: 25, icon: Shield },
  { key: "riskAlignment", label: "Risk Alignment", max: 20, icon: TrendingUp },
  { key: "debtHealth", label: "Debt Health", max: 15, icon: AlertTriangle },
  { key: "insurance", label: "Insurance Cover", max: 15, icon: Shield },
] as const;

const ALLOCATION_COLORS = {
  equity: "#FF9933",
  debt: "#000080",
  gold: "#EAB308",
};

function getScoreColor(score: number) {
  if (score < 40) return "#ef4444";
  if (score < 60) return "#f97316";
  if (score < 75) return "#eab308";
  return "#22c55e";
}

function getScoreLabel(score: number) {
  if (score < 40) return "Needs Attention";
  if (score < 60) return "Getting Started";
  if (score < 75) return "On the Right Track";
  return "Excellent Shape";
}

function formatAmount(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Crores`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} Lakhs`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function ResultsView({ result, answers }: ResultsViewProps) {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", notify: true });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert answers to Stage1Answers format for the Ignite flow
  const handleUnlockIgnite = () => {
    const stage1Data: Stage1Answers = {
      age: answers[1] || '',
      monthlyIncome: answers[2] || '',
      monthlyExpenses: answers[3] || '',
      totalSavings: answers[4] || '',
      loans: answers[5] || '',
      insurance: answers[6] || '',
      marketBehavior: answers[7] || '',
      primaryGoal: answers[8] || '',
    };
    sessionStorage.setItem('stage1Data', JSON.stringify(stage1Data));
    navigate('/teaser');
  };

  const scoreColor = getScoreColor(result.score);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * result.score) / 100;

  const pieData = [
    { name: "Equity", value: result.equity },
    { name: "Debt", value: result.debt },
    { name: "Gold", value: result.gold },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const leadData: LeadData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        score: result.score,
        equity_percent: result.equity,
        debt_percent: result.debt,
        gold_percent: result.gold,
        emergency_required: Math.round(result.emergencyRequired),
        interested: form.notify,
      };
      const { error: sbError } = await supabase.from("leads").insert(leadData);
      if (sbError) throw sbError;
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 py-8 pb-20 space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">
          Your Financial Health Report
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Personalised score based on your profile
        </p>
      </div>

      {/* Score Circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        data-testid="score-circle"
        className="flex flex-col items-center py-6 rounded-2xl bg-card border border-border/60 shadow-sm"
      >
        <p className="text-sm font-medium text-muted-foreground mb-4">
          Financial Health Score
        </p>
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: scoreColor }}>
              {result.score}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="mt-3 text-base font-semibold" style={{ color: scoreColor }}>
          {getScoreLabel(result.score)}
        </p>
      </motion.div>

      {/* Pillar Breakdown */}
      <div data-testid="pillar-breakdown" className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-4">Score Breakdown</h3>
        <div className="space-y-3">
          {PILLAR_CONFIG.map(({ key, label, max }, i) => {
            const score = result.pillarBreakdown[key];
            const pct = Math.round((score / max) * 100);
            const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f97316" : "#ef4444";
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-sm font-semibold" style={{ color }}>
                    {score}/{max}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + 0.1 * i }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Asset Allocation Pie */}
      <div data-testid="allocation-chart" className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-1">Recommended Allocation</h3>
        <p className="text-xs text-muted-foreground mb-4">Based on your age and risk profile</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill={ALLOCATION_COLORS.equity} />
                <Cell fill={ALLOCATION_COLORS.debt} />
                <Cell fill={ALLOCATION_COLORS.gold} />
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, ""]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  fontSize: "13px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs font-medium text-foreground ml-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Allocation chips */}
        <div className="flex gap-3 justify-center mt-2">
          {pieData.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: `${Object.values(ALLOCATION_COLORS)[i]}18`,
                color: Object.values(ALLOCATION_COLORS)[i],
              }}
            >
              {d.name} {d.value}%
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Fund */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        data-testid="emergency-fund-card"
        className="rounded-2xl p-5 border"
        style={{ background: "rgba(19,136,8,0.06)", borderColor: "rgba(19,136,8,0.2)" }}
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(19,136,8,0.12)" }}>
            <Shield className="w-5 h-5" style={{ color: "#138808" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-0.5" style={{ color: "#0d6b05" }}>
              Emergency Fund Target
            </h3>
            <p className="text-2xl font-bold mb-1" style={{ color: "#138808" }}>
              {formatAmount(result.emergencyRequired)}
            </p>
            <p className="text-xs" style={{ color: "#138808", opacity: 0.8 }}>
              6 months of expenses — keep in a liquid fund or high-yield savings account.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Items */}
      <div data-testid="action-items" className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" style={{ color: "#FF9933" }} />
          Your 3-Step Action Plan
        </h3>
        <div className="space-y-3">
          {result.actionItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex gap-3 p-3.5 rounded-xl"
              style={{ background: "rgba(255,153,51,0.06)" }}
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "#FF9933" }}
              >
                {index + 1}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unlock Ignite Dashboard CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        data-testid="unlock-ignite-diagnostic"
        className="rounded-2xl overflow-hidden border-2"
        style={{ borderColor: '#000080', background: 'linear-gradient(135deg, #000080 0%, #1a1a8c 100%)' }}
      >
        <div className="p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full" style={{ background: 'rgba(255,153,51,0.1)' }} />
          <div className="absolute -left-4 -top-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ background: 'rgba(255,153,51,0.2)', color: '#FF9933' }}>
              <Sparkles className="w-3 h-3" />
              FREE · 2 Minutes
            </span>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Unlock Your Ignite Dashboard</h3>
            <p className="text-sm opacity-80 mb-5 leading-relaxed">
              Get your complete Wealth Score with retirement projections, portfolio analysis, and personalized action plan.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {['Retirement Simulator', 'Portfolio Analysis', 'Protection Check', 'Peer Benchmarks'].map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}>
                  {tag}
                </span>
              ))}
            </div>
            <button
              data-testid="unlock-ignite-btn"
              onClick={handleUnlockIgnite}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: '#FF9933', color: '#fff', boxShadow: '0 4px 20px rgba(255,153,51,0.4)' }}
            >
              <Sparkles className="w-4 h-4" />
              Unlock Ignite Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Workshop CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        data-testid="workshop-section"
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "rgba(255,153,51,0.25)" }}
      >
        {/* Header */}
        <div
          className="p-5 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #000080 0%, #1a1a8c 100%)" }}
        >
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
            style={{ background: "rgba(255,153,51,0.12)" }}
          />
          <div className="relative">
            <span
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2"
              style={{ background: "rgba(255,153,51,0.2)", color: "#FF9933" }}
            >
              Live Wealth Workshop
            </span>
            <h3 className="text-lg font-bold mb-1">
              Want a deeper financial blueprint?
            </h3>
            <p className="text-sm opacity-80 mb-0">
              Join our expert-led workshop and build a personalised wealth roadmap.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 bg-card">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              data-testid="success-message"
              className="flex flex-col items-center text-center py-4 gap-3"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(19,136,8,0.12)" }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: "#138808" }} />
              </div>
              <div>
                <p className="font-semibold text-foreground">You're on the list!</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  We'll notify you when the next session is live.
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" data-testid="workshop-form">
              <p className="text-sm font-medium text-foreground mb-3">
                Notify me about upcoming sessions — Live Workshop at{" "}
                <span className="font-bold" style={{ color: "#138808" }}>
                  ₹999
                </span>
              </p>

              <div>
                <input
                  data-testid="workshop-name"
                  type="text"
                  placeholder="Your name *"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": "#FF9933" } as React.CSSProperties}
                />
              </div>
              <div>
                <input
                  data-testid="workshop-email"
                  type="email"
                  placeholder="Email address *"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": "#FF9933" } as React.CSSProperties}
                />
              </div>
              <div>
                <input
                  data-testid="workshop-phone"
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": "#FF9933" } as React.CSSProperties}
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  data-testid="workshop-notify-checkbox"
                  type="checkbox"
                  checked={form.notify}
                  onChange={(e) => setForm((f) => ({ ...f, notify: e.target.checked }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#FF9933" }}
                />
                <span className="text-sm text-foreground/80">
                  Notify me about upcoming sessions
                </span>
              </label>

              {error && (
                <p data-testid="workshop-error" className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <button
                data-testid="workshop-submit-btn"
                type="submit"
                disabled={submitting || !form.name.trim() || !form.email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#FF9933" }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Reserve My Spot
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
