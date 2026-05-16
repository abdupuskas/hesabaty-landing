import { createClient } from '@/lib/supabase/server';

export type TaxonomyOption = {
  id: string;
  name: string;
  icon: string | null;
  is_custom: boolean | null;
};

async function listTaxonomy(
  table: 'payment_methods' | 'shipping_providers',
  businessId: string,
): Promise<TaxonomyOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select('id, name, icon, is_custom')
    .or(`business_id.eq.${businessId},business_id.is.null`)
    .order('is_custom', { ascending: true })
    .order('name', { ascending: true });
  return (data ?? []) as TaxonomyOption[];
}

export function listPaymentMethodOptions(businessId: string) {
  return listTaxonomy('payment_methods', businessId);
}

export function listShippingProviderOptions(businessId: string) {
  return listTaxonomy('shipping_providers', businessId);
}
