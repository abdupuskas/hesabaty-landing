import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { consumeInviteForCurrentUser } from '@/lib/auth/actions';
import { routing } from '@/i18n/routing';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const next = searchParams.get('next') ?? `/${routing.defaultLocale}/app`;

  if (errorParam) {
    return NextResponse.redirect(`${origin}/${routing.defaultLocale}/login?error=generic`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/${routing.defaultLocale}/login?error=generic`);
    }

    await consumeInviteForCurrentUser();
  }

  return NextResponse.redirect(`${origin}${next}`);
}
