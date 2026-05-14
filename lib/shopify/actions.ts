'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/business';
import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

function pickLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : routing.defaultLocale;
}

export type ShopifyActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function syncShopifyAction(formData: FormData): Promise<ShopifyActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase.functions.invoke('shopify-sync', {
    body: { business_id: business.id },
  });

  if (error) return { ok: false, error: 'syncFailed' };

  revalidatePath(`/${locale}/app/integrations/shopify`);
  revalidatePath(`/${locale}/app`);
  return { ok: true, message: 'synced' };
}

export async function disconnectShopifyAction(
  formData: FormData
): Promise<ShopifyActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase.functions.invoke('shopify-disconnect', {
    body: { business_id: business.id },
  });

  if (error) return { ok: false, error: 'disconnectFailed' };

  revalidatePath(`/${locale}/app/integrations/shopify`);
  revalidatePath(`/${locale}/app`);
  return { ok: true, message: 'disconnected' };
}
