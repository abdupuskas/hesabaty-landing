import { Link } from '@/i18n/navigation';
import type { RangeKey } from '@/lib/date-range';

const KEYS: RangeKey[] = ['this-month', 'last-month', 'this-year', 'all-time'];

type Labels = Record<RangeKey, string>;

export function RangeChips({
  active,
  labels,
  basePath,
}: {
  active: RangeKey;
  labels: Labels;
  basePath: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {KEYS.map((key) => {
        const isActive = key === active;
        const href =
          key === 'this-month' ? basePath : `${basePath}?range=${key}`;
        return (
          <Link
            key={key}
            href={href}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border bg-card text-text-secondary hover:text-text hover:border-text-muted'
            }`}
          >
            {labels[key]}
          </Link>
        );
      })}
    </div>
  );
}
