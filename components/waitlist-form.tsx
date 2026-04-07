'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function WaitlistForm() {
  const t = useTranslations('waitlistPage');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [business, setBusiness] = useState('');
  const [revenue, setRevenue] = useState<string>('option2');
  const [channels, setChannels] = useState<Set<string>>(new Set(['instagram']));
  const [notes, setNotes] = useState('');

  const revenueOptions = [
    { id: 'option1', label: t('revenueOption1') },
    { id: 'option2', label: t('revenueOption2') },
    { id: 'option3', label: t('revenueOption3') },
    { id: 'option4', label: t('revenueOption4') },
  ];

  const channelOptions = [
    { id: 'instagram', label: t('channelInstagram') },
    { id: 'whatsapp', label: t('channelWhatsapp') },
    { id: 'shopify', label: t('channelShopify') },
    { id: 'popups', label: t('channelPopups') },
    { id: 'other', label: t('channelOther') },
  ];

  function toggleChannel(id: string) {
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[Waitlist] ${business || name}`);
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Business: ${business}`,
      `Monthly revenue: ${revenueOptions.find((o) => o.id === revenue)?.label}`,
      `Sales channels: ${[...channels]
        .map((id) => channelOptions.find((o) => o.id === id)?.label)
        .filter(Boolean)
        .join(', ')}`,
      ``,
      `Notes:`,
      notes || '(none)',
    ];
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:waitlist@hesabaty.com?subject=${subject}&body=${body}`;
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

      <div className="mt-2 flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="waitlist-name"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {t('formName')}
          </label>
          <input
            id="waitlist-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('formNamePlaceholder')}
            className="rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="waitlist-email"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {t('formEmail')}
          </label>
          <input
            id="waitlist-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('formEmailPlaceholder')}
            className="rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
          />
        </div>

        {/* Business */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="waitlist-business"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {t('formBusiness')}
          </label>
          <input
            id="waitlist-business"
            type="text"
            required
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder={t('formBusinessPlaceholder')}
            className="rounded-xl border border-white/[0.08] bg-background/60 px-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
          />
        </div>

        {/* Revenue */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t('formRevenue')}
          </span>
          <div className="flex flex-col gap-2">
            {revenueOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRevenue(opt.id)}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-start text-sm font-medium transition-colors ${
                  revenue === opt.id
                    ? 'border-accent/50 bg-accent/[0.12] text-text'
                    : 'border-white/[0.08] bg-background/60 text-text-secondary hover:text-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t('formChannels')}
          </span>
          <div className="flex flex-wrap gap-2">
            {channelOptions.map((opt) => {
              const active = channels.has(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleChannel(opt.id)}
                  className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-accent text-background font-semibold'
                      : 'border border-white/[0.08] bg-background/60 text-text-secondary hover:text-text'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="waitlist-notes"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {t('formNotes')}
          </label>
          <textarea
            id="waitlist-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('formNotesPlaceholder')}
            rows={3}
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
