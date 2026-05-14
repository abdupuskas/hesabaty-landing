import { Link } from '@/i18n/navigation';
import { formatEGP } from '@/lib/money';
import type { Breakdown } from '@/lib/queries/reports';

export function BreakdownList({
  title,
  rows,
  total,
  locale,
  empty,
  tone,
  uncategorizedLabel,
  drillBase,
}: {
  title: string;
  rows: Breakdown[];
  total: number;
  locale: string;
  empty: string;
  tone: 'success' | 'danger';
  uncategorizedLabel: string;
  drillBase?: '/app/channels' | '/app/categories';
}) {
  const barColor = tone === 'success' ? 'bg-success/70' : 'bg-danger/70';
  const top = rows.slice(0, 6);

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-medium text-text">{title}</h2>
      </header>
      {top.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-text-secondary">{empty}</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {top.map((row) => {
            const pct = total === 0 ? 0 : (row.amount / total) * 100;
            const canDrill = drillBase && row.id;
            const inner = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-text">
                    {row.name || uncategorizedLabel}
                  </span>
                  <span className="tabular-nums text-sm font-medium text-text">
                    {formatEGP(row.amount, locale)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
                  <div
                    className={`h-full ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                  <span>{row.count}×</span>
                  <span className="tabular-nums">{pct.toFixed(0)}%</span>
                </div>
              </>
            );
            return (
              <li key={row.id ?? '__uncat__'}>
                {canDrill ? (
                  <Link
                    href={`${drillBase}/${row.id}` as `/${string}`}
                    className="block px-5 py-3 hover:bg-background/40 transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="px-5 py-3">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
