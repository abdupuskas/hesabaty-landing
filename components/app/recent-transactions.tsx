import { Link } from '@/i18n/navigation';
import { formatEGP } from '@/lib/money';
import { formatDate } from '@/lib/date-range';
import type { RecentTransaction } from '@/lib/queries/dashboard';
import { CategoryAvatar } from '@/components/app/category-avatar';

export function RecentTransactions({
  rows,
  locale,
  title,
  empty,
  viewAllLabel,
}: {
  rows: RecentTransaction[];
  locale: string;
  title: string;
  empty: string;
  viewAllLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-medium text-text">{title}</h2>
        {viewAllLabel ? (
          <Link
            href="/app/transactions"
            className="text-xs text-text-secondary hover:text-text transition-colors"
          >
            {viewAllLabel}
          </Link>
        ) : null}
      </header>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-text-secondary">{empty}</p>
      ) : (
        <ul>
          {rows.map((row) => {
            const tone = row.type === 'in' ? 'text-success' : 'text-danger';
            const sign = row.type === 'in' ? '+' : '−';
            return (
              <li
                key={`${row.type}:${row.id}`}
                className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0"
              >
                <CategoryAvatar
                  name={row.label}
                  icon={row.icon}
                  tone={row.type === 'in' ? 'success' : 'danger'}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-text">{row.label}</div>
                  <div className="text-xs text-text-muted">{formatDate(row.date, locale)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`tabular-nums text-sm font-medium ${tone}`}>
                    {sign} {formatEGP(row.amount, locale)}
                  </div>
                  {row.badge ? (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        row.type === 'in'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-text-muted/15 text-text-secondary'
                      }`}
                    >
                      {row.badge}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
