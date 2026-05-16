import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { getCurrentBusiness } from '@/lib/business';
import { getRevenue, listSalesChannels } from '@/lib/queries/transactions';
import {
  listPaymentMethodOptions,
  listShippingProviderOptions,
} from '@/lib/queries/payment-shipping';
import { RevenueForm } from '@/components/app/revenue-form';

export default async function EditRevenuePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app.moneyIn');

  const business = await getCurrentBusiness();
  if (!business) redirect(`/${locale}/app`);

  const [row, channels, paymentMethods, shippingProviders] = await Promise.all([
    getRevenue(business!.id, id),
    listSalesChannels(business!.id),
    listPaymentMethodOptions(business!.id),
    listShippingProviderOptions(business!.id),
  ]);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-text">{t('editTitle')}</h1>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <RevenueForm
          locale={locale}
          channels={channels}
          paymentMethods={paymentMethods}
          shippingProviders={shippingProviders}
          initial={{
            id: row.id,
            amount: row.amount,
            item_name: row.item_name,
            quantity: row.quantity,
            payment_method: row.payment_method,
            shipping_provider: row.shipping_provider,
            status: row.status,
            collected_at: row.collected_at,
            channel_id: row.channel_id,
            note: row.note,
          }}
        />
      </div>
    </div>
  );
}
