import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentBusiness } from '@/lib/business';
import {
  listExpenses,
  listExpenseCategories,
  TRANSACTIONS_PAGE_SIZE,
  type ExpenseFilter,
} from '@/lib/queries/transactions';
import { getExpenseBreakdownByMonth } from '@/lib/queries/reports';
import { formatEGP } from '@/lib/money';
import { formatDate, currentMonthKey, parseMonth } from '@/lib/date-range';
import { ListToolbar } from '@/components/app/list-toolbar';
import { Pagination } from '@/components/app/pagination';
import { NoBusinessState } from '@/components/app/empty-state';
import { FilterSelect } from '@/components/app/filter-select';
import { MonthPicker } from '@/components/app/month-picker';
import { CategoryAvatar } from '@/components/app/category-avatar';
import { Plus, ChevronRight } from 'lucide-react';

function parseFilter(value: unknown): ExpenseFilter {
  return value === 'paid' || value === 'unpaid' ? value : 'all';
}
function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function MoneyOutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    filter?: string;
    page?: string;
    category?: string;
    month?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.moneyOut');
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
  const categoryId = sp.category ? String(sp.category) : null;
  const month = parseMonth(sp.month ?? null) ? String(sp.month) : currentMonthKey();
  const showBreakdown = !categoryId && !query && filter === 'all';

  const [{ rows, total }, categories, breakdown] = await Promise.all([
    listExpenses(business.id, {
      page,
      query,
      filter,
      categoryId,
      month,
    }),
    listExpenseCategories(business.id),
    showBreakdown ? getExpenseBreakdownByMonth(business.id, month) : Promise.resolve([]),
  ]);

  const monthTotal = breakdown.length
    ? breakdown.reduce((s, b) => s + b.amount, 0)
    : rows.reduce((s, r) => s + r.amount, 0);

  const extras = {
    category: categoryId,
    month,
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {tList('totalThisMonth')}{' '}
            <span className="font-semibold text-text">{formatEGP(monthTotal, locale)}</span>
          </p>
        </div>
        <MonthPicker value={month} locale={locale} />
      </div>

      <div className="mt-6">
        <ListToolbar
          basePath="/app/money-out"
          query={query}
          filter={filter}
          extras={extras}
          searchPlaceholder={tList('searchPlaceholder')}
          filterLabels={{
            all: tList('filterAll'),
            paid: tList('filterPaid'),
            unpaid: tList('filterUnpaid'),
          }}
          addHref="/app/money-out/new"
          addLabel={t('add')}
        />
      </div>

      <div className="mt-4">
        <FilterSelect
          param="category"
          value={categoryId ?? ''}
          label={tList('category')}
          allLabel={tList('categoryAll')}
          options={categories.map((c) => ({ value: c.id, label: c.name, icon: c.icon }))}
        />
      </div>

      {showBreakdown && breakdown.length > 0 ? (
        <section className="mt-4 rounded-xl border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium text-text">{tList('byCategory')}</h2>
          </header>
          <ul className="divide-y divide-border/60">
            {breakdown.map((b) => {
              const href = b.id ? `/app/money-out?category=${b.id}&month=${month}` : null;
              const inner = (
                <div className="flex items-center gap-3 px-5 py-3">
                  <CategoryAvatar name={b.name} icon={b.icon} tone="danger" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-text">
                      {b.name || tList('uncategorized')}
                    </div>
                    <div className="text-xs text-text-muted">{b.count}×</div>
                  </div>
                  <span className="tabular-nums text-sm font-semibold text-text">
                    {formatEGP(b.amount, locale)}
                  </span>
                  {href ? (
                    <ChevronRight size={14} strokeWidth={1.75} className="text-text-muted" />
                  ) : null}
                </div>
              );
              return (
                <li key={b.id ?? '__uncat__'}>
                  {href ? (
                    <Link
                      href={href as `/${string}`}
                      className="block hover:bg-background/40 transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-4 rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <p className="text-sm text-text-secondary">{t('empty')}</p>
            <Link
              href="/app/money-out/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors"
            >
              <Plus size={14} strokeWidth={2} />
              {t('addFirst')}
            </Link>
          </div>
        ) : (
          <ul>
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-4 border-b border-border/60 px-5 py-3 last:border-b-0"
              >
                <Link
                  href={`/app/money-out/${row.id}/edit`}
                  className="flex flex-1 items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <CategoryAvatar
                    name={row.category_name ?? row.name ?? row.vendor}
                    icon={row.category_icon}
                    tone="danger"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text">
                      {row.name ?? row.vendor ?? row.category_name ?? '—'}
                    </div>
                    <div className="text-xs text-text-muted">
                      {row.paid_at
                        ? formatDate(row.paid_at, locale)
                        : row.due_date
                          ? formatDate(row.due_date, locale)
                          : '—'}
                      {row.category_name && (row.name || row.vendor)
                        ? ` · ${row.category_name}`
                        : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="tabular-nums text-sm font-medium text-danger">
                      {formatEGP(row.amount, locale)}
                    </div>
                    {!row.paid_at ? (
                      <span className="rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
                        {tList('filterUnpaid')}
                      </span>
                    ) : (
                      <span className="rounded-md bg-text-muted/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        EXP
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          basePath="/app/money-out"
          page={page}
          total={total}
          pageSize={TRANSACTIONS_PAGE_SIZE}
          query={query}
          filter={filter}
          extras={extras}
          prevLabel={tList('previous')}
          nextLabel={tList('next')}
          pageLabel={(n) => tList('page', { n })}
        />
      </section>
    </div>
  );
}
