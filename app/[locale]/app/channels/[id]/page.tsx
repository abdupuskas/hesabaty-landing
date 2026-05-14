import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentBusiness } from '@/lib/business';
import { TRANSACTIONS_PAGE_SIZE } from '@/lib/queries/transactions';
import { createClient } from '@/lib/supabase/server';
import { formatEGP } from '@/lib/money';
import { formatDate } from '@/lib/date-range';
import { Pagination } from '@/components/app/pagination';

function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function ChannelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, id } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('app.channelDetail');
  const tList = await getTranslations('app.list');

  const business = await getCurrentBusiness();
  if (!business) redirect(`/${locale}/app`);

  const supabase = await createClient();
  const { data: channel } = await supabase
    .from('sales_channels')
    .select('id, name')
    .eq('id', id)
    .or(`business_id.eq.${business!.id},business_id.is.null`)
    .maybeSingle();
  if (!channel) notFound();

  const page = parsePage(sp.page);
  const from = page * TRANSACTIONS_PAGE_SIZE;
  const to = from + TRANSACTIONS_PAGE_SIZE - 1;

  const { data: rows, count } = await supabase
    .from('revenue_entries')
    .select('id, amount, item_name, status, collected_at', { count: 'exact' })
    .eq('business_id', business!.id)
    .eq('channel_id', id)
    .order('collected_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  const { data: totalAgg } = await supabase
    .from('revenue_entries')
    .select('amount')
    .eq('business_id', business!.id)
    .eq('channel_id', id);

  const total = (totalAgg ?? []).reduce(
    (s: number, r: { amount: number | null }) => s + (r.amount ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/app/reports"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
      >
        <ChevronLeft size={14} strokeWidth={1.75} className="rtl:hidden" />
        <ChevronRight size={14} strokeWidth={1.75} className="hidden rtl:inline" />
        {t('back')}
      </Link>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-text">{channel.name}</h1>
        <span className="tabular-nums text-lg font-semibold text-success">
          {formatEGP(total, locale)}
        </span>
      </div>
      <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>

      <section className="mt-6 rounded-xl border border-border bg-card">
        {(rows ?? []).length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-text-secondary">{t('empty')}</p>
        ) : (
          <ul>
            {(rows ?? []).map((row) => {
              const r = row as {
                id: string;
                amount: number;
                item_name: string | null;
                status: string;
                collected_at: string | null;
              };
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0"
                >
                  <Link
                    href={`/app/money-in/${r.id}/edit` as `/${string}`}
                    className="flex flex-1 items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-text">{r.item_name ?? '—'}</div>
                      <div className="text-xs text-text-muted">
                        {r.collected_at ? formatDate(r.collected_at, locale) : '—'}
                      </div>
                    </div>
                    {r.status === 'unpaid' ? (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                        {tList('filterUnpaid')}
                      </span>
                    ) : null}
                    <div className="tabular-nums text-sm font-medium text-success">
                      {formatEGP(r.amount, locale)}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination
          basePath={`/app/channels/${id}`}
          page={page}
          total={count ?? 0}
          pageSize={TRANSACTIONS_PAGE_SIZE}
          query=""
          filter="all"
          prevLabel={tList('previous')}
          nextLabel={tList('next')}
          pageLabel={(n) => tList('page', { n })}
        />
      </section>
    </div>
  );
}
