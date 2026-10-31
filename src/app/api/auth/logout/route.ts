import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { SESSION_COOKIE } from '@/lib/secret';

export async function POST() {
  const res = NextResponse.redirect(new URL('/login', config.appUrl), { status: 303 });
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
