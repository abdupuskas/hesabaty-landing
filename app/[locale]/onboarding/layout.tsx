import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/business';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const business = await getCurrentBusiness();
  if (business) redirect(`/${locale}/app`);

  return (
    <div className="min-h-screen bg-background px-4 py-12 md:py-16">
      <div className="mx-auto max-w-xl">{children}</div>
    </div>
  );
}
