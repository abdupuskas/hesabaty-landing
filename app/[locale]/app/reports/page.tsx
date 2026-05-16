import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Download } from 'lucide-react';
// Note: export buttons use plain <a>, not next-intl Link — they hit Route Handlers
// with the locale already in the path, and next-intl Link would prefix it again.
import { getCurrentBusiness } from '@/lib/business';
import {
  getReportData,
  getMonthOverMonth,
  getExpenseBreakdownByMonth,
} from '@/lib/queries/reports';
import { getDashboardStats } from '@/lib/queries/dashboard';
import { getShopifyStats, getCollectionMetrics } from '@/lib/queries/shopify-stats';
import { getReportInsight } from '@/lib/queries/insights';
import { collectSmartInsights } from '@/lib/insights';
import {
  currentMonthKey,
  monthToDateRange,
  parseMonth,
  type DateRange,
} from '@/lib/date-range';
import { BreakdownList } from '@/components/app/breakdown-list';
import { CashflowChart } from '@/components/app/cashflow-chart';
import { NoBusinessState } from '@/components/app/empty-state';
import { MonthPicker } from '@/components/app/month-picker';
import { PnLCard } from '@/components/app/pnl-card';
import { MomCard } from '@/components/app/mom-card';
import { SmartInsightCard } from '@/components/app/smart-insight-card';
import { ShopifyInsightsCard } from '@/components/app/shopify-insights-card';

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { locale } = await params;
  const { month: monthParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.reports');
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

  const month = parseMonth(monthParam) ? String(monthParam) : currentMonthKey();
  const monthRange = monthToDateRange(month);
  const range: DateRange = {
    key: 'this-month',
    startISO: monthRange?.startISO ?? null,
    endISO: monthRange?.endISO ?? null,
  };

  const [report, stats, mom, breakdown, shopifyStats, collection, aiInsight] =
    await Promise.all([
      getReportData(business.id, range),
      getDashboardStats(business.id, range),
      getMonthOverMonth(business.id, month),
      getExpenseBreakdownByMonth(business.id, month),
      getShopifyStats(business.id, range),
      getCollectionMetrics(business.id, range),
      getReportInsight(
        business.id,
        parseMonth(month)!.month,
        parseMonth(month)!.year
      ),
    ]);

  const profitMargin =
    report.totalIn > 0 ? (report.profit / report.totalIn) * 100 : 0;

  const rules = collectSmartInsights({
    pl: {
      totalRevenue: report.totalIn,
      totalExpenses: report.totalOut,
      profit: report.profit,
      profitMargin,
      expensesByCategory: breakdown.map((b) => ({
        categoryId: b.id,
        categoryName: b.name || t('uncategorized'),
        categoryIcon: b.icon,
        total: b.amount,
      })),
    },
    mom,
    shopifyStats,
    collection,
    unpaidTotal: stats.unpaidTotal,
    unpaidCount: 0,
    locale,
  });

  const allInsights = [aiInsight?.content, ...rules].filter(
    (s): s is string => Boolean(s && s.trim())
  );

  const exportCsvHref = `/${locale}/app/reports/export?month=${month}`;
  const exportPdfHref = `/${locale}/app/reports/export/pdf?month=${month}`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <MonthPicker value={month} locale={locale} />
      </div>

      <div className="mt-6">
        <PnLCard
          revenue={report.totalIn}
          expenses={report.totalOut}
          profit={report.profit}
          locale={locale}
          title={t('pnl')}
          revenueLabel={t('totalIn')}
          costsLabel={t('totalOut')}
          profitLabel={t('profit')}
          marginLabel={t('profitMargin')}
        />
      </div>

      <div className="mt-4">
        <SmartInsightCard insights={allInsights} title={t('smartInsight')} />
      </div>

      <div className="mt-4">
        <MomCard
          mom={mom}
          locale={locale}
          title={t('vsLastMonth')}
          revenueLabel={t('totalIn')}
          costsLabel={t('totalOut')}
          profitLabel={t('profit')}
        />
      </div>

      {shopifyStats.orderCount > 0 ? (
        <div className="mt-4">
          <ShopifyInsightsCard
            stats={shopifyStats}
            collection={collection}
            locale={locale}
            title={t('shopifyInsights')}
            collectionRateLabel={t('collectionRate')}
            revenueGapLabel={t('revenueGap')}
            missingOrdersLabel={t('missingOrders')}
            missingUnitsLabel={t('missingUnits')}
            investigateLabel={t('investigate')}
            paidOrdersLabel={t('paidOrders')}
            orderVolumeLabel={t('orderVolume')}
            totalOrderedLabel={t('totalOrdered')}
            avgOrderValueLabel={t('avgOrderValue')}
          />
        </div>
      ) : null}

      <div className="mt-8">
        <CashflowChart
          data={stats.series}
          granularity={stats.granularity}
          locale={locale}
          title={tDash('chartTitle')}
          inLabel={tDash('moneyIn')}
          outLabel={tDash('moneyOut')}
          empty={tDash('recentEmpty')}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <BreakdownList
          title={t('topChannels')}
          rows={report.topChannels}
          total={report.totalIn}
          locale={locale}
          empty={t('noData')}
          tone="success"
          uncategorizedLabel={t('uncategorized')}
          drillBase="/app/channels"
        />
        <BreakdownList
          title={t('topCategories')}
          rows={report.topCategories}
          total={report.totalOut}
          locale={locale}
          empty={t('noData')}
          tone="danger"
          uncategorizedLabel={t('uncategorized')}
          drillBase="/app/categories"
        />
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <a
          href={exportCsvHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-text hover:border-text-muted transition-colors"
        >
          <Download size={14} strokeWidth={1.75} />
          {t('exportCsv')}
        </a>
        <a
          href={exportPdfHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-medium text-background hover:bg-accent/90 transition-colors"
        >
          <Download size={14} strokeWidth={1.75} />
          {t('exportReport')}
        </a>
      </div>
    </div>
  );
}
