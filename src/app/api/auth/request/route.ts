import { NextResponse, type NextRequest } from 'next/server';
import { config, findOwner } from '@/lib/config';
import { sendLoginEmail } from '@/lib/mailer';
import { createLoginToken } from '@/lib/session';

// Simple in-memory limit: 5 requests per email (and per IP) every 15 minutes.
const hits = new Map<string, number[]>();
function limited(key: string): boolean {
  const now = Date.now();
  for (const [k, times] of hits) if (times.every((t) => now - t >= 15 * 60_000)) hits.delete(k);
  const recent = (hits.get(key) || []).filter((t) => now - t < 15 * 60_000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 5;
}

export async function POST(req: NextRequest) {
  const form = await req.json().catch(() => ({}));
  const email = String(form?.email || '').trim().toLowerCase().slice(0, 200);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  // Same answer whether or not the email is allowed, so the form does not reveal who the owners are.
  const done = NextResponse.json({ ok: true });

  if (!email.includes('@') || limited(`ip:${ip}`) || limited(`email:${email}`)) return done;
  const owner = findOwner(email);
  if (!owner) return done;

  const token = await createLoginToken(owner.email);
  const link = `${config.appUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;
  try {
    await sendLoginEmail(owner.email, link);
  } catch (err) {
    console.error('[LeadOps] Could not send the sign-in email:', (err as Error).message);
    return NextResponse.json({ ok: false, error: 'email_failed' }, { status: 500 });
  }
  return done;
}
