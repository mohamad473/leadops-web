import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE, sessionKey } from '@/lib/secret';

// First gate: every page and API route needs a valid session cookie,
// except the login page and the sign-in endpoints. Pages and API routes
// check again on the server (the owner must still be in OWNERS).
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ['HS256'] });
      if (payload.purpose === 'session') return NextResponse.next();
    } catch {
      // fall through to the login redirect
    }
  }
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|icon.svg).*)']
};
