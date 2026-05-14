import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Plus } from 'lucide-react';
import { getCurrentBusiness } from '@/lib/business';
import { getDashboardStats } from '@/lib/queries/dashboard';
import { getDailyInsight } from '@/lib/queries/insights';
import { getCollectionMetrics } from '@/lib/queries/shopify-stats';
import {
  currentMonthKey,
  monthToDateRange,
  parseMonth,
  type DateRange,
} from '@/lib/date-range';
import { formatEGP } from '@/lib/money';
import { KpiCard } from '@/components/app/kpi-card';
import { RecentTransactions } from '@/components/app/recent-transactions';
import { NoBusinessState } from '@/components/app/empty-state';
import { CashflowChart } from '@/components/app/cashflow-chart';
import { AIInsightCard } from '@/components/app/ai-insight-card';
import { ShopifyCard } from '@/components/app/shopify-card';
import { MonthPicker } from '@/components/app/month-picker';

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { locale } = await params;
  const { month: monthParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.dashboard');

  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t('subtitle')}</p>
        <div className="mt-10">
          <NoBusinessState
            title={t('noBusiness.title')}
            body={t('noBusiness.body')}
            cta={t('noBusiness.cta')}
          />
        </div>
      </div>
    );
  }

  const month = parseMonth(monthParam) ? String(monthParam) : currentMonthKey();
  const monthRange = monthToDateRange(month);
  const range: DateRange = {
    key: 'this-month',
    startISO: monthRange?.startISO ?? null,
    endISO: monthRange?.endISO ?? null,
  };

  const [stats, insight, collection] = await Promise.all([
    getDashboardStats(business.id, range),
    getDailyInsight(business.id),
    getCollectionMetrics(business.id, range),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{business.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker value={month} locale={locale} />
          <Link
            href="/app/money-in/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-success/15 border border-success/30 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors"
          >
            <Plus size={12} strokeWidth={2} />
            {t('quickAdd.revenue')}
          </Link>
          <Link
            href="/app/money-out/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-danger/15 border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
          >
            <Plus size={12} strokeWidth={2} />
            {t('quickAdd.expense')}
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <CashflowChart
          data={stats.series}
          granularity={stats.granularity}
          locale={locale}
          title={t('chartTitle')}
          inLabel={t('moneyIn')}
          outLabel={t('moneyOut')}
          empty={t('recentEmpty')}
        />
      </div>

      {collection.totalOrdered > 0 ? (
        <div className="mt-4">
          <ShopifyCard
            totalOrdered={collection.totalOrdered}
            collectionRate={collection.rate}
            locale={locale}
            title={t('shopifyCard.title')}
            collectedLabel={t('shopifyCard.collected')}
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('moneyIn')} value={formatEGP(stats.moneyIn, locale)} tone="success" />
        <KpiCard label={t('moneyOut')} value={formatEGP(stats.moneyOut, locale)} tone="danger" />
        <KpiCard label={t('unpaid')} value={formatEGP(stats.unpaidTotal, locale)} tone="warning" />
        <KpiCard label={t('dueSoon')} value={formatEGP(stats.dueSoonTotal, locale)} tone="muted" />
      </div>

      <div className="mt-6">
        <AIInsightCard
          content={insight?.content ?? null}
          generatedAt={insight?.generated_at ?? null}
          locale={locale}
          title={t('aiInsight.title')}
          generatedLabel={t('aiInsight.generated')}
          emptyLabel={t('aiInsight.empty')}
        />
      </div>

      <div className="mt-6">
        <RecentTransactions
          rows={stats.recent}
          locale={locale}
          title={t('recent')}
          empty={t('recentEmpty')}
          viewAllLabel={t('viewAll')}
        />
      </div>
    </div>
  );
}
