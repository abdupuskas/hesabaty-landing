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

export type ChannelActionResult = { ok: true } | { ok: false; error: string };

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

export async function createChannelAction(
  formData: FormData
): Promise<ChannelActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const name = nullableString(formData.get('name'));
  if (!name) return { ok: false, error: 'nameRequired' };

  const supabase = await createClient();
  const { error } = await supabase.from('sales_channels').insert({
    business_id: business.id,
    name,
    is_custom: true,
  });
  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/settings/channels`);
  return { ok: true };
}

export async function renameChannelAction(
  formData: FormData
): Promise<ChannelActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const id = nullableUuid(formData.get('id'));
  const name = nullableString(formData.get('name'));
  if (!id || !name) return { ok: false, error: 'nameRequired' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('sales_channels')
    .update({ name })
    .eq('id', id)
    .eq('business_id', business.id);
  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/settings/channels`);
  return { ok: true };
}

export async function deleteChannelAction(
  formData: FormData
): Promise<ChannelActionResult> {
  const locale = pickLocale(formData);
  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const id = nullableUuid(formData.get('id'));
  if (!id) return { ok: false, error: 'generic' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('sales_channels')
    .delete()
    .eq('id', id)
    .eq('business_id', business.id);
  if (error) return { ok: false, error: 'inUse' };

  revalidatePath(`/${locale}/app/settings/channels`);
  return { ok: true };
}
