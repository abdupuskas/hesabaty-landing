'use server';

import { headers } from 'next/headers';
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
  | { ok: true; authUrl: string }
  | { ok: false; error: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function normalizeShop(input: string): string | null {
  const cleaned = input.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
  if (!cleaned) return null;
  if (cleaned.includes('.') && !cleaned.endsWith('.myshopify.com')) return null;
  return cleaned.endsWith('.myshopify.com') ? cleaned : `${cleaned}.myshopify.com`;
}

async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return `${proto}://${host}`;
}

export async function connectShopifyAction(formData: FormData): Promise<ConnectResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const storeInput = String(formData.get('store_url') ?? '').trim();
  if (!storeInput) return { ok: false, error: 'storeRequired' };

  const shop = normalizeShop(storeInput);
  if (!shop) return { ok: false, error: 'invalidDomain' };

  const origin = await getRequestOrigin();
  const returnTo = `${origin}/${locale}/app/integrations/shopify`;

  const authUrl =
    `${SUPABASE_URL}/functions/v1/shopify-auth` +
    `?shop=${encodeURIComponent(shop)}` +
    `&user_id=${encodeURIComponent(business.user_id)}` +
    `&return_to=${encodeURIComponent(returnTo)}`;

  return { ok: true, authUrl };
}
