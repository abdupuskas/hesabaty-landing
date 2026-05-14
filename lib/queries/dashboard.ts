import { createClient } from '@/lib/supabase/server';
import type { DateRange } from '@/lib/date-range';

export type RecentTransaction = {
  id: string;
  type: 'in' | 'out';
  amount: number;
  label: string;
  icon: string | null;
  badge: string | null;
  status: 'paid' | 'unpaid' | 'expense';
  date: string;
};

export type SeriesPoint = {
  bucket: string;
  in: number;
  out: number;
};

export type DashboardStats = {
  moneyIn: number;
  moneyOut: number;
  profit: number;
  unpaidTotal: number;
  dueSoonTotal: number;
  recent: RecentTransaction[];
  series: SeriesPoint[];
  granularity: 'day' | 'month';
};

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export async function getDashboardStats(
  businessId: string,
  range: DateRange
): Promise<DashboardStats> {
  const supabase = await createClient();

  const revenueQuery = supabase
    .from('revenue_entries')
    .select(
      'id, amount, item_name, collected_at, created_at, shipping_provider, status, sales_channels ( name, icon )'
    )
    .eq('business_id', businessId);
  if (range.startISO) revenueQuery.gte('collected_at', range.startISO);
  if (range.endISO) revenueQuery.lt('collected_at', range.endISO);

  const expensesQuery = supabase
    .from('expenses')
    .select(
      'id, amount, name, vendor, paid_at, due_date, created_at, expense_categories ( name, icon )'
    )
    .eq('business_id', businessId);
  if (range.startISO) expensesQuery.gte('paid_at', range.startISO);
  if (range.endISO) expensesQuery.lt('paid_at', range.endISO);

  const unpaidQuery = supabase
    .from('revenue_entries')
    .select('amount')
    .eq('business_id', businessId)
    .eq('status', 'unpaid');

  const dueSoonCutoff = new Date(Date.now() + FOURTEEN_DAYS_MS).toISOString();
  const dueSoonQuery = supabase
    .from('expenses')
    .select('amount')
    .eq('business_id', businessId)
    .is('paid_at', null)
    .not('due_date', 'is', null)
    .lte('due_date', dueSoonCutoff);

  const [revenue, expenses, unpaid, dueSoon] = await Promise.all([
    revenueQuery.order('collected_at', { ascending: false, nullsFirst: false }),
    expensesQuery.order('paid_at', { ascending: false, nullsFirst: false }),
    unpaidQuery,
    dueSoonQuery,
  ]);

  const revenueRows = revenue.data ?? [];
  const expenseRows = expenses.data ?? [];

  const moneyIn = revenueRows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const moneyOut = expenseRows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const unpaidTotal = (unpaid.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const dueSoonTotal = (dueSoon.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);

  const recentRevenue: RecentTransaction[] = revenueRows.slice(0, 8).map((r) => {
    const channel = (r as unknown as { sales_channels: { name: string; icon: string | null } | null })
      .sales_channels;
    const label = r.item_name ?? channel?.name ?? '—';
    const badge = r.shipping_provider ?? null;
    return {
      id: r.id,
      type: 'in',
      amount: r.amount,
      label,
      icon: channel?.icon ?? null,
      badge,
      status: r.status === 'paid' ? 'paid' : 'unpaid',
      date: r.collected_at ?? r.created_at ?? new Date().toISOString(),
    };
  });
  const recentExpenses: RecentTransaction[] = expenseRows.slice(0, 8).map((r) => {
    const category = (r as unknown as {
      expense_categories: { name: string; icon: string | null } | null;
    }).expense_categories;
    const label = r.name ?? r.vendor ?? category?.name ?? '—';
    return {
      id: r.id,
      type: 'out',
      amount: r.amount,
      label,
      icon: category?.icon ?? null,
      badge: 'EXP',
      status: 'expense',
      date: r.paid_at ?? r.created_at ?? new Date().toISOString(),
    };
  });

  const recent = [...recentRevenue, ...recentExpenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  const { series, granularity } = buildSeries(
    revenueRows.map((r) => ({ date: r.collected_at ?? r.created_at, amount: r.amount })),
    expenseRows.map((r) => ({ date: r.paid_at ?? r.created_at, amount: r.amount })),
    range
  );

  return {
    moneyIn,
    moneyOut,
    profit: moneyIn - moneyOut,
    unpaidTotal,
    dueSoonTotal,
    recent,
    series,
    granularity,
  };
}

type RawPoint = { date: string | null; amount: number };

function buildSeries(
  inRows: RawPoint[],
  outRows: RawPoint[],
  range: DateRange
): { series: SeriesPoint[]; granularity: 'day' | 'month' } {
  const start = range.startISO ? new Date(range.startISO) : earliest([...inRows, ...outRows]);
  const end = range.endISO ? new Date(range.endISO) : new Date();
  if (!start || end <= start) return { series: [], granularity: 'day' };

  const spanDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const granularity: 'day' | 'month' = spanDays <= 62 ? 'day' : 'month';

  const buckets = new Map<string, SeriesPoint>();
  const cursor = new Date(start);
  if (granularity === 'day') {
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor < end) {
      buckets.set(bucketKey(cursor, 'day'), { bucket: bucketKey(cursor, 'day'), in: 0, out: 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  } else {
    cursor.setUTCDate(1);
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor < end) {
      buckets.set(bucketKey(cursor, 'month'), { bucket: bucketKey(cursor, 'month'), in: 0, out: 0 });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }

  const accumulate = (rows: RawPoint[], key: 'in' | 'out') => {
    for (const r of rows) {
      if (!r.date) continue;
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime()) || d < start || d >= end) continue;
      const b = buckets.get(bucketKey(d, granularity));
      if (b) b[key] += r.amount ?? 0;
    }
  };
  accumulate(inRows, 'in');
  accumulate(outRows, 'out');

  return { series: Array.from(buckets.values()), granularity };
}

function bucketKey(d: Date, g: 'day' | 'month'): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  if (g === 'month') return `${y}-${m}`;
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function earliest(rows: RawPoint[]): Date | null {
  let min: Date | null = null;
  for (const r of rows) {
    if (!r.date) continue;
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    if (!min || d < min) min = d;
  }
  return min;
}
