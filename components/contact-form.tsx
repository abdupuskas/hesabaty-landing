'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Topic = 'invite' | 'bug' | 'feedback' | 'other';

export function ContactForm() {
  const t = useTranslations('contactPage');
  const [topic, setTopic] = useState<Topic>('invite');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const topics: { id: Topic; label: string }[] = [
    { id: 'invite', label: t('topicInvite') },
    { id: 'bug', label: t('topicBug') },
    { id: 'feedback', label: t('topicFeedback') },
    { id: 'other', label: t('topicOther') },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[${topic}] from ${name || 'Hesabaty visitor'}`);
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:support@hesabaty.com?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-white/[0.06] p-10"
      style={{
        background:
          'linear-gradient(160deg, rgba(26,29,35,0.6), rgba(15,17,21,0.2))',
      }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {t('formLabel')}
      </span>

      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-name"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {t('formName')}
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('formNamePlaceholder')}
            className="rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-email"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {t('formEmail')}
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('formEmailPlaceholder')}
            className="rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t('formTopic')}
          </span>
          <div className="flex flex-wrap gap-2">
            {topics.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTopic(opt.id)}
                className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                  topic === opt.id
                    ? 'bg-accent text-background font-semibold'
                    : 'border border-white/[0.08] bg-background/60 text-text-secondary hover:text-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-message"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {t('formMessage')}
          </label>
          <textarea
            id="contact-message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('formMessagePlaceholder')}
            rows={4}
            className="rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          className="mt-2 cursor-pointer rounded-xl bg-accent py-4 text-sm font-bold text-background hover:bg-accent/90 transition-colors"
        >
          {t('formSubmit')}
        </button>
      </div>
    </form>
  );
}
