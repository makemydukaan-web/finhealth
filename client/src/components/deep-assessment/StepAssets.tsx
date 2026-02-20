import { DeepFormData } from '@/lib/types';
import { fmt } from '@/utils/deepScoring';

interface Props {
  data: DeepFormData;
  onChange: (updates: Partial<DeepFormData>) => void;
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 transition-all";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

const ASSET_FIELDS: { key: keyof DeepFormData; label: string; hint?: string }[] = [
  { key: 'equityAssets', label: 'Equity (MF + Stocks)', hint: 'Current market value' },
  { key: 'fixedIncome', label: 'Fixed Income (FD, Bonds)', hint: 'Total FD/bond value' },
  { key: 'epfPpfNps', label: 'EPF / PPF / NPS' },
  { key: 'goldAssets', label: 'Gold (physical + digital)' },
  { key: 'cashAssets', label: 'Cash & Savings Account' },
];

export function StepAssets({ data, onChange }: Props) {
  const age = parseFloat(data.age) || 30;
  const equity = parseFloat(data.equityAssets) || 0;
  const fixed = parseFloat(data.fixedIncome) || 0;
  const epf = parseFloat(data.epfPpfNps) || 0;
  const gold = parseFloat(data.goldAssets) || 0;
  const realEstate = parseFloat(data.realEstateTotal) || 0;
  const primary = parseFloat(data.primaryResidenceValue) || 0;
  const cash = parseFloat(data.cashAssets) || 0;

  const netWorth = equity + fixed + epf + gold + realEstate + cash;
  const investableBase = equity + fixed + epf + gold + Math.max(0, realEstate - primary) + cash;
  const equityPct = investableBase > 0 ? (equity / investableBase) * 100 : 0;
  const idealEquityPct = Math.min(100 - age, 75);

  return (
    <div className="space-y-4">
      {/* Asset inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ASSET_FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className={labelCls}>{label} (₹)</label>
            <input
              data-testid={`asset-${key}`}
              type="number" min="0" placeholder="0"
              value={data[key] as string}
              onChange={e => onChange({ [key]: e.target.value })}
              className={inputCls}
            />
            {hint && <p className="text-xs text-muted-foreground/70 mt-0.5">{hint}</p>}
          </div>
        ))}
      </div>

      {/* Real estate — full width with sub-field */}
      <div className="rounded-xl border border-border/60 p-4 space-y-3">
        <div>
          <label className={labelCls}>Real Estate — Total Market Value (₹)</label>
          <input
            data-testid="asset-realEstate"
            type="number" min="0" placeholder="0"
            value={data.realEstateTotal}
            onChange={e => onChange({ realEstateTotal: e.target.value })}
            className={inputCls}
          />
        </div>
        {parseFloat(data.realEstateTotal) > 0 && (
          <div>
            <label className={labelCls}>
              of which, Primary Residence value (₹)
              <span className="ml-1 text-muted-foreground/60">— excluded from allocation check</span>
            </label>
            <input
              data-testid="asset-primaryResidence"
              type="number" min="0" placeholder="0"
              value={data.primaryResidenceValue}
              onChange={e => onChange({ primaryResidenceValue: e.target.value })}
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* Live summary */}
      {netWorth > 0 && (
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ background: 'rgba(0,0,128,0.04)', border: '1px solid rgba(0,0,128,0.12)' }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Net Worth</span>
            <span className="font-bold text-foreground">{fmt(netWorth)}</span>
          </div>
          {investableBase > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Equity %</span>
                <span
                  className="font-semibold"
                  style={{ color: Math.abs(equityPct - idealEquityPct) <= 10 ? '#22c55e' : '#f97316' }}
                >
                  {equityPct.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ideal Equity % (age-based)</span>
                <span className="font-semibold" style={{ color: '#FF9933' }}>{idealEquityPct.toFixed(0)}%</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
