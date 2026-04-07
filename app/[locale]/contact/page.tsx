import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Mail, Lock, MapPin, Clock } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ContactForm } from '@/components/contact-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage' });
  return {
    title: `${t('title')} — Hesabaty Business`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contactPage' });

  const items = [
    {
      icon: Mail,
      label: t('emailLabel'),
      value: t('emailValue'),
      description: t('emailDescription'),
      href: `mailto:${t('emailValue')}`,
    },
    {
      icon: Lock,
      label: t('privacyLabel'),
      value: t('privacyValue'),
      description: t('privacyDescription'),
      href: `mailto:${t('privacyValue')}`,
    },
    {
      icon: MapPin,
      label: t('locationLabel'),
      value: t('locationValue'),
      description: t('locationDescription'),
    },
    {
      icon: Clock,
      label: t('responseLabel'),
      value: t('responseValue'),
      description: t('responseDescription'),
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <Nav />

      <section className="flex flex-col items-center gap-5 px-6 pt-20 pb-10 md:px-20">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
          {t('eyebrow')}
        </span>
        <h1 className="text-center text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] text-text md:text-7xl">
          {t('title')}
        </h1>
        <p className="max-w-xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
          {t('body')}
        </p>
      </section>

      <section className="flex flex-col items-center px-6 pb-24 md:px-20">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
          {/* Direct contact card */}
          <div
            className="flex flex-col gap-6 rounded-3xl border border-accent/20 p-10"
            style={{
              background:
                'linear-gradient(160deg, rgba(56,189,248,0.08), rgba(2,116,223,0.02))',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {t('directLabel')}
            </span>
            <div className="mt-2 flex flex-col gap-6">
              {items.map((item) => {
                const Icon = item.icon;
                const Wrapper = item.href ? 'a' : 'div';
                return (
                  <Wrapper
                    key={item.label}
                    {...(item.href ? { href: item.href } : {})}
                    className="flex items-start gap-3.5 group"
                  >
                    <div className="flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/[0.15] group-hover:bg-accent/[0.25] transition-colors">
                      <Icon className="size-[18px] text-accent" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        {item.label}
                      </span>
                      <span className="text-base font-bold text-text">
                        {item.value}
                      </span>
                      <span className="text-xs leading-relaxed text-text-muted">
                        {item.description}
                      </span>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
