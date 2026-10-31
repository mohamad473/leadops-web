import { IronWomenChat } from '@/components/IronWomenChat';
import { Badge, Empty, SystemBanner } from '@/components/ui';
import { read } from '@/lib/api';
import { fmtDate, n, titleCase, tone } from '@/lib/format';
import type { SystemState } from '@/lib/types';

export const metadata = { title: 'IronWomen & Automations · LeadOps' };

const SCHEDULES: [string, string][] = [
  ['Autopilot lead search (each campaign)', 'Mon 07:00'],
  ['Weekly summary to owners', 'Mon 18:00'],
  ['Weekly report to owners', 'Fri 16:00'],
  ['Emails sent digest', 'every 30 min'],
  ['Pipeline stage messages', 'every 5 min'],
  ['Booking-link offers', 'every 10 min']
];

const STAGES: [string, string, string][] = [
  ['02', 'Find leads', 'Apollo search, normalize and remove duplicates'],
  ['03', 'Qualify', 'ICP scoring with hard rules'],
  ['04', 'Research', 'Bounded research agent, every fact checked against sources'],
  ['05', 'Write & review', 'Evidence-based drafts, automatic AI review'],
  ['07', 'Send', 'Eligibility checks, caps and Gmail sending'],
  ['08', 'Replies & follow-ups', 'Match replies, stop rules, bounces and opt-outs'],
  ['J4', 'Bookings', 'Cal.com bookings and booking links'],
  ['09', 'Health', 'Health monitor, stuck jobs, dead letters, audits']
];

export default async function BotsPage({ searchParams }: { searchParams: Promise<{ cmd?: string }> }) {
  const sp = await searchParams;
  // Only this one safe command can be started from a link.
  const initial = sp.cmd === 'newcampaign' ? '/newcampaign' : undefined;

  let system: SystemState | null = null;
  let systemError = '';
  try {
    system = await read<SystemState>('system');
  } catch (err) {
    systemError = (err as Error).message;
  }
  const alerts = system?.recent_open_alerts || [];

  return (
    <>
      <header className="page-head">
        <div>
          <div className="eyebrow">The website talks to the same bot router as Telegram, with your owner permissions</div>
          <h1>IronWomen &amp; Automations</h1>
        </div>
      </header>

      <SystemBanner system={system || undefined} />

      <div className="row">
        <section className="card grow-3" aria-label="IronWomen">
          <div className="card-head">
            <div className="row" style={{ gap: 12, alignItems: 'center' }}>
              <span className="brand-mark" style={{ color: '#fff', width: 40, height: 40, borderRadius: 10 }}>IW</span>
              <div>
                <h2>IronWomen</h2>
                <div className="small muted">Ask questions, run campaigns, get reports, pause sending</div>
              </div>
            </div>
            <span className="badge green">Online</span>
          </div>
          <IronWomenChat initial={initial} />
          <p className="small muted" style={{ margin: 0 }}>
            /newcampaign walks you through a new campaign step by step. /run starts a lead search now. /pause asks for confirmation before
            stopping all sending. Resuming is done with /resume_all in the Outreach bot.
          </p>
        </section>

        <div className="grow-2" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section className="card">
            <h2>Connected bots</h2>
            <div>
              <div className="list-row"><span><strong>IronWomen</strong> <span className="muted">· Telegram (Ask)</span></span><Badge value="ACTIVE" label="Online" /></div>
              <div className="list-row"><span><strong>Discovery bot</strong> <span className="muted">· Telegram</span></span><Badge value="ACTIVE" label="Online" /></div>
              <div className="list-row"><span><strong>This website</strong> <span className="muted">· LeadOps W1 API</span></span><Badge value="ACTIVE" label="Connected" /></div>
            </div>
          </section>

          <section className="card">
            <h2>Schedules <span className="small muted">(Beirut time)</span></h2>
            <div>
              {SCHEDULES.map(([k, v]) => (
                <div className="list-row" key={k}><span>{k}</span><span className="mono small muted">{v}</span></div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>System status &amp; alerts</h2>
          {system ? (
            <span className="small muted">
              Phase {titleCase(system.activation_phase)} · {n(system.sent_today_live)} sent today
            </span>
          ) : null}
        </div>
        {systemError ? <div className="notice error">Could not load system status: {systemError}</div> : null}
        {system && alerts.length === 0 ? <Empty>No open alerts.</Empty> : null}
        {alerts.map((a, i) => (
          <div className="list-row" key={i} style={{ flexDirection: 'column', gap: 2 }}>
            <div className="card-head">
              <strong>{a.title}</strong>
              <span className="row" style={{ gap: 8, alignItems: 'center' }}>
                {a.count ? <span className="small muted">×{a.count}</span> : null}
                <span className={`badge ${tone(a.severity)}`}>{titleCase(a.severity)}</span>
              </span>
            </div>
            {a.message ? <span className="small muted">{a.message}</span> : null}
            {a.last_seen ? <span className="small muted">Last seen {fmtDate(a.last_seen)}</span> : null}
          </div>
        ))}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Automation pipeline</h2>
          <span className="small muted">Each stage is a group of n8n workflows</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {STAGES.map(([code, name, desc]) => (
            <div key={code} className="stat" style={{ gap: 6, padding: 14, border: '1px solid var(--line)' }}>
              <span className="small mono muted" style={{ fontWeight: 700 }}>{code}</span>
              <strong>{name}</strong>
              <span className="small muted">{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
