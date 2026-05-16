import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentBusiness } from '@/lib/business';
import { listShippingProviderOptions } from '@/lib/queries/payment-shipping';
import {
  createShippingProviderAction,
  renameShippingProviderAction,
  deleteShippingProviderAction,
} from '@/lib/payment-shipping/actions';
import { TaxonomyManager } from '@/components/app/taxonomy-manager';

export default async function ShippingProvidersSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app.settings.shippingProviders');
  const tForm = await getTranslations('app.form');

  const business = await getCurrentBusiness();
  const providers = business ? await listShippingProviderOptions(business.id) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/app/settings"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
      >
        <ChevronLeft size={14} strokeWidth={1.75} className="rtl:hidden" />
        <ChevronRight size={14} strokeWidth={1.75} className="hidden rtl:inline" />
        {t('back')}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">
        {t('title')}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>

      <div className="mt-8">
        <TaxonomyManager
          items={providers}
          locale={locale}
          createAction={createShippingProviderAction}
          renameAction={renameShippingProviderAction}
          deleteAction={deleteShippingProviderAction}
          addLabel={tForm('create')}
          newPlaceholder={t('placeholder')}
        />
      </div>
    </div>
  );
}
