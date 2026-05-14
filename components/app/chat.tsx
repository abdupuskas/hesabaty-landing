'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Message = { role: 'user' | 'assistant'; content: string };

const MAX_HISTORY = 10;

export function Chat({ suggestions }: { suggestions: string[] }) {
  const t = useTranslations('app.ask');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, pending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setError(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { data, error: invokeError } = await supabase.functions.invoke('ai-chat', {
          body: { messages: next.slice(-MAX_HISTORY) },
        });

        if (invokeError) {
          setError(t('errors.network'));
          return;
        }

        const result = data as
          | { role: 'assistant'; content: string; remaining: number }
          | { error: string; remaining?: number };

        if ('error' in result) {
          setError(result.error || t('errors.generic'));
          if (typeof result.remaining === 'number') setRemaining(result.remaining);
          return;
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: result.content }]);
        if (typeof result.remaining === 'number') setRemaining(result.remaining);
      } catch {
        setError(t('errors.network'));
      }
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[480px] flex-col rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} strokeWidth={1.75} className="text-accent" />
          <h2 className="text-sm font-medium text-text">{t('title')}</h2>
        </div>
        <div className="flex items-center gap-3">
          {remaining != null ? (
            <span className="text-xs text-text-muted">
              {t('remaining', { n: remaining })}
            </span>
          ) : null}
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-text-secondary hover:text-text hover:border-text-muted transition-colors"
            >
              <RotateCcw size={12} strokeWidth={1.75} />
              {t('reset')}
            </button>
          ) : null}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        {messages.length === 0 ? (
          <EmptyState
            heading={t('empty.heading')}
            body={t('empty.body')}
            suggestions={suggestions}
            onPick={send}
            disabled={pending}
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <li key={i}>
                <Bubble role={m.role}>
                  {m.role === 'assistant' ? (
                    <div className="prose-chat">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </Bubble>
              </li>
            ))}
            {pending ? (
              <li>
                <Bubble role="assistant">
                  <TypingDots />
                </Bubble>
              </li>
            ) : null}
          </ul>
        )}
        {error ? (
          <p className="mt-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={pending}
            placeholder={t('placeholder')}
            rows={1}
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
            aria-label={t('send')}
          >
            <Send size={16} strokeWidth={1.75} className="rtl:-scale-x-100" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-accent/10 px-4 py-2 text-sm text-text">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-2 text-sm text-text">
        {children}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="size-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-pulse rounded-full bg-text-muted [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-pulse rounded-full bg-text-muted" />
    </span>
  );
}

function EmptyState({
  heading,
  body,
  suggestions,
  onPick,
  disabled,
}: {
  heading: string;
  body: string;
  suggestions: string[];
  onPick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
        <Sparkles size={20} strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-base font-medium text-text">{heading}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            disabled={disabled}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-text-secondary hover:text-text hover:border-text-muted transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
