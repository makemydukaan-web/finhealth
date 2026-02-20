import { DeepFormData, HousingStatus } from '@/lib/types';
import { fmt } from '@/utils/deepScoring';

interface Props {
  data: DeepFormData;
  onChange: (updates: Partial<DeepFormData>) => void;
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 transition-all";
const labelCls = "block text-sm font-medium text-foreground mb-1.5";
const hintCls = "text-xs text-muted-foreground mt-1.5";

export function StepExpenses({ data, onChange }: Props) {
  const income = parseFloat(data.monthlyIncome) || 0;
  const secondary = data.hasSecondaryIncome ? parseFloat(data.secondaryIncome) || 0 : 0;
  const totalIncome = income + secondary;
  const expenses = parseFloat(data.monthlyExpenses) || 0;
  const emi = parseFloat(data.emiAmount) || 0;

  const savings = totalIncome - expenses - emi;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  const emiRatio = totalIncome > 0 ? (emi / totalIncome) * 100 : 0;

  const getSavingsColor = (rate: number) =>
    rate >= 35 ? '#22c55e' : rate >= 20 ? '#f97316' : '#ef4444';

  return (
    <div className="space-y-5">
      {/* Monthly Expenses */}
      <div>
        <label className={labelCls}>Monthly Expenses (₹)</label>
        <input
          data-testid="expense-monthly"
          type="number" min="0" placeholder="e.g. 60000"
          value={data.monthlyExpenses}
          onChange={e => onChange({ monthlyExpenses: e.target.value })}
          className={inputCls}
        />
        <p className={hintCls}>Include rent, groceries, utilities, subscriptions — all regular spending.</p>
      </div>

      {/* EMI */}
      <div>
        <label className={labelCls}>Total Monthly EMI (₹)</label>
        <input
          data-testid="expense-emi"
          type="number" min="0" placeholder="0 if no EMIs"
          value={data.emiAmount}
          onChange={e => onChange({ emiAmount: e.target.value })}
          className={inputCls}
        />
        {emi > 0 && totalIncome > 0 && (
          <p className={hintCls} style={{ color: emiRatio > 40 ? '#ef4444' : undefined }}>
            EMI burden: <strong>{emiRatio.toFixed(0)}% of income</strong>
            {emiRatio > 40 && ' — High! Ideally below 35%.'}
          </p>
        )}
      </div>

      {/* Housing */}
      <div>
        <label className={labelCls}>Do you rent or own your home?</label>
        <div className="grid grid-cols-2 gap-3">
          {(['Own', 'Rent'] as HousingStatus[]).map(opt => (
            <button
              key={opt}
              type="button"
              data-testid={`housing-${opt.toLowerCase()}`}
              onClick={() => onChange({ housingStatus: opt })}
              className="py-3 rounded-xl border text-sm font-medium transition-all"
              style={data.housingStatus === opt
                ? { borderColor: '#FF9933', background: 'rgba(255,153,51,0.08)', color: '#FF9933' }
                : { borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }
              }
            >
              {opt === 'Own' ? 'Own Home' : 'Renting'}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic summary */}
      {expenses > 0 && totalIncome > 0 && (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="px-4 py-2 bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Cash Flow
            </span>
          </div>
          <div className="divide-y divide-border/40">
            <div className="px-4 py-2.5 flex justify-between text-sm">
              <span className="text-muted-foreground">Income</span>
              <span className="font-medium">{fmt(totalIncome)}</span>
            </div>
            <div className="px-4 py-2.5 flex justify-between text-sm">
              <span className="text-muted-foreground">Expenses + EMI</span>
              <span className="font-medium">− {fmt(expenses + emi)}</span>
            </div>
            <div className="px-4 py-2.5 flex justify-between text-sm font-semibold">
              <span>Savings</span>
              <span style={{ color: getSavingsColor(savingsRate) }}>
                {fmt(savings)} ({savingsRate.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
