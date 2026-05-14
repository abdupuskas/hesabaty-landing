import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentBusiness } from '@/lib/business';
import {
  listAllTransactions,
  ALL_TX_PAGE_SIZE,
  type TxFilter,
} from '@/lib/queries/transactions-all';
import { formatEGP } from '@/lib/money';
import { formatDate } from '@/lib/date-range';
import { Pagination } from '@/components/app/pagination';
import { NoBusinessState } from '@/components/app/empty-state';
import { CategoryAvatar } from '@/components/app/category-avatar';

function parseFilter(value: unknown): TxFilter {
  return value === 'in' || value === 'out' ? value : 'all';
}
function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function TransactionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.transactions');
  const tList = await getTranslations('app.list');
  const tDash = await getTranslations('app.dashboard');

  const business = await getCurrentBusiness();
  if (!business) {
    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <div className="mt-10">
          <NoBusinessState
            title={tDash('noBusiness.title')}
            body={tDash('noBusiness.body')}
            cta={tDash('noBusiness.cta')}
          />
        </div>
      </div>
    );
  }

  const query = String(sp.q ?? '').trim();
  const filter = parseFilter(sp.filter);
  const page = parsePage(sp.page);

  const { rows, total } = await listAllTransactions(business.id, { page, query, filter });

  const filters: TxFilter[] = ['all', 'in', 'out'];
  const filterLabels: Record<TxFilter, string> = {
    all: tList('filterAll'),
    in: tDash('moneyIn'),
    out: tDash('moneyOut'),
  };
  const buildHref = (next: TxFilter) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (next !== 'all') params.set('filter', next);
    const qs = params.toString();
    return qs ? `/app/transactions?${qs}` : '/app/transactions';
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/app/transactions" method="get" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={tList('searchPlaceholder')}
            className="w-56 rounded-md border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          {filter !== 'all' ? <input type="hidden" name="filter" value={filter} /> : null}
        </form>
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => {
            const active = f === filter;
            return (
              <Link
                key={f}
                href={buildHref(f) as `/${string}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-card text-text-secondary hover:text-text hover:border-text-muted'
                }`}
              >
                {filterLabels[f]}
              </Link>
            );
          })}
        </div>
      </div>

      <section className="mt-4 rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-text-secondary">{t('empty')}</p>
        ) : (
          <ul>
            {rows.map((row) => {
              const tone = row.type === 'in' ? 'text-success' : 'text-danger';
              const sign = row.type === 'in' ? '+' : '−';
              const editHref =
                row.type === 'in'
                  ? `/app/money-in/${row.id}/edit`
                  : `/app/money-out/${row.id}/edit`;
              return (
                <li
                  key={`${row.type}:${row.id}`}
                  className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0"
                >
                  <Link
                    href={editHref as `/${string}`}
                    className="flex flex-1 items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <CategoryAvatar
                      name={row.taxonomy ?? row.label}
                      icon={row.icon}
                      tone={row.type === 'in' ? 'success' : 'danger'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text">{row.label}</div>
                      <div className="truncate text-xs text-text-muted">
                        {formatDate(row.date, locale)}
                        {row.taxonomy && row.taxonomy !== row.label ? ` · ${row.taxonomy}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`tabular-nums text-sm font-medium ${tone}`}>
                        {sign} {formatEGP(row.amount, locale)}
                      </div>
                      {row.type === 'in' && row.badge ? (
                        <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                          {row.badge}
                        </span>
                      ) : row.type === 'out' ? (
                        <span className="rounded-md bg-text-muted/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                          EXP
                        </span>
                      ) : !row.paid ? (
                        <span className="rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
                          {tList('filterUnpaid')}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination
          basePath="/app/transactions"
          page={page}
          total={total}
          pageSize={ALL_TX_PAGE_SIZE}
          query={query}
          filter={filter}
          prevLabel={tList('previous')}
          nextLabel={tList('next')}
          pageLabel={(n) => tList('page', { n })}
        />
      </section>
    </div>
  );
}
