import { Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/date-range';

export function AIInsightCard({
  content,
  generatedAt,
  locale,
  title,
  generatedLabel,
  emptyLabel,
}: {
  content: string | null;
  generatedAt: string | null;
  locale: string;
  title: string;
  generatedLabel: string;
  emptyLabel: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-md bg-accent/10 text-accent">
          <Sparkles size={14} strokeWidth={2} />
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">{title}</h2>
      </header>
      {content ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-text">{content}</p>
          {generatedAt ? (
            <p className="mt-3 text-xs text-text-muted">
              {generatedLabel} · {formatDate(generatedAt, locale)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">{emptyLabel}</p>
      )}
    </section>
  );
}
