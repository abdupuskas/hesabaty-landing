import { createClient } from '@/lib/supabase/server';

export type CombinedTxRow = {
  id: string;
  type: 'in' | 'out';
  amount: number;
  label: string;
  taxonomy: string | null;
  icon: string | null;
  badge: string | null;
  date: string;
  paid: boolean;
};

export type TxFilter = 'all' | 'in' | 'out';

const PAGE_SIZE = 20;
const FETCH_PER_SIDE = 100;

export async function listAllTransactions(
  businessId: string,
  opts: { page: number; query: string; filter: TxFilter }
): Promise<{ rows: CombinedTxRow[]; total: number }> {
  const supabase = await createClient();
  const search = opts.query.trim();

  const wantsIn = opts.filter !== 'out';
  const wantsOut = opts.filter !== 'in';

  const revQuery = supabase
    .from('revenue_entries')
    .select(
      'id, amount, item_name, status, shipping_provider, collected_at, created_at, sales_channels ( name, icon )',
      { count: 'exact' }
    )
    .eq('business_id', businessId)
    .order('collected_at', { ascending: false, nullsFirst: false })
    .limit(FETCH_PER_SIDE);
  if (search) revQuery.ilike('item_name', `%${search}%`);

  const expQuery = supabase
    .from('expenses')
    .select(
      'id, amount, name, vendor, paid_at, due_date, created_at, expense_categories ( name, icon )',
      { count: 'exact' }
    )
    .eq('business_id', businessId)
    .order('paid_at', { ascending: false, nullsFirst: false })
    .limit(FETCH_PER_SIDE);
  if (search) expQuery.or(`name.ilike.%${search}%,vendor.ilike.%${search}%`);

  const [rev, exp] = await Promise.all([
    wantsIn ? revQuery : Promise.resolve({ data: [], count: 0 }),
    wantsOut ? expQuery : Promise.resolve({ data: [], count: 0 }),
  ]);

  const inRows: CombinedTxRow[] = (rev.data ?? []).map((r) => {
    const row = r as unknown as {
      id: string;
      amount: number;
      item_name: string | null;
      status: string;
      shipping_provider: string | null;
      collected_at: string | null;
      created_at: string | null;
      sales_channels: { name: string; icon: string | null } | null;
    };
    const channelName = row.sales_channels?.name ?? null;
    return {
      id: row.id,
      type: 'in',
      amount: row.amount,
      label: row.item_name ?? channelName ?? '—',
      taxonomy: channelName,
      icon: row.sales_channels?.icon ?? null,
      badge: row.shipping_provider ?? null,
      date: row.collected_at ?? row.created_at ?? new Date().toISOString(),
      paid: row.status !== 'unpaid',
    };
  });

  const outRows: CombinedTxRow[] = (exp.data ?? []).map((r) => {
    const row = r as unknown as {
      id: string;
      amount: number;
      name: string | null;
      vendor: string | null;
      paid_at: string | null;
      due_date: string | null;
      created_at: string | null;
      expense_categories: { name: string; icon: string | null } | null;
    };
    const categoryName = row.expense_categories?.name ?? null;
    return {
      id: row.id,
      type: 'out',
      amount: row.amount,
      label: row.name ?? row.vendor ?? categoryName ?? '—',
      taxonomy: categoryName,
      icon: row.expense_categories?.icon ?? null,
      badge: 'EXP',
      date: row.paid_at ?? row.due_date ?? row.created_at ?? new Date().toISOString(),
      paid: !!row.paid_at,
    };
  });

  const merged = [...inRows, ...outRows].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );

  const total = (rev.count ?? 0) + (exp.count ?? 0);
  const from = opts.page * PAGE_SIZE;
  const slice = merged.slice(from, from + PAGE_SIZE);
  return { rows: slice, total };
}

export const ALL_TX_PAGE_SIZE = PAGE_SIZE;
