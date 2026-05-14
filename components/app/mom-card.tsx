import { formatEGP } from '@/lib/money';
import type { MonthOverMonth } from '@/lib/queries/reports';

function pctLabel(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  const rounded = Math.round(Math.abs(pct) * 10) / 10;
  const str = rounded % 1 === 0 ? `${Math.round(rounded)}%` : `${rounded.toFixed(1)}%`;
  return pct === 0 ? '0%' : `${sign}${pct < 0 ? '-' : ''}${str.replace('-', '')}`;
}

function chipTone(pct: number, isExpense: boolean): string {
  const positive = isExpense ? pct < 0 : pct > 0;
  if (pct === 0) return 'bg-text-muted/15 text-text-secondary';
  return positive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger';
}

function Row({
  label,
  prev,
  curr,
  pct,
  isExpense,
  locale,
}: {
  label: string;
  prev: number;
  curr: number;
  pct: number;
  isExpense: boolean;
  locale: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="tabular-nums text-text-muted">{formatEGP(prev, locale)}</span>
      <span className="tabular-nums font-medium text-text">›</span>
      <span className="flex items-center gap-2">
        <span className="tabular-nums font-medium text-text">{formatEGP(curr, locale)}</span>
        <span
          className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${chipTone(
            pct,
            isExpense
          )}`}
        >
          {pctLabel(pct)}
        </span>
      </span>
    </div>
  );
}

export function MomCard({
  mom,
  locale,
  title,
  revenueLabel,
  costsLabel,
  profitLabel,
}: {
  mom: MonthOverMonth;
  locale: string;
  title: string;
  revenueLabel: string;
  costsLabel: string;
  profitLabel: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      <div className="mt-3 divide-y divide-border/60">
        <Row
          label={revenueLabel}
          prev={mom.previous.revenue}
          curr={mom.current.revenue}
          pct={mom.revenueChange}
          isExpense={false}
          locale={locale}
        />
        <Row
          label={costsLabel}
          prev={mom.previous.expenses}
          curr={mom.current.expenses}
          pct={mom.expensesChange}
          isExpense={true}
          locale={locale}
        />
        <Row
          label={profitLabel}
          prev={mom.previous.profit}
          curr={mom.current.profit}
          pct={mom.profitChange}
          isExpense={false}
          locale={locale}
        />
      </div>
    </section>
  );
}
