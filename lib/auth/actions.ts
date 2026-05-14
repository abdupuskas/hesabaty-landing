'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { routing } from '@/i18n/routing';
import {
  setPendingInviteCookie,
  getPendingInviteCookie,
  clearPendingInviteCookie,
} from './invite-cookie';

type Locale = (typeof routing.locales)[number];

function pickLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return (routing.locales as readonly string[]).includes(value)
    ? (value as Locale)
    : routing.defaultLocale;
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function signOutAction(formData: FormData) {
  const locale = pickLocale(formData);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { ok: false, error: 'invalidCredentials' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: 'invalidCredentials' };
  }

  redirect(`/${locale}/app`);
}

export async function validateInviteAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const rawCode = String(formData.get('code') ?? '').trim().toUpperCase();

  if (!rawCode) {
    return { ok: false, error: 'invalid' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke('validate-invite', {
    body: { code: rawCode, device_id: 'web' },
  });

  if (error) {
    return { ok: false, error: 'generic' };
  }

  const result = data as { valid?: boolean; reason?: string } | null;
  if (!result?.valid) {
    const reason = result?.reason ?? 'generic';
    return { ok: false, error: reason };
  }

  await setPendingInviteCookie(rawCode);
  redirect(`/${locale}/signup`);
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('name') ?? '').trim();

  if (password.length < 8) return { ok: false, error: 'weakPassword' };
  if (!email) return { ok: false, error: 'generic' };

  const inviteCode = await getPendingInviteCookie();
  if (!inviteCode) {
    redirect(`/${locale}/invite`);
  }

  const origin = await getOrigin();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, invite_code: inviteCode },
      emailRedirectTo: `${origin}/auth/callback?next=/${locale}/app`,
    },
  });

  if (error) {
    if (/registered/i.test(error.message)) {
      return { ok: false, error: 'emailExists' };
    }
    if (/password/i.test(error.message)) {
      return { ok: false, error: 'weakPassword' };
    }
    return { ok: false, error: 'generic' };
  }

  if (data.session) {
    await consumeInviteForCurrentUser();
    redirect(`/${locale}/app`);
  }

  redirect(`/${locale}/signup?status=check-email`);
}

export async function signInWithOAuthAction(formData: FormData) {
  const locale = pickLocale(formData);
  const provider = String(formData.get('provider') ?? '');
  if (provider !== 'google' && provider !== 'apple') {
    redirect(`/${locale}/login?error=generic`);
  }

  const origin = await getOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'apple',
    options: {
      redirectTo: `${origin}/auth/callback?next=/${locale}/app`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    redirect(`/${locale}/login?error=generic`);
  }

  redirect(data!.url);
}

export async function requestPasswordResetAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { ok: false, error: 'generic' };

  const origin = await getOrigin();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/${locale}/reset-password`,
  });

  return { ok: true };
}

export async function updatePasswordAction(formData: FormData): Promise<ActionResult> {
  const locale = pickLocale(formData);
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { ok: false, error: 'weak' };
  if (password !== confirm) return { ok: false, error: 'mismatch' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'expired' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: 'generic' };

  redirect(`/${locale}/login?status=password-updated`);
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { ok: false, error: 'weak' };
  if (password !== confirm) return { ok: false, error: 'mismatch' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: 'generic' };

  return { ok: true };
}

export async function deleteAccountAction(formData: FormData) {
  const locale = pickLocale(formData);
  const confirmation = String(formData.get('confirmation') ?? '').trim().toUpperCase();
  if (confirmation !== 'DELETE') {
    redirect(`/${locale}/app/settings?error=confirm`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { error } = await supabase.functions.invoke('delete-account', {
    body: { user_id: user!.id },
  });

  if (error) {
    redirect(`/${locale}/app/settings?error=delete`);
  }

  await supabase.auth.signOut();
  redirect(`/${locale}/login?status=deleted`);
}

export async function consumeInviteForCurrentUser() {
  const code = await getPendingInviteCookie();
  if (!code) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('invite_codes')
    .update({
      used: true,
      used_by: user.id,
      used_at: new Date().toISOString(),
    })
    .eq('code', code)
    .eq('used', false);

  if (!error) {
    await clearPendingInviteCookie();
  }
}
