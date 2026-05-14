'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/business';
import { routing } from '@/i18n/routing';
import { INDUSTRIES } from '@/lib/onboarding/industries';

type Locale = (typeof routing.locales)[number];

function pickLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : routing.defaultLocale;
}

export type BusinessActionResult = { ok: true } | { ok: false; error: string };

const VALID_INDUSTRIES = new Set(INDUSTRIES.map((i) => i.key));

export async function updateBusinessAction(
  formData: FormData
): Promise<BusinessActionResult> {
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

  const business = await getCurrentBusiness();
  if (!business) return { ok: false, error: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('businesses')
    .update({
      name,
      industry,
      custom_industry_name: industry === 'other' ? customIndustryName : null,
    })
    .eq('id', business.id);

  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app`);
  revalidatePath(`/${locale}/app/settings`);
  return { ok: true };
}
