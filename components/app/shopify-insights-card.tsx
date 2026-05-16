import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { formatEGP } from '@/lib/money';
import type { ShopifyStats, CollectionMetrics } from '@/lib/queries/shopify-stats';

export function ShopifyInsightsCard({
  stats,
  collection,
  locale,
  title,
  collectionRateLabel,
  revenueGapLabel,
  missingOrdersLabel,
  missingUnitsLabel,
  investigateLabel,
  paidOrdersLabel,
  orderVolumeLabel,
  totalOrderedLabel,
  avgOrderValueLabel,
}: {
  stats: ShopifyStats;
  collection: CollectionMetrics;
  locale: string;
  title: string;
  collectionRateLabel: string;
  revenueGapLabel: string;
  missingOrdersLabel: string;
  missingUnitsLabel: string;
  investigateLabel: string;
  paidOrdersLabel: string;
  orderVolumeLabel: string;
  totalOrderedLabel: string;
  avgOrderValueLabel: string;
}) {
  if (stats.orderCount === 0) return null;
  const rate = collection.rate;
  const rateStr =
    rate == null
      ? '—'
      : rate % 1 === 0
        ? `${rate.toFixed(0)}%`
        : `${rate.toFixed(1)}%`;
  const rateColor =
    rate == null
      ? 'text-text-muted'
      : rate >= 80
        ? 'text-success'
        : rate >= 60
          ? 'text-warning'
          : 'text-danger';

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="grid size-7 place-items-center rounded-md bg-success/15 text-success text-base" aria-hidden>
          🛍️
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      </header>
      <dl className="divide-y divide-border/60">
        <Row label={collectionRateLabel} value={<span className={`font-semibold ${rateColor}`}>{rateStr}</span>} />
        <Row
          label={revenueGapLabel}
          value={
            <span className="font-semibold tabular-nums text-text">
              {formatEGP(collection.gap, locale)}
            </span>
          }
        />
        <li className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
          <span className="text-text-secondary">
            ≈ {collection.missingOrders} {missingOrdersLabel} · {collection.missingUnits} {missingUnitsLabel}
          </span>
          <Link
            href="/app/shopify/reconciliation"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80"
          >
            {investigateLabel}
            <ArrowRight size={12} strokeWidth={2} className="rtl:hidden" />
          </Link>
        </li>
        <Row
          label={paidOrdersLabel}
          value={
            <span className="font-semibold tabular-nums text-success">{stats.paidCount}</span>
          }
        />
        <Row
          label={orderVolumeLabel}
          value={
            <span className="font-semibold tabular-nums text-text">{stats.orderCount}</span>
          }
        />
        <Row
          label={totalOrderedLabel}
          value={
            <span className="font-semibold tabular-nums text-text">
              {formatEGP(stats.totalOrdered, locale)}
            </span>
          }
        />
        <Row
          label={avgOrderValueLabel}
          value={
            <span className="font-semibold tabular-nums text-text">
              {formatEGP(stats.avgOrderValue, locale)}
            </span>
          }
        />
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
      <dt className="text-text-secondary">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
