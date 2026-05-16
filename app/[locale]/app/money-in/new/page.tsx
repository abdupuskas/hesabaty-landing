import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentBusiness } from '@/lib/business';
import { listSalesChannels } from '@/lib/queries/transactions';
import {
  listPaymentMethodOptions,
  listShippingProviderOptions,
} from '@/lib/queries/payment-shipping';
import { RevenueForm } from '@/components/app/revenue-form';

export default async function NewRevenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    amount?: string;
    item_name?: string;
    collected_at?: string;
    note?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.moneyIn');

  const business = await getCurrentBusiness();
  if (!business) redirect(`/${locale}/app`);

  const [channels, paymentMethods, shippingProviders] = await Promise.all([
    listSalesChannels(business!.id),
    listPaymentMethodOptions(business!.id),
    listShippingProviderOptions(business!.id),
  ]);

  const amountCents = sp.amount && Number.isFinite(Number(sp.amount))
    ? Math.round(Number(sp.amount) * 100)
    : undefined;
  const collectedAt = sp.collected_at
    ? new Date(sp.collected_at).toISOString()
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-text">{t('newTitle')}</h1>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <RevenueForm
          locale={locale}
          channels={channels}
          paymentMethods={paymentMethods}
          shippingProviders={shippingProviders}
          initial={
            amountCents != null || sp.item_name || collectedAt || sp.note
              ? {
                  amount: amountCents,
                  item_name: sp.item_name ?? null,
                  collected_at: collectedAt,
                  note: sp.note ?? null,
                  status: 'paid',
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
