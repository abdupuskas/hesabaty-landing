import { Link } from '@/i18n/navigation';
import { Search, Plus } from 'lucide-react';

type Filter = 'all' | 'paid' | 'unpaid';

export function ListToolbar({
  basePath,
  query,
  filter,
  extras = {},
  searchPlaceholder,
  filterLabels,
  addHref,
  addLabel,
  rightSlot,
}: {
  basePath: string;
  query: string;
  filter: Filter;
  extras?: Record<string, string | null | undefined>;
  searchPlaceholder: string;
  filterLabels: Record<Filter, string>;
  addHref: string;
  addLabel: string;
  rightSlot?: React.ReactNode;
}) {
  const filters: Filter[] = ['all', 'paid', 'unpaid'];

  const buildHref = (next: Filter) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (next !== 'all') params.set('filter', next);
    for (const [k, v] of Object.entries(extras)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form action={basePath} method="get" className="flex items-center gap-2">
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={searchPlaceholder}
            className="w-56 rounded-md border border-border bg-card py-2 ps-9 pe-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        {filter !== 'all' ? <input type="hidden" name="filter" value={filter} /> : null}
        {Object.entries(extras).map(([k, v]) =>
          v ? <input key={k} type="hidden" name={k} value={v} /> : null
        )}
      </form>
      {rightSlot}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {filters.map((f) => {
            const active = f === filter;
            return (
              <Link
                key={f}
                href={buildHref(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-card text-text-secondary hover:text-text hover:border-text-muted'
                }`}
              >
                {filterLabels[f]}
              </Link>
            );
          })}
        </div>
        <Link
          href={addHref}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-background hover:bg-accent/90 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          {addLabel}
        </Link>
      </div>
    </div>
  );
}
