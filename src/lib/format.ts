export const n = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

export function fmtNum(v: unknown): string {
  return n(v).toLocaleString('en-US');
}

export function titleCase(s: string | undefined | null): string {
  return String(s || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function fmtDate(iso: string | undefined | null, withTime = true): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    timeZone: 'Asia/Beirut',
    day: 'numeric',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export function timeAgo(iso: string | undefined | null): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const future = diff < 0;
  const mins = Math.round(Math.abs(diff) / 60000);
  const label =
    mins < 1 ? 'just now' : mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins / 60)} h` : `${Math.round(mins / 1440)} d`;
  if (label === 'just now') return label;
  return future ? `in ${label}` : `${label} ago`;
}

/** Badge tone for statuses and intents. */
export function tone(value: string | undefined | null): 'green' | 'amber' | 'blue' | 'red' | 'violet' | 'gray' {
  const v = String(value || '').toUpperCase();
  if (['RUNNING', 'ACTIVE', 'INTERESTED', 'SENT', 'QUALIFIED', 'APPROVED', 'LIVE', 'BOOKED', 'SUFFICIENT'].includes(v)) return 'green';
  if (['PAUSED', 'NOT_NOW', 'REVIEW_REQUIRED', 'NEEDS_REVIEW', 'QUESTION', 'MEDIUM', 'DRY_RUN', 'SEND_QUEUED'].includes(v)) return 'amber';
  if (['DRAFT', 'RESEARCHED', 'REFERRAL', 'OUT_OF_OFFICE', 'AUTO_REPLY'].includes(v)) return 'blue';
  if (['FAILED', 'STOPPED', 'NOT_INTERESTED', 'UNSUBSCRIBE_REQUEST', 'DISQUALIFIED', 'HIGH', 'CRITICAL', 'BOUNCED', 'RESEARCH_INSUFFICIENT'].includes(v)) return 'red';
  if (['REPLIED', 'WRONG_PERSON'].includes(v)) return 'violet';
  return 'gray';
}

export function replyTime(r: Record<string, unknown>): string | undefined {
  const v = r.received_at ?? r.replied_at ?? r.at ?? r.created_at;
  return typeof v === 'string' ? v : undefined;
}
