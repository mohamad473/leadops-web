import { fmtDate, fmtNum, n, titleCase, tone } from '@/lib/format';
import type { Overview, SendsDay, SystemState } from '@/lib/types';

export function Badge({ value, label }: { value?: string | null; label?: string }) {
  if (!value && !label) return null;
  return <span className={`badge ${tone(value)}`}>{label ?? titleCase(value)}</span>;
}

export function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}

export function LoadError({ error }: { error: unknown }) {
  return (
    <div className="notice error">
      Could not load data from n8n: {(error as Error)?.message || 'unknown error'}. Check N8N_API_URL and N8N_API_KEY in
      .env.local, and that the &quot;LeadOps W1 — Web App API&quot; workflow is published.
    </div>
  );
}

export function SystemBanner({ system }: { system?: SystemState }) {
  if (!system) return null;
  if (system.safety_pause || n(system.active_pauses) > 0) {
    return <div className="notice warn">Sending is paused. Queued emails are held until an owner resumes sending.</div>;
  }
  if (system.dry_run || system.live_sending_enabled === false) {
    return <div className="notice info">Dry run: drafts are processed but no real emails go out.</div>;
  }
  return null;
}

export function Funnel({ overview }: { overview: Overview }) {
  const stages: [string, number][] = [
    ['Leads found', n(overview.leads_discovered)],
    ['Qualified', n(overview.leads_qualified)],
    ['Researched', n(overview.leads_researched)],
    ['Drafted', n(overview.drafts_created)],
    ['Approved', n(overview.drafts_approved)],
    ['Sent (live)', n(overview.emails_sent_live)],
    ['Replied', n(overview.replies)],
    ['Meeting booked', n(overview.meetings_booked)]
  ];
  const max = Math.max(1, ...stages.map((s) => s[1]));
  return (
    <div className="funnel">
      {stages.map(([name, value]) => (
        <div className="funnel-row" key={name}>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div className="bar-track" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <div className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>
            {fmtNum(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SendsChart({ days, cap }: { days: SendsDay[]; cap?: number }) {
  const max = Math.max(1, cap || 0, ...days.map((d) => n(d.live_sent) + n(d.dry_run)));
  return (
    <>
      <div className="chart" role="img" aria-label="Emails sent per day">
        {days.map((d) => {
          const live = n(d.live_sent);
          const dry = n(d.dry_run);
          return (
            <div className="chart-col" key={d.day} title={`${fmtDate(d.day, false)}: ${live} sent, ${dry} dry run, ${n(d.replies)} replies`}>
              <div className="chart-val">{live + dry || ''}</div>
              {dry ? <div className="chart-bar dry" style={{ height: `${(dry / max) * 150}px` }} /> : null}
              <div className={`chart-bar${live ? '' : ' zero'}`} style={{ height: `${Math.max(3, (live / max) * 150)}px`, borderRadius: dry ? 0 : undefined }} />
            </div>
          );
        })}
      </div>
      <div className="card-head small muted">
        <span>{fmtDate(days[0]?.day, false)}</span>
        <div className="legend">
          <span><i className="swatch" style={{ background: 'var(--accent)' }} /> Sent</span>
          <span><i className="swatch" style={{ background: '#c7d2fe' }} /> Dry run</span>
        </div>
        <span>Today</span>
      </div>
    </>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="muted" style={{ padding: '8px 0' }}>{children}</div>;
}
