import { createClient } from '@/lib/supabase/server';
import { monthToDateRange } from '@/lib/date-range';

export type ShopifyIntegration = {
  id: string;
  store_url: string;
  is_active: boolean;
  last_synced_at: string | null;
  sync_start_date: string | null;
  created_at: string;
};

export type ShopifyOrderRow = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  total_price: number;
  financial_status: string | null;
  fulfillment_status: string | null;
  shipping_provider: string | null;
  order_created_at: string;
};

export async function getShopifyIntegration(
  businessId: string
): Promise<ShopifyIntegration | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('business_integrations')
    .select('id, store_url, is_active, last_synced_at, sync_start_date, created_at')
    .eq('business_id', businessId)
    .eq('provider', 'shopify')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function listShopifyOrders(
  businessId: string,
  opts: { page: number; pageSize?: number; month?: string | null }
): Promise<{ rows: ShopifyOrderRow[]; total: number; monthTotal: number }> {
  const pageSize = opts.pageSize ?? 20;
  const supabase = await createClient();
  const from = opts.page * pageSize;
  const to = from + pageSize - 1;
  const monthRange = monthToDateRange(opts.month ?? null);

  let q = supabase
    .from('shopify_orders')
    .select(
      'id, order_number, customer_name, total_price, financial_status, fulfillment_status, shipping_provider, order_created_at',
      { count: 'exact' }
    )
    .eq('business_id', businessId);
  if (monthRange) {
    q = q.gte('order_created_at', monthRange.startISO).lt('order_created_at', monthRange.endISO);
  }
  q = q.order('order_created_at', { ascending: false }).range(from, to);

  const { data, count } = await q;
  const rows = (data ?? []) as ShopifyOrderRow[];

  let totalsQ = supabase
    .from('shopify_orders')
    .select('total_price')
    .eq('business_id', businessId);
  if (monthRange) {
    totalsQ = totalsQ
      .gte('order_created_at', monthRange.startISO)
      .lt('order_created_at', monthRange.endISO);
  }
  const { data: totalsData } = await totalsQ;
  const monthTotal = (totalsData ?? []).reduce(
    (s, r) => s + (Number(r.total_price) || 0),
    0
  );

  return { rows, total: count ?? 0, monthTotal };
}
