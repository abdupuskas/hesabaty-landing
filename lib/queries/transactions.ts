import { createClient } from '@/lib/supabase/server';
import { monthToDateRange } from '@/lib/date-range';

export type RevenueRow = {
  id: string;
  amount: number;
  item_name: string | null;
  quantity: number | null;
  payment_method: string | null;
  shipping_provider: string | null;
  status: string;
  collected_at: string | null;
  channel_id: string | null;
  channel_name: string | null;
  channel_icon: string | null;
  note: string | null;
};

export type ExpenseRow = {
  id: string;
  amount: number;
  name: string | null;
  vendor: string | null;
  payment_method: string | null;
  paid_at: string | null;
  due_date: string | null;
  is_recurring: boolean | null;
  category_id: string | null;
  category_name: string | null;
  category_icon: string | null;
  note: string | null;
};

export type RevenueFilter = 'all' | 'paid' | 'unpaid';
export type ExpenseFilter = 'all' | 'paid' | 'unpaid';

export type ListResult<T> = { rows: T[]; total: number };

const PAGE_SIZE = 20;

export type RevenueListOpts = {
  page: number;
  query: string;
  filter: RevenueFilter;
  channelId?: string | null;
  shippingProvider?: string | null;
  month?: string | null;
};

export type ExpenseListOpts = {
  page: number;
  query: string;
  filter: ExpenseFilter;
  categoryId?: string | null;
  month?: string | null;
};

export async function listRevenue(
  businessId: string,
  opts: RevenueListOpts
): Promise<ListResult<RevenueRow>> {
  const supabase = await createClient();
  const from = opts.page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from('revenue_entries')
    .select(
      'id, amount, item_name, quantity, payment_method, shipping_provider, status, collected_at, channel_id, note, sales_channels ( name, icon )',
      { count: 'exact' }
    )
    .eq('business_id', businessId)
    .order('collected_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (opts.query.trim()) q = q.ilike('item_name', `%${opts.query.trim()}%`);
  if (opts.filter === 'paid') q = q.eq('status', 'paid');
  if (opts.filter === 'unpaid') q = q.eq('status', 'unpaid');
  if (opts.channelId) q = q.eq('channel_id', opts.channelId);
  if (opts.shippingProvider) q = q.eq('shipping_provider', opts.shippingProvider);
  const monthRange = monthToDateRange(opts.month ?? null);
  if (monthRange) {
    q = q.gte('collected_at', monthRange.startISO).lt('collected_at', monthRange.endISO);
  }

  const { data, count } = await q;
  const rows: RevenueRow[] = (data ?? []).map((r) => {
    const channel = (r as unknown as {
      sales_channels: { name: string; icon: string | null } | null;
    }).sales_channels;
    return {
      id: r.id,
      amount: r.amount,
      item_name: r.item_name,
      quantity: r.quantity,
      payment_method: r.payment_method,
      shipping_provider: r.shipping_provider,
      status: r.status,
      collected_at: r.collected_at,
      channel_id: r.channel_id,
      channel_name: channel?.name ?? null,
      channel_icon: channel?.icon ?? null,
      note: r.note,
    };
  });
  return { rows, total: count ?? 0 };
}

export async function listExpenses(
  businessId: string,
  opts: ExpenseListOpts
): Promise<ListResult<ExpenseRow>> {
  const supabase = await createClient();
  const from = opts.page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from('expenses')
    .select(
      'id, amount, name, vendor, payment_method, paid_at, due_date, is_recurring, category_id, note, expense_categories ( name, icon )',
      { count: 'exact' }
    )
    .eq('business_id', businessId)
    .order('paid_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (opts.query.trim())
    q = q.or(`name.ilike.%${opts.query.trim()}%,vendor.ilike.%${opts.query.trim()}%`);
  if (opts.filter === 'paid') q = q.not('paid_at', 'is', null);
  if (opts.filter === 'unpaid') q = q.is('paid_at', null);
  if (opts.categoryId) q = q.eq('category_id', opts.categoryId);
  const monthRange = monthToDateRange(opts.month ?? null);
  if (monthRange) {
    q = q.or(
      `and(paid_at.gte.${monthRange.startISO},paid_at.lt.${monthRange.endISO}),and(paid_at.is.null,due_date.gte.${monthRange.startISO},due_date.lt.${monthRange.endISO})`
    );
  }

  const { data, count } = await q;
  const rows: ExpenseRow[] = (data ?? []).map((r) => {
    const category = (r as unknown as {
      expense_categories: { name: string; icon: string | null } | null;
    }).expense_categories;
    return {
      id: r.id,
      amount: r.amount,
      name: r.name,
      vendor: r.vendor,
      payment_method: r.payment_method,
      paid_at: r.paid_at,
      due_date: r.due_date,
      is_recurring: r.is_recurring,
      category_id: r.category_id,
      category_name: category?.name ?? null,
      category_icon: category?.icon ?? null,
      note: r.note,
    };
  });
  return { rows, total: count ?? 0 };
}

export async function getRevenue(businessId: string, id: string): Promise<RevenueRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('revenue_entries')
    .select(
      'id, amount, item_name, quantity, payment_method, shipping_provider, status, collected_at, channel_id, note, sales_channels ( name, icon )'
    )
    .eq('business_id', businessId)
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  const channel = (data as unknown as {
    sales_channels: { name: string; icon: string | null } | null;
  }).sales_channels;
  return {
    id: data.id,
    amount: data.amount,
    item_name: data.item_name,
    quantity: data.quantity,
    payment_method: data.payment_method,
    shipping_provider: data.shipping_provider,
    status: data.status,
    collected_at: data.collected_at,
    channel_id: data.channel_id,
    channel_name: channel?.name ?? null,
    channel_icon: channel?.icon ?? null,
    note: data.note,
  };
}

export async function getExpense(businessId: string, id: string): Promise<ExpenseRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('expenses')
    .select(
      'id, amount, name, vendor, payment_method, paid_at, due_date, is_recurring, category_id, note, expense_categories ( name, icon )'
    )
    .eq('business_id', businessId)
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  const category = (data as unknown as {
    expense_categories: { name: string; icon: string | null } | null;
  }).expense_categories;
  return {
    id: data.id,
    amount: data.amount,
    name: data.name,
    vendor: data.vendor,
    payment_method: data.payment_method,
    paid_at: data.paid_at,
    due_date: data.due_date,
    is_recurring: data.is_recurring,
    category_id: data.category_id,
    category_name: category?.name ?? null,
    category_icon: category?.icon ?? null,
    note: data.note,
  };
}

export async function listSalesChannels(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sales_channels')
    .select('id, name, icon, is_custom')
    .or(`business_id.eq.${businessId},business_id.is.null`)
    .order('name');
  return data ?? [];
}

export async function listExpenseCategories(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('expense_categories')
    .select('id, name, icon, is_custom')
    .or(`business_id.eq.${businessId},business_id.is.null`)
    .order('name');
  return data ?? [];
}

export async function listShippingProviders(businessId: string): Promise<string[]> {
  const supabase = await createClient();
  const [{ data: revenueProviders }, { data: shopifyProviders }] = await Promise.all([
    supabase
      .from('revenue_entries')
      .select('shipping_provider')
      .eq('business_id', businessId)
      .not('shipping_provider', 'is', null),
    supabase
      .from('shopify_orders')
      .select('shipping_provider')
      .eq('business_id', businessId)
      .not('shipping_provider', 'is', null),
  ]);
  const set = new Set<string>();
  for (const r of revenueProviders ?? []) {
    if (r.shipping_provider) set.add(r.shipping_provider);
  }
  for (const r of shopifyProviders ?? []) {
    if (r.shipping_provider) set.add(r.shipping_provider);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export const TRANSACTIONS_PAGE_SIZE = PAGE_SIZE;
