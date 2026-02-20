import { DeepFormData } from '@/lib/types';
import { fmt } from '@/utils/deepScoring';

interface Props {
  data: DeepFormData;
  onChange: (updates: Partial<DeepFormData>) => void;
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 transition-all";
const labelCls = "block text-sm font-medium text-foreground mb-1.5";
const hintCls = "text-xs text-muted-foreground mt-1.5";

export function StepProtection({ data, onChange }: Props) {
  const income = parseFloat(data.monthlyIncome) || 0;
  const secondary = data.hasSecondaryIncome ? parseFloat(data.secondaryIncome) || 0 : 0;
  const annualIncome = (income + secondary) * 12;

  const lifeCover = parseFloat(data.lifeCoverageAmount) || 0;
  const healthCover = parseFloat(data.healthCoverageAmount) || 0;
  const emergencyMonths = parseFloat(data.emergencyFundMonths) || 0;

  const requiredLifeCover = annualIncome * 10;
  const lifeCoverRatio = annualIncome > 0 ? lifeCover / annualIncome : 0;
  const lifeCoverOk = lifeCoverRatio >= 10;
  const healthCoverOk = healthCover >= 500_000;
  const emergencyOk = emergencyMonths >= 6;

  return (
    <div className="space-y-5">
      {/* Life Insurance */}
      <div>
        <label className={labelCls}>Total Life Insurance Coverage (₹)</label>
        <input
          data-testid="protection-life"
          type="number" min="0" placeholder="e.g. 10000000"
          value={data.lifeCoverageAmount}
          onChange={e => onChange({ lifeCoverageAmount: e.target.value })}
          className={inputCls}
        />
        {annualIncome > 0 && (
          <p className={hintCls} style={{ color: lifeCoverOk ? '#22c55e' : '#f97316' }}>
            You have <strong>{lifeCoverRatio.toFixed(1)}×</strong> income cover
            {lifeCoverOk
              ? ' — well protected.'
              : `. Recommended: ${fmt(requiredLifeCover)} (10× income).`}
          </p>
        )}
      </div>

      {/* Health Insurance */}
      <div>
        <label className={labelCls}>Health Insurance Coverage (₹)</label>
        <input
          data-testid="protection-health"
          type="number" min="0" placeholder="e.g. 1000000"
          value={data.healthCoverageAmount}
          onChange={e => onChange({ healthCoverageAmount: e.target.value })}
          className={inputCls}
        />
        {healthCover > 0 && (
          <p className={hintCls} style={{ color: healthCoverOk ? '#22c55e' : '#f97316' }}>
            {healthCoverOk
              ? `${fmt(healthCover)} — adequate coverage.`
              : `${fmt(healthCover)} — below recommended ₹5 Lakhs minimum.`}
          </p>
        )}
      </div>

      {/* Emergency Fund */}
      <div>
        <label className={labelCls}>Emergency Fund (months of expenses saved)</label>
        <input
          data-testid="protection-emergency"
          type="number" min="0" max="36" step="0.5" placeholder="e.g. 3"
          value={data.emergencyFundMonths}
          onChange={e => onChange({ emergencyFundMonths: e.target.value })}
          className={inputCls}
        />
        {emergencyMonths > 0 && (
          <p className={hintCls} style={{ color: emergencyOk ? '#22c55e' : '#f97316' }}>
            {emergencyOk
              ? `${emergencyMonths} months saved — you're well-covered.`
              : `${emergencyMonths} month${emergencyMonths !== 1 ? 's' : ''} saved — target is 6 months.`}
          </p>
        )}
      </div>

      {/* Protection status card */}
      {(lifeCover > 0 || healthCover > 0) && (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="px-4 py-2 bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Protection Status
            </span>
          </div>
          {[
            { label: 'Life Cover', ok: lifeCoverOk, detail: lifeCover > 0 ? `${fmt(lifeCover)} (${lifeCoverRatio.toFixed(1)}×)` : 'Not entered' },
            { label: 'Health Cover', ok: healthCoverOk, detail: healthCover > 0 ? fmt(healthCover) : 'Not entered' },
            { label: 'Emergency Fund', ok: emergencyOk, detail: `${emergencyMonths} months` },
          ].map(({ label, ok, detail }) => (
            <div key={label} className="px-4 py-2.5 flex items-center justify-between border-t border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: ok ? '#22c55e' : '#f97316' }} />
                <span className="text-sm text-foreground">{label}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
