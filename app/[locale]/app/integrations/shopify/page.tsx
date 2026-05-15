import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Store, Clock, ShoppingBag, GitMerge, ChevronRight, ChevronLeft } from 'lucide-react';
import { getCurrentBusiness } from '@/lib/business';
import { getShopifyIntegration, listShopifyOrders } from '@/lib/queries/shopify';
import { formatEGP } from '@/lib/money';
import { formatDate, parseMonth, currentMonthKey } from '@/lib/date-range';
import { ShopifyActions } from '@/components/app/shopify-actions';
import { ShopifyConnectForm } from '@/components/app/shopify-connect-form';
import { NoBusinessState } from '@/components/app/empty-state';
import { Pagination } from '@/components/app/pagination';
import { MonthPicker } from '@/components/app/month-picker';

const PAGE_SIZE = 100;

function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function ShopifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    month?: string;
    status?: string;
    error?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.shopify');
  const tList = await getTranslations('app.list');
  const tDash = await getTranslations('app.dashboard');
  const tCb = await getTranslations('app.shopify.callback');

  const business = await getCurrentBusiness();
  if (!business) {
    return (
      <div className="mx-auto max-w-4xl">
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

  const integration = await getShopifyIntegration(business.id);
  const isConnected = integration?.is_active ?? false;
  const page = parsePage(sp.page);
  const month = parseMonth(sp.month ?? null) ? String(sp.month) : currentMonthKey();

  const { rows: orders, total, monthTotal } = isConnected
    ? await listShopifyOrders(business.id, { page, pageSize: PAGE_SIZE, month })
    : { rows: [], total: 0, monthTotal: 0 };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? <MonthPicker value={month} locale={locale} /> : null}
          {isConnected ? <ShopifyActions locale={locale} /> : null}
        </div>
      </div>

      {sp.status === 'success' ? (
        <div className="mt-6 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {tCb('success')}
        </div>
      ) : null}
      {sp.status === 'error' ? (
        <div className="mt-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {sp.error ? sp.error : tCb('error')}
        </div>
      ) : null}

      {!isConnected ? (
        <div className="mt-8">
          <ShopifyConnectForm locale={locale} />
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-xl border border-border bg-card">
            <header className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-medium text-text">{t('status')}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                <span className="size-1.5 rounded-full bg-success" />
                {t('connected')}
              </span>
            </header>
            <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
              <StatusRow
                icon={<Store size={14} strokeWidth={1.75} />}
                label={t('store')}
                value={integration!.store_url}
              />
              <StatusRow
                icon={<Clock size={14} strokeWidth={1.75} />}
                label={t('lastSync')}
                value={
                  integration!.last_synced_at
                    ? formatDate(integration!.last_synced_at, locale)
                    : t('neverSynced')
                }
              />
              <StatusRow
                icon={<ShoppingBag size={14} strokeWidth={1.75} />}
                label={t('totalOrders')}
                value={`${total} · ${formatEGP(monthTotal, locale)}`}
              />
            </div>
          </section>

          <Link
            href="/app/shopify/reconciliation"
            className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 hover:bg-background/40 transition-colors"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <GitMerge size={16} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-text">{t('reconciliation.cardTitle')}</div>
              <div className="text-xs text-text-muted">{t('reconciliation.cardBody')}</div>
            </div>
            <ChevronRight size={14} strokeWidth={1.75} className="text-text-muted rtl:hidden" />
            <ChevronLeft size={14} strokeWidth={1.75} className="hidden text-text-muted rtl:inline" />
          </Link>

          <section className="mt-6 rounded-xl border border-border bg-card">
            <header className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-medium text-text">{t('recentOrders')}</h2>
            </header>
            {orders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-text-secondary">
                {t('noOrders')}
              </p>
            ) : (
              <ul>
                {orders.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-4 border-b border-border/60 px-5 py-3 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-text">
                          {row.order_number ? `#${row.order_number}` : '—'}
                        </span>
                        {row.financial_status ? (
                          <FinancialBadge status={row.financial_status} />
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-xs text-text-muted">
                        {formatDate(row.order_created_at, locale)}
                        {row.customer_name ? ` · ${row.customer_name}` : ''}
                      </div>
                    </div>
                    <div className="tabular-nums text-sm font-medium text-text">
                      {formatEGP(row.total_price, locale)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Pagination
              basePath="/app/integrations/shopify"
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              query=""
              filter="all"
              extras={{ month }}
              prevLabel={tList('previous')}
              nextLabel={tList('next')}
              pageLabel={(n) => tList('page', { n })}
            />
          </section>
        </>
      )}
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-text-muted">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 truncate text-sm text-text">{value}</div>
    </div>
  );
}

function FinancialBadge({ status }: { status: string }) {
  const tone =
    status === 'paid'
      ? 'border-success/40 bg-success/10 text-success'
      : status === 'pending' || status === 'partially_paid'
        ? 'border-warning/40 bg-warning/10 text-warning'
        : status === 'refunded' || status === 'voided'
          ? 'border-danger/40 bg-danger/10 text-danger'
          : 'border-border bg-card text-text-muted';
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${tone}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
