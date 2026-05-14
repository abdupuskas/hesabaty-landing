import { createClient } from '@/lib/supabase/server';
import { monthToDateRange, type DateRange } from '@/lib/date-range';

export type Breakdown = {
  id: string | null;
  name: string;
  amount: number;
  count: number;
};

export type ReportData = {
  totalIn: number;
  totalOut: number;
  profit: number;
  prevTotalIn: number;
  prevTotalOut: number;
  prevProfit: number;
  topChannels: Breakdown[];
  topCategories: Breakdown[];
};

function shiftRange(range: DateRange): DateRange | null {
  if (!range.startISO || !range.endISO) return null;
  const start = new Date(range.startISO);
  const end = new Date(range.endISO);
  const span = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(start.getTime() - span);
  return { key: range.key, startISO: prevStart.toISOString(), endISO: prevEnd.toISOString() };
}

export async function getReportData(
  businessId: string,
  range: DateRange
): Promise<ReportData> {
  const supabase = await createClient();

  const revQuery = supabase
    .from('revenue_entries')
    .select('amount, channel_id, sales_channels ( name )')
    .eq('business_id', businessId);
  const expQuery = supabase
    .from('expenses')
    .select('amount, category_id, expense_categories ( name )')
    .eq('business_id', businessId);
  if (range.startISO) revQuery.gte('collected_at', range.startISO);
  if (range.endISO) revQuery.lt('collected_at', range.endISO);
  if (range.startISO) expQuery.gte('paid_at', range.startISO);
  if (range.endISO) expQuery.lt('paid_at', range.endISO);

  const prev = shiftRange(range);
  const prevRev = supabase
    .from('revenue_entries')
    .select('amount')
    .eq('business_id', businessId);
  const prevExp = supabase
    .from('expenses')
    .select('amount')
    .eq('business_id', businessId);
  if (prev?.startISO) prevRev.gte('collected_at', prev.startISO);
  if (prev?.endISO) prevRev.lt('collected_at', prev.endISO);
  if (prev?.startISO) prevExp.gte('paid_at', prev.startISO);
  if (prev?.endISO) prevExp.lt('paid_at', prev.endISO);

  const [rev, exp, prevRevRes, prevExpRes] = await Promise.all([
    revQuery,
    expQuery,
    prev ? prevRev : Promise.resolve({ data: [] }),
    prev ? prevExp : Promise.resolve({ data: [] }),
  ]);

  const revRows = (rev.data ?? []) as Array<{
    amount: number;
    channel_id: string | null;
    sales_channels: { name: string } | null;
  }>;
  const expRows = (exp.data ?? []) as Array<{
    amount: number;
    category_id: string | null;
    expense_categories: { name: string } | null;
  }>;

  const totalIn = revRows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalOut = expRows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const prevTotalIn = (prevRevRes.data ?? []).reduce(
    (s: number, r: { amount: number | null }) => s + (r.amount ?? 0),
    0
  );
  const prevTotalOut = (prevExpRes.data ?? []).reduce(
    (s: number, r: { amount: number | null }) => s + (r.amount ?? 0),
    0
  );

  return {
    totalIn,
    totalOut,
    profit: totalIn - totalOut,
    prevTotalIn,
    prevTotalOut,
    prevProfit: prevTotalIn - prevTotalOut,
    topChannels: groupBreakdown(
      revRows,
      (r) => r.channel_id,
      (r) => r.sales_channels?.name ?? null
    ),
    topCategories: groupBreakdown(
      expRows,
      (r) => r.category_id,
      (r) => r.expense_categories?.name ?? null
    ),
  };
}

export type CategoryBreakdown = Breakdown & { icon: string | null };

export async function getExpenseBreakdownByMonth(
  businessId: string,
  month: string | null
): Promise<CategoryBreakdown[]> {
  const supabase = await createClient();
  const range = monthToDateRange(month);
  let q = supabase
    .from('expenses')
    .select('amount, category_id, expense_categories ( name, icon )')
    .eq('business_id', businessId);
  if (range) {
    q = q.gte('paid_at', range.startISO).lt('paid_at', range.endISO);
  }
  const { data } = await q;
  const rows = (data ?? []) as Array<{
    amount: number;
    category_id: string | null;
    expense_categories: { name: string; icon: string | null } | null;
  }>;
  const map = new Map<string, CategoryBreakdown>();
  for (const r of rows) {
    const key = r.category_id ?? '__uncat__';
    const existing = map.get(key);
    if (existing) {
      existing.amount += r.amount;
      existing.count += 1;
    } else {
      map.set(key, {
        id: r.category_id,
        name: r.expense_categories?.name ?? '',
        icon: r.expense_categories?.icon ?? null,
        amount: r.amount,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

export type MonthOverMonth = {
  current: { revenue: number; expenses: number; profit: number };
  previous: { revenue: number; expenses: number; profit: number };
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
};

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export async function getMonthOverMonth(
  businessId: string,
  month: string
): Promise<MonthOverMonth> {
  const supabase = await createClient();
  const curRange = monthToDateRange(month);
  if (!curRange) {
    return {
      current: { revenue: 0, expenses: 0, profit: 0 },
      previous: { revenue: 0, expenses: 0, profit: 0 },
      revenueChange: 0,
      expensesChange: 0,
      profitChange: 0,
    };
  }
  const curStart = new Date(curRange.startISO);
  const prevStart = new Date(
    Date.UTC(curStart.getUTCFullYear(), curStart.getUTCMonth() - 1, 1)
  );
  const prevEnd = curStart;

  const [curRev, curExp, prevRev, prevExp] = await Promise.all([
    supabase
      .from('revenue_entries')
      .select('amount')
      .eq('business_id', businessId)
      .gte('collected_at', curRange.startISO)
      .lt('collected_at', curRange.endISO),
    supabase
      .from('expenses')
      .select('amount')
      .eq('business_id', businessId)
      .gte('paid_at', curRange.startISO)
      .lt('paid_at', curRange.endISO),
    supabase
      .from('revenue_entries')
      .select('amount')
      .eq('business_id', businessId)
      .gte('collected_at', prevStart.toISOString())
      .lt('collected_at', prevEnd.toISOString()),
    supabase
      .from('expenses')
      .select('amount')
      .eq('business_id', businessId)
      .gte('paid_at', prevStart.toISOString())
      .lt('paid_at', prevEnd.toISOString()),
  ]);

  const sum = (rows: { amount: number | null }[] | null | undefined) =>
    (rows ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const cr = sum(curRev.data);
  const ce = sum(curExp.data);
  const pr = sum(prevRev.data);
  const pe = sum(prevExp.data);
  return {
    current: { revenue: cr, expenses: ce, profit: cr - ce },
    previous: { revenue: pr, expenses: pe, profit: pr - pe },
    revenueChange: pctChange(cr, pr),
    expensesChange: pctChange(ce, pe),
    profitChange: pctChange(cr - ce, pr - pe),
  };
}

function groupBreakdown<T extends { amount: number }>(
  rows: T[],
  idOf: (r: T) => string | null,
  nameOf: (r: T) => string | null
): Breakdown[] {
  const map = new Map<string, Breakdown>();
  for (const row of rows) {
    const id = idOf(row);
    const key = id ?? '__uncat__';
    const existing = map.get(key);
    if (existing) {
      existing.amount += row.amount;
      existing.count += 1;
    } else {
      map.set(key, {
        id,
        name: nameOf(row) ?? '',
        amount: row.amount,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}
