import { DeepFormData, JobStability } from '@/lib/types';
import { fmt } from '@/utils/deepScoring';

interface Props {
  data: DeepFormData;
  onChange: (updates: Partial<DeepFormData>) => void;
}

const JOB_STABILITY_OPTIONS: JobStability[] = ['Very Stable', 'Stable', 'Moderate', 'Uncertain'];

const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 transition-all";
const labelCls = "block text-sm font-medium text-foreground mb-1.5";
const hintCls = "text-xs text-muted-foreground mt-1.5";

export function StepIncome({ data, onChange }: Props) {
  const income = parseFloat(data.monthlyIncome) || 0;
  const secondary = data.hasSecondaryIncome ? parseFloat(data.secondaryIncome) || 0 : 0;
  const totalMonthly = income + secondary;

  return (
    <div className="space-y-5">
      {/* Age */}
      <div>
        <label className={labelCls}>Your Age</label>
        <input
          data-testid="income-age"
          type="number" min="18" max="70" placeholder="e.g. 32"
          value={data.age}
          onChange={e => onChange({ age: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Monthly Income */}
      <div>
        <label className={labelCls}>Monthly Take-Home Income (₹)</label>
        <input
          data-testid="income-monthly"
          type="number" min="0" placeholder="e.g. 150000"
          value={data.monthlyIncome}
          onChange={e => onChange({ monthlyIncome: e.target.value })}
          className={inputCls}
        />
        {income > 0 && (
          <p className={hintCls}>
            Annual income: <strong>{fmt(income * 12)}</strong>
          </p>
        )}
      </div>

      {/* Secondary Income Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => onChange({ hasSecondaryIncome: !data.hasSecondaryIncome })}
            className="relative w-10 h-5 rounded-full transition-colors"
            style={{ background: data.hasSecondaryIncome ? '#FF9933' : '#d1d5db' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: data.hasSecondaryIncome ? 'translateX(20px)' : 'translateX(2px)' }}
            />
          </div>
          <span className="text-sm font-medium text-foreground">I have secondary income</span>
        </label>
        {data.hasSecondaryIncome && (
          <div className="mt-3">
            <input
              data-testid="income-secondary"
              type="number" min="0" placeholder="Monthly secondary income (₹)"
              value={data.secondaryIncome}
              onChange={e => onChange({ secondaryIncome: e.target.value })}
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* Job Stability */}
      <div>
        <label className={labelCls}>Job Stability</label>
        <select
          data-testid="income-job-stability"
          value={data.jobStability}
          onChange={e => onChange({ jobStability: e.target.value as JobStability })}
          className={inputCls}
        >
          <option value="">Select stability level</option>
          {JOB_STABILITY_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Dependents */}
      <div>
        <label className={labelCls}>Number of Dependents</label>
        <input
          data-testid="income-dependents"
          type="number" min="0" max="10" placeholder="0"
          value={data.dependentsCount}
          onChange={e => onChange({ dependentsCount: e.target.value })}
          className={inputCls}
        />
        <p className={hintCls}>Include spouse, children, parents who rely on your income.</p>
      </div>

      {/* Summary hint */}
      {totalMonthly > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(255,153,51,0.08)', color: '#FF9933' }}
        >
          <span>Total monthly income</span>
          <span className="font-bold">{fmt(totalMonthly)}</span>
        </div>
      )}
    </div>
  );
}
