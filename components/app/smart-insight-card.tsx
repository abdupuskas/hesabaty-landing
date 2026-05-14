'use client';

import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function SmartInsightCard({
  insights,
  title,
}: {
  insights: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  if (insights.length === 0) return null;

  const safeIndex = ((index % insights.length) + insights.length) % insights.length;
  const total = insights.length;
  const current = insights[safeIndex];

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-accent/10 text-accent">
            <Sparkles size={14} strokeWidth={2} />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">{title}</h2>
        </div>
        <span className="text-xs tabular-nums text-text-muted">
          {safeIndex + 1}/{total}
        </span>
      </header>
      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed text-text">{current}</p>
      {total > 1 ? (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {insights.map((_, i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full transition-colors ${
                  i === safeIndex ? 'bg-accent' : 'bg-text-muted/30'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIndex(safeIndex - 1)}
              className="grid size-7 place-items-center rounded-md border border-border text-text-secondary hover:text-text hover:border-text-muted transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={14} strokeWidth={1.75} className="rtl:hidden" />
              <ChevronRight size={14} strokeWidth={1.75} className="hidden rtl:inline" />
            </button>
            <button
              type="button"
              onClick={() => setIndex(safeIndex + 1)}
              className="grid size-7 place-items-center rounded-md border border-border text-text-secondary hover:text-text hover:border-text-muted transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={14} strokeWidth={1.75} className="rtl:hidden" />
              <ChevronLeft size={14} strokeWidth={1.75} className="hidden rtl:inline" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
