import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, askBot } from '@/lib/api';
import { config } from '@/lib/config';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  // Only accept requests from this site's own pages.
  const origin = req.headers.get('origin');
  if (origin) {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {
      // "null" or malformed origin: treated as foreign
    }
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (originHost !== host && originHost !== new URL(config.appUrl).host) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!/^\d{3,15}$/.test(session.telegramUserId)) {
    return NextResponse.json(
      { ok: false, error: 'Your email has no Telegram id in OWNERS, so IronWomen cannot act for you.' },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text.slice(0, 2000) : '';
  const callback = typeof body?.callback_data === 'string' ? body.callback_data.slice(0, 80) : '';
  if (!text.trim() && !callback) return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 });

  try {
    const reply = await askBot(session.telegramUserId, callback ? { callback_data: callback } : { text });
    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 502;
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: status >= 400 ? status : 502 });
  }
}
