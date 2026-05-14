'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { routing } from '@/i18n/routing';
import { INDUSTRIES } from './industries';

type Locale = (typeof routing.locales)[number];

function pickLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : routing.defaultLocale;
}

export type OnboardingResult = { ok: true } | { ok: false; error: string };

const VALID_INDUSTRIES = new Set(INDUSTRIES.map((i) => i.key));

export async function completeOnboardingAction(
  formData: FormData
): Promise<OnboardingResult> {
  const locale = pickLocale(formData);
  const name = String(formData.get('name') ?? '').trim();
  const industry = String(formData.get('industry') ?? '').trim();
  const customIndustryName =
    String(formData.get('custom_industry_name') ?? '').trim() || null;

  if (name.length < 2) return { ok: false, error: 'nameRequired' };
  if (!industry || !VALID_INDUSTRIES.has(industry)) {
    return { ok: false, error: 'industryRequired' };
  }
  if (industry === 'other' && !customIndustryName) {
    return { ok: false, error: 'customIndustryRequired' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (existing) {
    redirect(`/${locale}/app`);
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .insert({
      user_id: user.id,
      name,
      industry,
      custom_industry_name: customIndustryName,
    })
    .select('id')
    .single();

  if (error || !business) return { ok: false, error: 'generic' };

  const channelKeys = formData
    .getAll('channels')
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (channelKeys.length > 0) {
    await supabase.from('sales_channels').insert(
      channelKeys.map((channelName) => ({
        business_id: business.id,
        name: channelName,
        is_custom: true,
        industry,
      }))
    );
  }

  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app`);
}
