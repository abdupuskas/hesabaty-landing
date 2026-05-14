import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getCurrentBusiness } from '@/lib/business';
import { getShopifyIntegration, listShopifyOrders } from '@/lib/queries/shopify';
import { formatEGP } from '@/lib/money';
import { formatDate } from '@/lib/date-range';
import { Pagination } from '@/components/app/pagination';

const PAGE_SIZE = 20;

function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function ReconciliationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.shopify.reconciliation');
  const tList = await getTranslations('app.list');

  const business = await getCurrentBusiness();
  if (!business) redirect(`/${locale}/app`);

  const integration = await getShopifyIntegration(business!.id);
  if (!integration?.is_active) redirect(`/${locale}/app/integrations/shopify`);

  const page = parsePage(sp.page);
  const { rows, total } = await listShopifyOrders(business!.id, { page, pageSize: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/app/integrations/shopify"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
      >
        <ChevronLeft size={14} strokeWidth={1.75} className="rtl:hidden" />
        <ChevronRight size={14} strokeWidth={1.75} className="hidden rtl:inline" />
        {t('back')}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>

      <section className="mt-6 rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-text-secondary">{t('empty')}</p>
        ) : (
          <ul>
            {rows.map((row) => {
              const orderRef = row.order_number ? `Shopify #${row.order_number}` : `Shopify ${row.id}`;
              const params = new URLSearchParams({
                amount: (row.total_price ?? 0).toFixed(2),
                item_name: orderRef + (row.customer_name ? ` — ${row.customer_name}` : ''),
                collected_at: row.order_created_at.slice(0, 10),
                note: orderRef,
              });
              const newRevenueHref = `/app/money-in/new?${params.toString()}`;
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-text">
                        {row.order_number ? `#${row.order_number}` : '—'}
                      </span>
                      {row.financial_status ? (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                          {row.financial_status.replace(/_/g, ' ')}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-text-muted">
                      {formatDate(row.order_created_at, locale)}
                      {row.customer_name ? ` · ${row.customer_name}` : ''}
                    </div>
                  </div>
                  <div className="tabular-nums text-sm font-medium text-text">
                    {formatEGP(row.total_price ?? 0, locale)}
                  </div>
                  <Link
                    href={newRevenueHref as `/${string}`}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-text-secondary hover:text-text hover:border-text-muted transition-colors"
                  >
                    <Plus size={12} strokeWidth={1.75} />
                    {t('markCollected')}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination
          basePath="/app/shopify/reconciliation"
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          query=""
          filter="all"
          prevLabel={tList('previous')}
          nextLabel={tList('next')}
          pageLabel={(n) => tList('page', { n })}
        />
      </section>
    </div>
  );
}
