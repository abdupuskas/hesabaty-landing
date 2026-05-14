import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { formatEGP } from '@/lib/money';

export function ShopifyCard({
  totalOrdered,
  collectionRate,
  locale,
  title,
  collectedLabel,
  href = '/app/shopify',
}: {
  totalOrdered: number;
  collectionRate: number | null;
  locale: string;
  title: string;
  collectedLabel: string;
  href?: string;
}) {
  const pct =
    collectionRate == null ? null : Math.round(collectionRate * 10) / 10;
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-text-muted"
    >
      <span className="grid size-10 place-items-center rounded-lg bg-success/15 text-success text-lg" aria-hidden>
        🛍️
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text">{title}</div>
        {pct != null ? (
          <div className="text-xs text-success">
            {pct % 1 === 0 ? `${pct}%` : `${pct.toFixed(1)}%`} {collectedLabel}
          </div>
        ) : null}
      </div>
      <div className="text-sm font-medium tabular-nums text-text">
        {formatEGP(totalOrdered, locale)}
      </div>
      <ChevronRight size={16} strokeWidth={1.75} className="text-text-muted" />
    </Link>
  );
}
