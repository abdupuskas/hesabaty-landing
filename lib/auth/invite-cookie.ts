import { cookies } from 'next/headers';

const COOKIE_NAME = 'hesabaty_pending_invite';
const MAX_AGE_SECONDS = 60 * 30;

export async function setPendingInviteCookie(code: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getPendingInviteCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function clearPendingInviteCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
