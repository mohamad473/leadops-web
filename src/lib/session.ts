import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { findOwner, type Owner } from './config';
import { SESSION_COOKIE, SESSION_DAYS, sessionKey } from './secret';

export type Session = { email: string; telegramUserId: string };

export async function createSessionToken(owner: Owner): Promise<string> {
  return new SignJWT({ purpose: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(owner.email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(sessionKey());
}

/** Reads the session cookie. The owner must still be listed in OWNERS. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ['HS256'] });
    if (payload.purpose !== 'session' || typeof payload.sub !== 'string') return null;
    const owner = findOwner(payload.sub);
    if (!owner) return null;
    return { email: owner.email, telegramUserId: owner.telegramUserId };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

/** Magic-link tokens: signed, 15 minutes, one use (best effort, per server process). */
const usedLinks = new Map<string, number>();

export async function createLoginToken(email: string): Promise<string> {
  return new SignJWT({ purpose: 'login' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(sessionKey());
}

export async function consumeLoginToken(token: string): Promise<Owner | null> {
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ['HS256'] });
    if (payload.purpose !== 'login' || typeof payload.sub !== 'string' || !payload.jti) return null;
    const now = Date.now();
    for (const [jti, exp] of usedLinks) if (exp < now) usedLinks.delete(jti);
    if (usedLinks.has(payload.jti)) return null;
    usedLinks.set(payload.jti, (payload.exp || 0) * 1000);
    return findOwner(payload.sub) || null;
  } catch {
    return null;
  }
}
