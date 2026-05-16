import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentBusiness } from '@/lib/business';
import { getReportData } from '@/lib/queries/reports';
import { getExportDetail } from '@/lib/queries/export-detail';
import {
  parseRangeKey,
  resolveDateRange,
  monthToDateRange,
  parseMonth,
} from '@/lib/date-range';

export async function GET(request: NextRequest) {
  const business = await getCurrentBusiness();
  if (!business) return new NextResponse('Unauthorized', { status: 401 });

  const monthParam = request.nextUrl.searchParams.get('month');
  const monthRange = monthToDateRange(monthParam);
  const range = monthRange
    ? {
        key: 'this-month' as const,
        startISO: monthRange.startISO,
        endISO: monthRange.endISO,
      }
    : resolveDateRange(parseRangeKey(request.nextUrl.searchParams.get('range')));
  const filenameLabel = parseMonth(monthParam) ? String(monthParam) : range.key;

  const [report, detail] = await Promise.all([
    getReportData(business.id, range),
    getExportDetail(business.id, range),
  ]);

  const lines: string[] = [];

  // 1. P&L summary
  lines.push('# P&L Summary');
  lines.push(['metric', 'amount_egp'].map(csvCell).join(','));
  lines.push(['total_in', (report.totalIn / 100).toFixed(2)].map(csvCell).join(','));
  lines.push(['total_out', (report.totalOut / 100).toFixed(2)].map(csvCell).join(','));
  lines.push(['profit', (report.profit / 100).toFixed(2)].map(csvCell).join(','));
  lines.push('');

  // 2. Month over month
  lines.push('# Month over Month');
  lines.push(['metric', 'current_egp', 'previous_egp', 'change_pct'].map(csvCell).join(','));
  for (const r of [
    { label: 'revenue', cur: report.totalIn, prev: report.prevTotalIn },
    { label: 'expenses', cur: report.totalOut, prev: report.prevTotalOut },
    { label: 'profit', cur: report.profit, prev: report.prevProfit },
  ]) {
    const change = pctChange(r.cur, r.prev);
    lines.push(
      [
        r.label,
        (r.cur / 100).toFixed(2),
        (r.prev / 100).toFixed(2),
        `${change.toFixed(0)}%`,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  lines.push('');

  // 3. Top channels
  lines.push('# Top Revenue Channels');
  lines.push(['channel', 'amount_egp', 'share_pct', 'count'].map(csvCell).join(','));
  for (const c of report.topChannels) {
    const pct = report.totalIn === 0 ? 0 : (c.amount / report.totalIn) * 100;
    lines.push(
      [
        c.name || 'Uncategorized',
        (c.amount / 100).toFixed(2),
        `${pct.toFixed(0)}%`,
        c.count,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  lines.push('');

  // 4. Top categories
  lines.push('# Top Expense Categories');
  lines.push(['category', 'amount_egp', 'share_pct', 'count'].map(csvCell).join(','));
  for (const c of report.topCategories) {
    const pct = report.totalOut === 0 ? 0 : (c.amount / report.totalOut) * 100;
    lines.push(
      [
        c.name || 'Uncategorized',
        (c.amount / 100).toFixed(2),
        `${pct.toFixed(0)}%`,
        c.count,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  lines.push('');

  // 5. Unpaid summary
  lines.push('# Unpaid Summary');
  lines.push(['type', 'count', 'amount_egp'].map(csvCell).join(','));
  lines.push(
    [
      'unpaid_revenue',
      detail.unpaid.unpaidRevenueCount,
      (detail.unpaid.unpaidRevenueTotal / 100).toFixed(2),
    ]
      .map(csvCell)
      .join(','),
  );
  lines.push(
    [
      'unpaid_expenses',
      detail.unpaid.unpaidExpensesCount,
      (detail.unpaid.unpaidExpensesTotal / 100).toFixed(2),
    ]
      .map(csvCell)
      .join(','),
  );
  lines.push('');

  // 6. Revenue entries
  lines.push('# Revenue Entries');
  lines.push(
    [
      'date',
      'item_name',
      'channel',
      'payment_method',
      'shipping_provider',
      'status',
      'quantity',
      'amount_egp',
      'note',
    ]
      .map(csvCell)
      .join(','),
  );
  for (const r of detail.revenue) {
    lines.push(
      [
        r.date ?? '',
        r.itemName ?? '',
        r.channel ?? '',
        r.paymentMethod ?? '',
        r.shippingProvider ?? '',
        r.status,
        r.quantity ?? '',
        (r.amount / 100).toFixed(2),
        r.note ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  lines.push('');

  // 7. Expense entries
  lines.push('# Expense Entries');
  lines.push(
    [
      'date',
      'name',
      'vendor',
      'category',
      'payment_method',
      'status',
      'amount_egp',
      'note',
    ]
      .map(csvCell)
      .join(','),
  );
  for (const e of detail.expenses) {
    lines.push(
      [
        e.date ?? '',
        e.name ?? '',
        e.vendor ?? '',
        e.category ?? '',
        e.paymentMethod ?? '',
        e.status,
        (e.amount / 100).toFixed(2),
        e.note ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  lines.push('');

  // 8. Shopify (if connected)
  if (detail.shopify.connected && detail.shopify.stats && detail.shopify.collection) {
    lines.push('# Shopify Stats');
    lines.push(['metric', 'value'].map(csvCell).join(','));
    const s = detail.shopify.stats;
    const c = detail.shopify.collection;
    lines.push(['store_url', detail.shopify.storeUrl ?? ''].map(csvCell).join(','));
    lines.push(
      ['collection_rate_pct', c.rate == null ? '' : c.rate.toFixed(1)]
        .map(csvCell)
        .join(','),
    );
    lines.push(['revenue_gap_egp', (c.gap / 100).toFixed(2)].map(csvCell).join(','));
    lines.push(['order_count', s.orderCount].map(csvCell).join(','));
    lines.push(['paid_count', s.paidCount].map(csvCell).join(','));
    lines.push(['total_ordered_egp', (s.totalOrdered / 100).toFixed(2)].map(csvCell).join(','));
    lines.push(['avg_order_value_egp', (s.avgOrderValue / 100).toFixed(2)].map(csvCell).join(','));
    lines.push(['refunded_count', s.refundedCount].map(csvCell).join(','));
    lines.push(['refunded_total_egp', (s.refundedTotal / 100).toFixed(2)].map(csvCell).join(','));
    lines.push('');

    lines.push('# Shopify Orders');
    lines.push(
      ['date', 'order_number', 'customer', 'financial_status', 'fulfillment_status', 'amount_egp']
        .map(csvCell)
        .join(','),
    );
    for (const o of detail.shopify.orders) {
      lines.push(
        [
          o.date ?? '',
          o.orderNumber ?? '',
          o.customer ?? '',
          o.financialStatus ?? '',
          o.fulfillmentStatus ?? '',
          (o.amount / 100).toFixed(2),
        ]
          .map(csvCell)
          .join(','),
      );
    }
  }

  const body = '﻿' + lines.join('\r\n');
  const filename = `hesabaty-${filenameLabel}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}
