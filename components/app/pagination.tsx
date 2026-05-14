import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  basePath,
  page,
  total,
  pageSize,
  query,
  filter,
  extras = {},
  prevLabel,
  nextLabel,
  pageLabel,
}: {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
  query: string;
  filter: string;
  extras?: Record<string, string | null | undefined>;
  prevLabel: string;
  nextLabel: string;
  pageLabel: (n: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filter && filter !== 'all') params.set('filter', filter);
    for (const [k, v] of Object.entries(extras)) {
      if (v) params.set(k, v);
    }
    if (p > 0) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-text-secondary">
      <span>{pageLabel(page + 1)}</span>
      <div className="flex items-center gap-2">
        <PagerLink href={buildHref(page - 1)} disabled={!canPrev}>
          <ChevronLeft size={14} strokeWidth={1.75} className="rtl:hidden" />
          <ChevronRight size={14} strokeWidth={1.75} className="hidden rtl:inline" />
          {prevLabel}
        </PagerLink>
        <PagerLink href={buildHref(page + 1)} disabled={!canNext}>
          {nextLabel}
          <ChevronRight size={14} strokeWidth={1.75} className="rtl:hidden" />
          <ChevronLeft size={14} strokeWidth={1.75} className="hidden rtl:inline" />
        </PagerLink>
      </div>
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-text-muted opacity-60">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-text-secondary hover:text-text hover:border-text-muted transition-colors"
    >
      {children}
    </Link>
  );
}
