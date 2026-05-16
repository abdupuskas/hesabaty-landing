import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { getCurrentBusiness } from '@/lib/business';
import { getExpense, listExpenseCategories } from '@/lib/queries/transactions';
import { listPaymentMethodOptions } from '@/lib/queries/payment-shipping';
import { ExpenseForm } from '@/components/app/expense-form';

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app.moneyOut');

  const business = await getCurrentBusiness();
  if (!business) redirect(`/${locale}/app`);

  const [row, categories, paymentMethods] = await Promise.all([
    getExpense(business!.id, id),
    listExpenseCategories(business!.id),
    listPaymentMethodOptions(business!.id),
  ]);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-text">{t('editTitle')}</h1>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <ExpenseForm
          locale={locale}
          categories={categories}
          paymentMethods={paymentMethods}
          initial={{
            id: row.id,
            amount: row.amount,
            name: row.name,
            vendor: row.vendor,
            payment_method: row.payment_method,
            paid_at: row.paid_at,
            due_date: row.due_date,
            is_recurring: row.is_recurring,
            category_id: row.category_id,
            note: row.note,
          }}
        />
      </div>
    </div>
  );
}
