import { createClient } from '@/lib/supabase/server';
import type { DateRange } from '@/lib/date-range';
import {
  getShopifyStats,
  getCollectionMetrics,
  type ShopifyStats,
  type CollectionMetrics,
} from '@/lib/queries/shopify-stats';
import { getShopifyIntegration } from '@/lib/queries/shopify';

export type ExportRevenueRow = {
  date: string | null;
  itemName: string | null;
  channel: string | null;
  paymentMethod: string | null;
  shippingProvider: string | null;
  status: string;
  amount: number;
  quantity: number | null;
  note: string | null;
};

export type ExportExpenseRow = {
  date: string | null;
  name: string | null;
  vendor: string | null;
  category: string | null;
  paymentMethod: string | null;
  status: 'paid' | 'unpaid';
  amount: number;
  note: string | null;
};

export type ExportShopifyOrder = {
  date: string | null;
  orderNumber: string | null;
  customer: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  amount: number;
};

export type ExportUnpaidSummary = {
  unpaidRevenueCount: number;
  unpaidRevenueTotal: number;
  unpaidExpensesCount: number;
  unpaidExpensesTotal: number;
};

export type ExportDetail = {
  revenue: ExportRevenueRow[];
  expenses: ExportExpenseRow[];
  unpaid: ExportUnpaidSummary;
  shopify: {
    connected: boolean;
    storeUrl: string | null;
    stats: ShopifyStats | null;
    collection: CollectionMetrics | null;
    orders: ExportShopifyOrder[];
  };
};

export async function getExportDetail(
  businessId: string,
  range: DateRange,
): Promise<ExportDetail> {
  const supabase = await createClient();

  const revQuery = supabase
    .from('revenue_entries')
    .select(
      'amount, item_name, quantity, payment_method, shipping_provider, status, collected_at, note, sales_channels ( name )',
    )
    .eq('business_id', businessId)
    .order('collected_at', { ascending: false, nullsFirst: false });

  const expQuery = supabase
    .from('expenses')
    .select(
      'amount, name, vendor, payment_method, paid_at, due_date, note, expense_categories ( name )',
    )
    .eq('business_id', businessId)
    .order('paid_at', { ascending: false, nullsFirst: false });

  if (range.startISO) revQuery.gte('collected_at', range.startISO);
  if (range.endISO) revQuery.lt('collected_at', range.endISO);
  if (range.startISO) expQuery.gte('paid_at', range.startISO);
  if (range.endISO) expQuery.lt('paid_at', range.endISO);

  const [revRes, expRes, integration] = await Promise.all([
    revQuery,
    expQuery,
    getShopifyIntegration(businessId),
  ]);

  type RawRev = {
    amount: number;
    item_name: string | null;
    quantity: number | null;
    payment_method: string | null;
    shipping_provider: string | null;
    status: string;
    collected_at: string | null;
    note: string | null;
    sales_channels: { name: string } | null;
  };
  type RawExp = {
    amount: number;
    name: string | null;
    vendor: string | null;
    payment_method: string | null;
    paid_at: string | null;
    due_date: string | null;
    note: string | null;
    expense_categories: { name: string } | null;
  };

  const revenue: ExportRevenueRow[] = ((revRes.data ?? []) as RawRev[]).map((r) => ({
    date: r.collected_at,
    itemName: r.item_name,
    channel: r.sales_channels?.name ?? null,
    paymentMethod: r.payment_method,
    shippingProvider: r.shipping_provider,
    status: r.status,
    amount: r.amount,
    quantity: r.quantity,
    note: r.note,
  }));

  const expenses: ExportExpenseRow[] = ((expRes.data ?? []) as RawExp[]).map((r) => ({
    date: r.paid_at ?? r.due_date,
    name: r.name,
    vendor: r.vendor,
    category: r.expense_categories?.name ?? null,
    paymentMethod: r.payment_method,
    status: r.paid_at ? 'paid' : 'unpaid',
    amount: r.amount,
    note: r.note,
  }));

  const unpaid: ExportUnpaidSummary = {
    unpaidRevenueCount: revenue.filter((r) => r.status === 'unpaid').length,
    unpaidRevenueTotal: revenue
      .filter((r) => r.status === 'unpaid')
      .reduce((s, r) => s + r.amount, 0),
    unpaidExpensesCount: expenses.filter((e) => e.status === 'unpaid').length,
    unpaidExpensesTotal: expenses
      .filter((e) => e.status === 'unpaid')
      .reduce((s, e) => s + e.amount, 0),
  };

  let stats: ShopifyStats | null = null;
  let collection: CollectionMetrics | null = null;
  let orders: ExportShopifyOrder[] = [];

  if (integration?.is_active) {
    [stats, collection] = await Promise.all([
      getShopifyStats(businessId, range),
      getCollectionMetrics(businessId, range),
    ]);

    let ordersQ = supabase
      .from('shopify_orders')
      .select(
        'order_number, customer_name, total_price, financial_status, fulfillment_status, order_created_at',
      )
      .eq('business_id', businessId)
      .order('order_created_at', { ascending: false, nullsFirst: false })
      .limit(50);
    if (range.startISO) ordersQ = ordersQ.gte('order_created_at', range.startISO);
    if (range.endISO) ordersQ = ordersQ.lt('order_created_at', range.endISO);
    const ordersRes = await ordersQ;
    type RawOrder = {
      order_number: string | null;
      customer_name: string | null;
      total_price: number;
      financial_status: string | null;
      fulfillment_status: string | null;
      order_created_at: string | null;
    };
    orders = ((ordersRes.data ?? []) as RawOrder[]).map((o) => ({
      date: o.order_created_at,
      orderNumber: o.order_number,
      customer: o.customer_name,
      financialStatus: o.financial_status,
      fulfillmentStatus: o.fulfillment_status,
      amount: o.total_price,
    }));
  }

  return {
    revenue,
    expenses,
    unpaid,
    shopify: {
      connected: !!integration?.is_active,
      storeUrl: integration?.store_url ?? null,
      stats,
      collection,
      orders,
    },
  };
}
