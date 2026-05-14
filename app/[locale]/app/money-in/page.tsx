import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentBusiness } from '@/lib/business';
import {
  listRevenue,
  listSalesChannels,
  listShippingProviders,
  TRANSACTIONS_PAGE_SIZE,
  type RevenueFilter,
} from '@/lib/queries/transactions';
import { formatEGP } from '@/lib/money';
import { formatDate, currentMonthKey, parseMonth } from '@/lib/date-range';
import { ListToolbar } from '@/components/app/list-toolbar';
import { Pagination } from '@/components/app/pagination';
import { NoBusinessState } from '@/components/app/empty-state';
import { FilterSelect } from '@/components/app/filter-select';
import { MonthPicker } from '@/components/app/month-picker';
import { CategoryAvatar } from '@/components/app/category-avatar';
import { Plus } from 'lucide-react';

function parseFilter(value: unknown): RevenueFilter {
  return value === 'paid' || value === 'unpaid' ? value : 'all';
}
function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function MoneyInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    filter?: string;
    page?: string;
    channel?: string;
    shipping?: string;
    month?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.moneyIn');
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
  const channelId = sp.channel ? String(sp.channel) : null;
  const shippingProvider = sp.shipping ? String(sp.shipping) : null;
  const month = parseMonth(sp.month ?? null) ? String(sp.month) : currentMonthKey();

  const [{ rows, total }, channels, shipping] = await Promise.all([
    listRevenue(business.id, {
      page,
      query,
      filter,
      channelId,
      shippingProvider,
      month,
    }),
    listSalesChannels(business.id),
    listShippingProviders(business.id),
  ]);

  const monthTotal = rows.reduce((s, r) => s + r.amount, 0);

  const extras = {
    channel: channelId,
    shipping: shippingProvider,
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
          basePath="/app/money-in"
          query={query}
          filter={filter}
          extras={extras}
          searchPlaceholder={tList('searchPlaceholder')}
          filterLabels={{
            all: tList('filterAll'),
            paid: tList('filterPaid'),
            unpaid: tList('filterUnpaid'),
          }}
          addHref="/app/money-in/new"
          addLabel={t('add')}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <FilterSelect
          param="channel"
          value={channelId ?? ''}
          label={tList('channel')}
          allLabel={tList('channelAll')}
          options={channels.map((c) => ({ value: c.id, label: c.name, icon: c.icon }))}
        />
        <FilterSelect
          param="shipping"
          value={shippingProvider ?? ''}
          label={tList('shipping')}
          allLabel={tList('shippingAll')}
          options={shipping.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <section className="mt-4 rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <p className="text-sm text-text-secondary">{t('empty')}</p>
            <Link
              href="/app/money-in/new"
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
                  href={`/app/money-in/${row.id}/edit`}
                  className="flex flex-1 items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <CategoryAvatar
                    name={row.channel_name ?? row.item_name}
                    icon={row.channel_icon}
                    tone="success"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text">
                      {row.item_name ?? row.channel_name ?? '—'}
                    </div>
                    <div className="text-xs text-text-muted">
                      {row.collected_at ? formatDate(row.collected_at, locale) : '—'}
                      {row.channel_name && row.item_name ? ` · ${row.channel_name}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="tabular-nums text-sm font-medium text-success">
                      {formatEGP(row.amount, locale)}
                    </div>
                    {row.shipping_provider ? (
                      <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                        {row.shipping_provider}
                      </span>
                    ) : row.status === 'unpaid' ? (
                      <span className="rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
                        {tList('filterUnpaid')}
                      </span>
                    ) : (
                      <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-success">
                        {tList('filterPaid')}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          basePath="/app/money-in"
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
