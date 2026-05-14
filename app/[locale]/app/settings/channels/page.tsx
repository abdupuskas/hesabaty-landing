import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentBusiness } from '@/lib/business';
import { listSalesChannels } from '@/lib/queries/transactions';
import {
  createChannelAction,
  renameChannelAction,
  deleteChannelAction,
} from '@/lib/channels/actions';
import { TaxonomyManager } from '@/components/app/taxonomy-manager';

export default async function ChannelsSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('app.settings.channels');
  const tForm = await getTranslations('app.form');

  const business = await getCurrentBusiness();
  const channels = business ? await listSalesChannels(business.id) : [];

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
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">{t('title')}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>

      <div className="mt-8">
        <TaxonomyManager
          items={channels}
          locale={locale}
          createAction={createChannelAction}
          renameAction={renameChannelAction}
          deleteAction={deleteChannelAction}
          addLabel={tForm('create')}
          newPlaceholder={tForm('channelName')}
        />
      </div>
    </div>
  );
}
