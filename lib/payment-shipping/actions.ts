'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/business';
import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];
type Table = 'payment_methods' | 'shipping_providers';

export type TaxonomyActionResult = { ok: true } | { ok: false; error: string };

function pickLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : routing.defaultLocale;
}

function nullableString(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const v = String(raw).trim();
  return v ? v : null;
}

function nullableUuid(raw: FormDataEntryValue | null): string | null {
  const v = nullableString(raw);
  if (!v) return null;
  if (!/^[0-9a-fA-F-]{36}$/.test(v)) return null;
  return v;
}

async function createRow(
  table: Table,
  formData: FormData,
  settingsSlug: string,
): Promise<TaxonomyActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const name = nullableString(formData.get('name'));
  if (!name) return { ok: false, error: 'nameRequired' };
  const icon = nullableString(formData.get('icon'));

  const supabase = await createClient();
  const { error } = await supabase.from(table).insert({
    business_id: business.id,
    name,
    icon,
    is_custom: true,
  });
  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/settings/${settingsSlug}`);
  return { ok: true };
}

async function renameRow(
  table: Table,
  formData: FormData,
  settingsSlug: string,
): Promise<TaxonomyActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const id = nullableUuid(formData.get('id'));
  const name = nullableString(formData.get('name'));
  if (!id || !name) return { ok: false, error: 'nameRequired' };

  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .update({ name })
    .eq('id', id)
    .eq('business_id', business.id);
  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/settings/${settingsSlug}`);
  return { ok: true };
}

async function deleteRow(
  table: Table,
  formData: FormData,
  settingsSlug: string,
): Promise<TaxonomyActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const id = nullableUuid(formData.get('id'));
  if (!id) return { ok: false, error: 'generic' };

  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('business_id', business.id);
  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/settings/${settingsSlug}`);
  return { ok: true };
}

export async function createPaymentMethodAction(formData: FormData) {
  return createRow('payment_methods', formData, 'payment-methods');
}
export async function renamePaymentMethodAction(formData: FormData) {
  return renameRow('payment_methods', formData, 'payment-methods');
}
export async function deletePaymentMethodAction(formData: FormData) {
  return deleteRow('payment_methods', formData, 'payment-methods');
}

export async function createShippingProviderAction(formData: FormData) {
  return createRow('shipping_providers', formData, 'shipping-providers');
}
export async function renameShippingProviderAction(formData: FormData) {
  return renameRow('shipping_providers', formData, 'shipping-providers');
}
export async function deleteShippingProviderAction(formData: FormData) {
  return deleteRow('shipping_providers', formData, 'shipping-providers');
}
