import Link from 'next/link';
import { BotAction } from '@/components/BotAction';
import { Badge, Empty, LoadError } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDate, fmtNum, n, titleCase } from '@/lib/format';
import type { Campaign } from '@/lib/types';

export const metadata = { title: 'Campaigns · LeadOps' };

const STATUS_ORDER = [
  'QUALIFIED', 'REVIEW_REQUIRED', 'RESEARCHED', 'RESEARCH_INSUFFICIENT', 'DRAFTED', 'APPROVED',
  'SEND_QUEUED', 'SENT', 'REPLIED', 'BOOKED', 'DISQUALIFIED', 'SUPPRESSED'
];

function sortedStatuses(map: Record<string, number> | undefined): [string, number][] {
  const entries = Object.entries(map || {});
  return entries.sort((a, b) => {
    const ia = STATUS_ORDER.indexOf(a[0]);
    const ib = STATUS_ORDER.indexOf(b[0]);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  let list: Campaign[];
  try {
    list = (await api.campaigns(true)).campaigns || [];
  } catch (err) {
    return (
      <>
        <h1>Campaigns</h1>
        <LoadError error={err} />
      </>
    );
  }
  const selected = list.find((c) => c.campaign_id === id) || list[0];
  const running = list.filter((c) => c.status === 'RUNNING').length;

  return (
    <>
      <header className="page-head">
        <div>
          <div className="eyebrow">{list.length} campaigns · {running} running · autopilot searches every Monday 07:00</div>
          <h1>Campaigns</h1>
        </div>
        <div className="btns">
          <Link href="/bots?cmd=newcampaign" className="btn btn-primary">+ New campaign</Link>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="card">
          <Empty>No campaigns yet. Start one with “New campaign” — IronWomen asks for countries, industries and job titles step by step.</Empty>
        </div>
      ) : (
        <div className="row">
          <section aria-label="Campaign list" className="grow-1" style={{ maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map((c) => {
              const active = c.campaign_id === selected?.campaign_id;
              const leads = Object.values(c.leads_by_status || {}).reduce((s, v) => s + n(v), 0);
              return (
                <Link
                  key={c.campaign_id}
                  href={`/campaigns?id=${c.campaign_id}`}
                  className="card"
                  aria-current={active ? 'page' : undefined}
                  style={{ padding: 16, gap: 8, color: 'inherit', border: active ? '2px solid var(--accent)' : undefined }}
                >
                  <div className="card-head">
                    <strong style={{ fontSize: 15 }}>{c.name}</strong>
                    <Badge value={c.status} />
                  </div>
                  <div className="small muted">
                    {titleCase(c.lead_source)} · created {fmtDate(c.created_at, false)}
                  </div>
                  <div className="small mono" style={{ display: 'flex', gap: 14, color: 'var(--ink-2)' }}>
                    <span>{leads} leads</span>
                    <span>{fmtNum(c.emails_sent_live)} sent</span>
                    <span>{fmtNum(c.replies)} replies</span>
                  </div>
                </Link>
              );
            })}
          </section>

          {selected ? (
            <section style={{ flex: '999 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ gap: 18 }}>
                <div className="card-head" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                      <h2 style={{ fontSize: 22 }}>{selected.name}</h2>
                      <Badge value={selected.status} />
                    </div>
                    <div className="muted" style={{ marginTop: 4 }}>
                      Short id <span className="mono">{selected.short_id}</span> · {titleCase(selected.lead_source)}
                    </div>
                  </div>
                </div>
                <div className="btns">
                  <BotAction label="Run lead search now" command={`/run ${selected.short_id || ''}`.trim()} variant="dark" />
                  <BotAction label="Weekly report" command="/report" />
                  <BotAction label="Discovery summary" command="/summary" />
                  <BotAction label="Pause all sending" command="/pause" variant="danger" />
                </div>
                <div className="stat-grid">
                  <div className="stat"><span className="k">Sent (live)</span><span className="v">{fmtNum(selected.emails_sent_live)}</span></div>
                  <div className="stat"><span className="k">Dry run</span><span className="v">{fmtNum(selected.emails_dry_run)}</span></div>
                  <div className="stat"><span className="k">Replies</span><span className="v">{fmtNum(selected.replies)}</span></div>
                  <div className="stat"><span className="k">Lead limit</span><span className="v">{selected.lead_limit ?? '—'}</span></div>
                  <div className="stat"><span className="k">Daily cap</span><span className="v">{selected.daily_send_cap ?? '—'}</span></div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Leads by stage</h3>
                  <Link href="/leads">Open leads →</Link>
                </div>
                {sortedStatuses(selected.leads_by_status).length === 0 ? (
                  <Empty>No leads yet. Run a lead search to fill this campaign.</Empty>
                ) : (
                  <div className="stat-grid">
                    {sortedStatuses(selected.leads_by_status).map(([k, v]) => (
                      <div className="stat" key={k}>
                        <span className="k">{titleCase(k)}</span>
                        <span className="v">{fmtNum(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h3>How this campaign runs</h3>
                <div>
                  <div className="list-row"><span className="muted">Lead search</span><span>Autopilot, Mondays 07:00 (Beirut) · or “Run now”</span></div>
                  <div className="list-row"><span className="muted">Qualification &amp; research</span><span>Automatic (ICP scoring, verified sources)</span></div>
                  <div className="list-row"><span className="muted">Draft review</span><span>Automatic AI review against the evidence</span></div>
                  <div className="list-row"><span className="muted">Sending</span><span>Gmail, within the daily cap{selected.daily_send_cap ? ` (${selected.daily_send_cap}/day)` : ''}</span></div>
                  <div className="list-row"><span className="muted">Follow-ups</span><span>Planned in business days, stop on any reply</span></div>
                </div>
                <p className="small muted" style={{ margin: 0 }}>
                  To change targeting or limits, create a new campaign with IronWomen. Editing campaigns from the website can come in a later version.
                </p>
              </div>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
