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

export type ConnectResult =
  | { ok: true; storeName: string }
  | { ok: false; error: string };

export async function connectShopifyAction(formData: FormData): Promise<ConnectResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const storeUrl = String(formData.get('store_url') ?? '').trim();
  const accessToken = String(formData.get('access_token') ?? '').trim();

  if (!storeUrl) return { ok: false, error: 'storeRequired' };
  if (!accessToken) return { ok: false, error: 'tokenRequired' };

  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke('shopify-connect', {
    body: { store_url: storeUrl, access_token: accessToken },
  });

  if (error) {
    const msg =
      (error as { context?: { error?: string }; message?: string }).context?.error ??
      (error as { message?: string }).message ??
      '';
    if (/invalid access token/i.test(msg)) return { ok: false, error: 'invalidToken' };
    if (/HTTP 4\d\d/.test(msg) || /could not connect/i.test(msg)) {
      return { ok: false, error: 'storeUnreachable' };
    }
    return { ok: false, error: 'generic' };
  }

  const result = data as
    | { success?: boolean; store_name?: string; error?: string }
    | null;
  if (!result?.success) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/integrations/shopify`);
  revalidatePath(`/${locale}/app`);
  return { ok: true, storeName: result.store_name ?? '' };
}
