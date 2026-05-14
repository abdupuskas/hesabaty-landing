'use server';

import { redirect } from 'next/navigation';
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

export type ActionResult = { ok: true } | { ok: false; error: string };

function parseAmount(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const cleaned = String(raw).trim().replace(/,/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function nullableString(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const v = String(raw).trim();
  return v ? v : null;
}

function nullableDate(raw: FormDataEntryValue | null): string | null {
  const v = nullableString(raw);
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function nullableUuid(raw: FormDataEntryValue | null): string | null {
  const v = nullableString(raw);
  if (!v) return null;
  if (!/^[0-9a-fA-F-]{36}$/.test(v)) return null;
  return v;
}

async function requireBusinessId() {
  const business = await getCurrentBusiness();
  if (!business) redirect('/');
  return business!.id;
}

export async function createRevenueAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const businessId = await requireBusinessId();

  const amount = parseAmount(formData.get('amount'));
  if (amount == null) return { ok: false, error: 'amountInvalid' };

  const status = String(formData.get('status') ?? 'paid') === 'unpaid' ? 'unpaid' : 'paid';
  const quantityRaw = nullableString(formData.get('quantity'));
  const quantity = quantityRaw && Number.isFinite(Number(quantityRaw)) ? Number(quantityRaw) : null;

  const supabase = await createClient();
  const { error } = await supabase.from('revenue_entries').insert({
    business_id: businessId,
    amount,
    item_name: nullableString(formData.get('item_name')),
    quantity,
    payment_method: nullableString(formData.get('payment_method')),
    shipping_provider: nullableString(formData.get('shipping_provider')),
    status,
    collected_at: nullableDate(formData.get('collected_at')) ?? new Date().toISOString(),
    channel_id: nullableUuid(formData.get('channel_id')),
    note: nullableString(formData.get('note')),
  });

  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/money-in`);
  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app/money-in`);
}

export async function updateRevenueAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const businessId = await requireBusinessId();
  const id = nullableUuid(formData.get('id'));
  if (!id) return { ok: false, error: 'generic' };

  const amount = parseAmount(formData.get('amount'));
  if (amount == null) return { ok: false, error: 'amountInvalid' };

  const status = String(formData.get('status') ?? 'paid') === 'unpaid' ? 'unpaid' : 'paid';
  const quantityRaw = nullableString(formData.get('quantity'));
  const quantity = quantityRaw && Number.isFinite(Number(quantityRaw)) ? Number(quantityRaw) : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from('revenue_entries')
    .update({
      amount,
      item_name: nullableString(formData.get('item_name')),
      quantity,
      payment_method: nullableString(formData.get('payment_method')),
      shipping_provider: nullableString(formData.get('shipping_provider')),
      status,
      collected_at: nullableDate(formData.get('collected_at')),
      channel_id: nullableUuid(formData.get('channel_id')),
      note: nullableString(formData.get('note')),
    })
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/money-in`);
  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app/money-in`);
}

export async function deleteRevenueAction(formData: FormData) {
  const locale = pickLocale(formData);
  const businessId = await requireBusinessId();
  const id = nullableUuid(formData.get('id'));
  if (!id) redirect(`/${locale}/app/money-in`);

  const supabase = await createClient();
  await supabase.from('revenue_entries').delete().eq('id', id!).eq('business_id', businessId);

  revalidatePath(`/${locale}/app/money-in`);
  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app/money-in`);
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const businessId = await requireBusinessId();

  const amount = parseAmount(formData.get('amount'));
  if (amount == null) return { ok: false, error: 'amountInvalid' };

  const isPaid = String(formData.get('status') ?? 'paid') !== 'unpaid';
  const isRecurring = formData.get('is_recurring') === 'on';

  const supabase = await createClient();
  const { error } = await supabase.from('expenses').insert({
    business_id: businessId,
    amount,
    name: nullableString(formData.get('name')),
    vendor: nullableString(formData.get('vendor')),
    payment_method: nullableString(formData.get('payment_method')),
    paid_at: isPaid ? nullableDate(formData.get('paid_at')) ?? new Date().toISOString() : null,
    due_date: nullableDate(formData.get('due_date')),
    is_recurring: isRecurring,
    category_id: nullableUuid(formData.get('category_id')),
    note: nullableString(formData.get('note')),
  });

  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/money-out`);
  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app/money-out`);
}

export async function updateExpenseAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const businessId = await requireBusinessId();
  const id = nullableUuid(formData.get('id'));
  if (!id) return { ok: false, error: 'generic' };

  const amount = parseAmount(formData.get('amount'));
  if (amount == null) return { ok: false, error: 'amountInvalid' };

  const isPaid = String(formData.get('status') ?? 'paid') !== 'unpaid';
  const isRecurring = formData.get('is_recurring') === 'on';

  const supabase = await createClient();
  const { error } = await supabase
    .from('expenses')
    .update({
      amount,
      name: nullableString(formData.get('name')),
      vendor: nullableString(formData.get('vendor')),
      payment_method: nullableString(formData.get('payment_method')),
      paid_at: isPaid ? nullableDate(formData.get('paid_at')) ?? new Date().toISOString() : null,
      due_date: nullableDate(formData.get('due_date')),
      is_recurring: isRecurring,
      category_id: nullableUuid(formData.get('category_id')),
      note: nullableString(formData.get('note')),
    })
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) return { ok: false, error: 'generic' };

  revalidatePath(`/${locale}/app/money-out`);
  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app/money-out`);
}

export async function deleteExpenseAction(formData: FormData) {
  const locale = pickLocale(formData);
  const businessId = await requireBusinessId();
  const id = nullableUuid(formData.get('id'));
  if (!id) redirect(`/${locale}/app/money-out`);

  const supabase = await createClient();
  await supabase.from('expenses').delete().eq('id', id!).eq('business_id', businessId);

  revalidatePath(`/${locale}/app/money-out`);
  revalidatePath(`/${locale}/app`);
  redirect(`/${locale}/app/money-out`);
}

export async function createSalesChannelAction(formData: FormData): Promise<ActionResult> {
  const businessId = await requireBusinessId();
  const name = nullableString(formData.get('name'));
  if (!name) return { ok: false, error: 'generic' };

  const supabase = await createClient();
  const { error } = await supabase.from('sales_channels').insert({
    business_id: businessId,
    name,
    is_custom: true,
  });
  if (error) return { ok: false, error: 'generic' };
  return { ok: true };
}

export async function createExpenseCategoryAction(formData: FormData): Promise<ActionResult> {
  const businessId = await requireBusinessId();
  const name = nullableString(formData.get('name'));
  if (!name) return { ok: false, error: 'generic' };

  const supabase = await createClient();
  const { error } = await supabase.from('expense_categories').insert({
    business_id: businessId,
    name,
    is_custom: true,
  });
  if (error) return { ok: false, error: 'generic' };
  return { ok: true };
}
