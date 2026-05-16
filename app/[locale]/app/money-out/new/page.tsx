import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentBusiness } from '@/lib/business';
import { listExpenseCategories } from '@/lib/queries/transactions';
import { listPaymentMethodOptions } from '@/lib/queries/payment-shipping';
import { ExpenseForm } from '@/components/app/expense-form';

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app.moneyOut');

  const business = await getCurrentBusiness();
  if (!business) redirect(`/${locale}/app`);

  const [categories, paymentMethods] = await Promise.all([
    listExpenseCategories(business!.id),
    listPaymentMethodOptions(business!.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-text">{t('newTitle')}</h1>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <ExpenseForm
          locale={locale}
          categories={categories}
          paymentMethods={paymentMethods}
        />
      </div>
    </div>
  );
}
