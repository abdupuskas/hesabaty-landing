import { formatEGP } from '@/lib/money';

export function PnLCard({
  revenue,
  expenses,
  profit,
  locale,
  title,
  revenueLabel,
  costsLabel,
  profitLabel,
  marginLabel,
}: {
  revenue: number;
  expenses: number;
  profit: number;
  locale: string;
  title: string;
  revenueLabel: string;
  costsLabel: string;
  profitLabel: string;
  marginLabel: string;
}) {
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const marginStr =
    margin % 1 === 0 ? `${margin.toFixed(0)}%` : `${margin.toFixed(1)}%`;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      <div className="mt-4 grid grid-cols-3 items-end gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-muted">
            {revenueLabel}
          </div>
          <div className="mt-1 text-base font-semibold tabular-nums text-text">
            {formatEGP(revenue, locale)}
          </div>
        </div>
        <div className="text-center text-2xl text-text-muted">
          <div className="text-[11px] uppercase tracking-wider">{costsLabel}</div>
          <div className="mt-1 text-base font-semibold tabular-nums text-text">
            −{formatEGP(expenses, locale)}
          </div>
        </div>
        <div className="text-end">
          <div className="text-[11px] uppercase tracking-wider text-accent">
            {profitLabel}
          </div>
          <div
            className={`mt-1 text-base font-semibold tabular-nums ${
              profit >= 0 ? 'text-accent' : 'text-danger'
            }`}
          >
            {formatEGP(profit, locale)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="text-text-secondary">{marginLabel}</span>
        <span
          className={`tabular-nums font-medium ${
            margin >= 0 ? 'text-text' : 'text-danger'
          }`}
        >
          {marginStr}
        </span>
      </div>
    </section>
  );
}
