import { formatEGP } from '@/lib/money';

type PL = {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  expensesByCategory: {
    categoryId: string | null;
    categoryName: string;
    categoryIcon: string | null;
    total: number;
  }[];
};

type MoM = {
  current: { revenue: number; expenses: number; profit: number };
  previous: { revenue: number; expenses: number; profit: number };
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
};

type ShopifyStats = {
  totalOrdered: number;
  orderCount: number;
  avgOrderValue: number;
  refundedCount: number;
  refundedTotal: number;
  paidCount: number;
};

type Collection = {
  rate: number | null;
  gap: number;
};

type Input = {
  pl: PL | undefined;
  mom: MoM | undefined;
  shopifyStats: ShopifyStats | undefined;
  collection: Collection | undefined;
  unpaidTotal: number;
  unpaidCount: number;
  locale?: string;
};

const MAX_INSIGHTS = 5;

function fmtPct(n: number): string {
  const rounded = Math.round(Math.abs(n) * 10) / 10;
  return rounded % 1 === 0 ? `${Math.round(rounded)}%` : `${rounded.toFixed(1)}%`;
}

export function collectSmartInsights(i: Input): string[] {
  const { pl, mom, shopifyStats, collection, unpaidTotal, unpaidCount, locale } = i;
  const fmt = (n: number) => formatEGP(n, locale ?? 'en');
  const insights: string[] = [];

  if (
    shopifyStats &&
    shopifyStats.orderCount > 0 &&
    collection?.rate != null &&
    collection.rate < 60
  ) {
    insights.push(
      `Only ${fmtPct(collection.rate)} of Shopify orders were collected — ${fmt(
        collection.gap
      )} gap. Review refunds and COD refusals.`
    );
  }

  if (pl && pl.profit < 0) {
    insights.push(
      `You spent ${fmt(-pl.profit)} more than you earned this month. Start with the biggest cost category to close the gap.`
    );
  }

  if (pl && pl.totalRevenue > 0 && unpaidTotal > 0.15 * pl.totalRevenue) {
    const pct = (unpaidTotal / pl.totalRevenue) * 100;
    insights.push(
      `${unpaidCount} unpaid orders worth ${fmt(unpaidTotal)} (${fmtPct(pct)} of revenue) are still open. Follow up this week to free up cash.`
    );
  }

  if (mom && mom.revenueChange > 0 && mom.profitChange < -10) {
    insights.push(
      `Revenue grew ${fmtPct(mom.revenueChange)} but profit dropped ${fmtPct(
        mom.profitChange
      )} — costs are eating your margin. Check top spending categories.`
    );
  }

  if (
    pl &&
    pl.totalExpenses > 0 &&
    pl.expensesByCategory.length > 0 &&
    pl.expensesByCategory[0].total > 0.4 * pl.totalExpenses
  ) {
    const top = pl.expensesByCategory[0];
    const pct = (top.total / pl.totalExpenses) * 100;
    insights.push(
      `${top.categoryName} is ${fmtPct(pct)} of all your spending (${fmt(
        top.total
      )}). It's your biggest lever for improving margin.`
    );
  }

  if (mom && mom.revenueChange > 20) {
    insights.push(
      `Revenue is up ${fmtPct(mom.revenueChange)} vs last month — ${fmt(
        mom.current.revenue
      )}. Keep doing what's working.`
    );
  }

  if (mom && mom.revenueChange < -15) {
    insights.push(
      `Revenue dropped ${fmtPct(
        mom.revenueChange
      )} vs last month. Compare top channels to see where the slip happened.`
    );
  }

  if (pl && pl.totalRevenue > 0 && pl.profitMargin >= 15) {
    insights.push(
      `Your profit margin is ${fmtPct(pl.profitMargin)} — healthy for e-commerce. Reinvest with confidence.`
    );
  }

  if (pl && pl.profitMargin > 0 && pl.profitMargin < 5) {
    insights.push(
      `Profit margin is ${fmtPct(pl.profitMargin)} — very tight. Small cost cuts will have outsized impact.`
    );
  }

  if (
    shopifyStats &&
    shopifyStats.orderCount > 0 &&
    shopifyStats.refundedCount / shopifyStats.orderCount > 0.1
  ) {
    const rate = (shopifyStats.refundedCount / shopifyStats.orderCount) * 100;
    insights.push(
      `${shopifyStats.refundedCount} of ${shopifyStats.orderCount} orders were refunded (${fmtPct(
        rate
      )}). Worth digging into product quality or sizing issues.`
    );
  }

  if (insights.length === 0) {
    insights.push(
      `Track every revenue and expense daily — consistency is what makes the monthly numbers useful.`
    );
  }

  return insights.slice(0, MAX_INSIGHTS);
}
