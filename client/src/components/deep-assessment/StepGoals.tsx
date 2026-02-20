import { DeepFormData, RiskComfort } from '@/lib/types';

interface Props {
  data: DeepFormData;
  onChange: (updates: Partial<DeepFormData>) => void;
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 transition-all";
const labelCls = "block text-sm font-medium text-foreground mb-1.5";
const hintCls = "text-xs text-muted-foreground mt-1.5";

const GOALS = [
  'Financial Freedom', 'Early Retirement', 'Buy a Home',
  "Children's Education", 'Wealth Accumulation', 'Debt Freedom',
];

const RISK_OPTIONS: { value: RiskComfort; label: string; desc: string }[] = [
  { value: 'Conservative', label: 'Conservative', desc: 'Preserve capital, low volatility' },
  { value: 'Moderate', label: 'Moderate', desc: 'Balanced growth and stability' },
  { value: 'Aggressive', label: 'Aggressive', desc: 'Maximise returns, high growth' },
];

export function StepGoals({ data, onChange }: Props) {
  const age = parseFloat(data.age) || 0;
  const retirementAge = parseFloat(data.retirementAge) || 0;
  const yearsToRetirement = retirementAge > age ? retirementAge - age : 0;

  return (
    <div className="space-y-5">
      {/* Retirement Age */}
      <div>
        <label className={labelCls}>Desired Retirement Age</label>
        <input
          data-testid="goals-retirement-age"
          type="number" min={age + 1} max="80" placeholder="e.g. 55"
          value={data.retirementAge}
          onChange={e => onChange({ retirementAge: e.target.value })}
          className={inputCls}
        />
        {retirementAge > 0 && age > 0 && (
          <p className={hintCls} style={{ color: '#FF9933' }}>
            {yearsToRetirement > 0
              ? `${yearsToRetirement} years to build your retirement corpus.`
              : 'Set a retirement age beyond your current age.'}
          </p>
        )}
      </div>

      {/* Primary Goal */}
      <div>
        <label className={labelCls}>Your Biggest Financial Goal</label>
        <select
          data-testid="goals-primary"
          value={data.primaryGoal}
          onChange={e => onChange({ primaryGoal: e.target.value })}
          className={inputCls}
        >
          <option value="">Select your primary goal</option>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Risk Comfort */}
      <div>
        <label className={labelCls}>Risk Comfort Level</label>
        <div className="space-y-2">
          {RISK_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              data-testid={`risk-${value.toLowerCase()}`}
              onClick={() => onChange({ riskComfort: value })}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all"
              style={data.riskComfort === value
                ? { borderColor: '#FF9933', background: 'rgba(255,153,51,0.08)' }
                : { borderColor: 'var(--color-border)' }
              }
            >
              <div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: data.riskComfort === value ? '#FF9933' : 'var(--color-foreground)' }}
                >
                  {label}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: data.riskComfort === value ? '#FF9933' : '#d1d5db' }}
              >
                {data.riskComfort === value && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#FF9933' }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time horizon summary */}
      {retirementAge > 0 && data.primaryGoal && data.riskComfort && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(0,0,128,0.05)', border: '1px solid rgba(0,0,128,0.12)' }}
        >
          <p className="font-medium text-foreground mb-0.5">Your Wealth Horizon</p>
          <p className="text-muted-foreground text-xs">
            {yearsToRetirement}yr horizon · {data.primaryGoal} · {data.riskComfort} risk —
            your wealth score will reflect this profile.
          </p>
        </div>
      )}
    </div>
  );
}
