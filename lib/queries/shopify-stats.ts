import { createClient } from '@/lib/supabase/server';
import type { DateRange } from '@/lib/date-range';

export type ShopifyStats = {
  totalOrdered: number;
  orderCount: number;
  paidCount: number;
  avgOrderValue: number;
  refundedCount: number;
  refundedTotal: number;
  totalUnits: number;
  upt: number;
};

export type CollectionMetrics = {
  rate: number | null;
  gap: number;
  actualCollected: number;
  totalOrdered: number;
  missingOrders: number;
  missingUnits: number;
};

type LineItem = { quantity?: number | string; price?: number | string };

function unitCount(json: unknown): number {
  if (!Array.isArray(json)) return 0;
  return (json as LineItem[]).reduce((sum, it) => {
    const q = typeof it.quantity === 'number' ? it.quantity : Number(it.quantity ?? 0);
    return sum + (Number.isFinite(q) ? q : 0);
  }, 0);
}

export async function getShopifyStats(
  businessId: string,
  range: DateRange
): Promise<ShopifyStats> {
  const supabase = await createClient();

  let q = supabase
    .from('shopify_orders')
    .select('total_price, financial_status, line_items_json, order_created_at')
    .eq('business_id', businessId);
  if (range.startISO) q = q.gte('order_created_at', range.startISO);
  if (range.endISO) q = q.lt('order_created_at', range.endISO);

  const { data } = await q;
  const rows = data ?? [];

  let totalOrdered = 0;
  let orderCount = 0;
  let paidCount = 0;
  let refundedCount = 0;
  let refundedTotal = 0;
  let totalUnits = 0;

  for (const row of rows) {
    const price = Number(row.total_price ?? 0);
    const status = String(row.financial_status ?? '').toLowerCase();
    const isRefunded = status === 'refunded' || status === 'partially_refunded';

    orderCount += 1;
    if (!isRefunded) totalOrdered += price;
    if (status === 'paid') paidCount += 1;
    if (isRefunded) {
      refundedCount += 1;
      refundedTotal += price;
    }
    totalUnits += unitCount(row.line_items_json);
  }

  const avgOrderValue = orderCount > 0 ? totalOrdered / Math.max(orderCount - refundedCount, 1) : 0;
  const upt = orderCount > 0 ? totalUnits / orderCount : 0;

  return {
    totalOrdered,
    orderCount,
    paidCount,
    avgOrderValue,
    refundedCount,
    refundedTotal,
    totalUnits,
    upt,
  };
}

export async function getCollectionMetrics(
  businessId: string,
  range: DateRange
): Promise<CollectionMetrics> {
  const supabase = await createClient();
  const stats = await getShopifyStats(businessId, range);

  const shopifyChannel = await supabase
    .from('sales_channels')
    .select('id')
    .or(`business_id.eq.${businessId},business_id.is.null`)
    .ilike('name', 'shopify')
    .maybeSingle();

  let actualQ = supabase
    .from('revenue_entries')
    .select('amount, quantity')
    .eq('business_id', businessId)
    .eq('status', 'paid');
  if (shopifyChannel.data?.id) actualQ = actualQ.eq('channel_id', shopifyChannel.data.id);
  if (range.startISO) actualQ = actualQ.gte('collected_at', range.startISO);
  if (range.endISO) actualQ = actualQ.lt('collected_at', range.endISO);

  const { data: collected } = await actualQ;
  const actualCollected = (collected ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const collectedUnits = (collected ?? []).reduce((s, r) => s + (r.quantity ?? 0), 0);

  const gap = Math.max(stats.totalOrdered - actualCollected, 0);
  const rate = stats.totalOrdered > 0 ? (actualCollected / stats.totalOrdered) * 100 : null;
  const missingUnits = Math.max(stats.totalUnits - collectedUnits, 0);
  const missingOrders =
    stats.avgOrderValue > 0 ? Math.round(gap / stats.avgOrderValue) : 0;

  return {
    rate,
    gap,
    actualCollected,
    totalOrdered: stats.totalOrdered,
    missingOrders,
    missingUnits,
  };
}
