import { NextResponse, type NextRequest } from 'next/server';
import { config } from '@/lib/config';
import { SESSION_COOKIE, SESSION_DAYS } from '@/lib/secret';
import { consumeLoginToken, createSessionToken } from '@/lib/session';

// The emailed link opens the login page with a "Continue" button (GET does nothing),
// so email scanners that pre-open links cannot use up the one-time link.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const url = new URL('/login', config.appUrl);
  if (token) url.searchParams.set('token', token);
  return NextResponse.redirect(url);
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const token = String(form?.get('token') || '');
  const owner = token ? await consumeLoginToken(token) : null;
  if (!owner) {
    return NextResponse.redirect(new URL('/login?error=link', config.appUrl), { status: 303 });
  }
  const res = NextResponse.redirect(new URL('/', config.appUrl), { status: 303 });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(owner), {
    httpOnly: true,
    secure: config.appUrl.startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600
  });
  return res;
}
