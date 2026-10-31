import Link from 'next/link';
import { BotAction } from '@/components/BotAction';
import { IronWomenChat } from '@/components/IronWomenChat';
import { Badge, Empty, Funnel, Kpi, LoadError, SendsChart, SystemBanner } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDate, fmtNum, n, replyTime, timeAgo, titleCase, tone } from '@/lib/format';
import { requireSession } from '@/lib/session';
import type { Dashboard } from '@/lib/types';

export const metadata = { title: 'Overview · LeadOps' };

export default async function OverviewPage() {
  const session = await requireSession();
  let data: Dashboard;
  try {
    data = await api.dashboard(7);
  } catch (err) {
    return (
      <>
        <h1>Overview</h1>
        <LoadError error={err} />
      </>
    );
  }
  const { overview: o, system, campaigns, sends, replies, discovery } = data;
  const capTotal = (campaigns?.campaigns || []).reduce((s, c) => s + n(c.daily_send_cap), 0);
  const alerts = system?.recent_open_alerts || [];
  const name = session.email.split('@')[0];

  return (
    <>
      <header className="page-head">
        <div>
          <div className="eyebrow">{fmtDate(new Date().toISOString(), false)} · last 7 days</div>
          <h1>Hello, {name}</h1>
        </div>
        <div className="btns">
          <BotAction label="Pause all sending" command="/pause" variant="danger" />
          <Link href="/bots?cmd=newcampaign" className="btn btn-primary">+ New campaign</Link>
        </div>
      </header>

      <SystemBanner system={system} />

      <section className="card" aria-label="Ask IronWomen">
        <div className="card-head">
          <h2>Ask IronWomen</h2>
          <span className="small muted">Questions in plain words, answered from your LeadOps data</span>
        </div>
        <IronWomenChat showCommands={false} compact placeholder="e.g. Did anyone reply this week?" />
      </section>

      <section className="kpis" aria-label="Key numbers">
        <Kpi label="Leads found" value={fmtNum(o.leads_discovered)} sub={`${fmtNum(o.leads_qualified)} qualified`} />
        <Kpi label="Drafts approved" value={fmtNum(o.drafts_approved)} sub={`${fmtNum(o.drafts_waiting_review)} waiting for review`} />
        <Kpi
          label="Sent today"
          value={capTotal ? `${fmtNum(system?.sent_today_live)} / ${capTotal}` : fmtNum(system?.sent_today_live)}
          sub={capTotal ? 'Daily cap across running campaigns' : 'Live emails'}
        />
        <Kpi label="Emails sent (7 d)" value={fmtNum(o.emails_sent_live)} sub={`+ ${fmtNum(o.followups_sent_live)} follow-ups${n(o.emails_dry_run) ? `, ${o.emails_dry_run} dry run` : ''}`} />
        <Kpi label="Replies" value={fmtNum(o.replies)} sub={o.reply_rate_pct != null ? `${o.reply_rate_pct}% reply rate` : undefined} />
        <Kpi label="Meetings" value={fmtNum(o.meetings_booked)} sub={`${fmtNum(o.meetings_upcoming)} upcoming`} />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Pipeline · last 7 days</h2>
          <span className="small muted">Found → booked, all campaigns</span>
        </div>
        <Funnel overview={o} />
      </section>

      <div className="row">
        <section className="card grow-3">
          <div className="card-head">
            <h2>Emails sent · last 14 days</h2>
            {capTotal ? <span className="small muted">Daily cap {capTotal}</span> : null}
          </div>
          <SendsChart days={sends?.days || []} cap={capTotal} />
        </section>

        <section className="card grow-2">
          <div className="card-head">
            <h2>Latest replies</h2>
            <Link href="/leads">All replies →</Link>
          </div>
          {(replies?.replies || []).length === 0 ? (
            <Empty>No replies in the last 7 days.</Empty>
          ) : (
            replies.replies.slice(0, 6).map((r, i) => (
              <div className="list-row" key={`${r.lead_id}-${i}`} style={{ flexDirection: 'column', gap: 4 }}>
                <div className="card-head">
                  <strong>{r.contact || r.email || 'Unknown'}{r.company ? ` · ${r.company}` : ''}</strong>
                  <Badge value={r.intent} />
                </div>
                {r.summary || r.excerpt ? <div className="muted">{String(r.summary || r.excerpt)}</div> : null}
                <div className="small muted">{timeAgo(replyTime(r))}</div>
              </div>
            ))
          )}
        </section>
      </div>

      <div className="row">
        <section className="card grow-3">
          <div className="card-head">
            <h2>Campaigns</h2>
            <Link href="/campaigns">Manage →</Link>
          </div>
          {(campaigns?.campaigns || []).length === 0 ? (
            <Empty>No active campaigns.</Empty>
          ) : (
            <div className="table-wrap">
              <table style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th className="num">Sent</th>
                    <th className="num">Dry run</th>
                    <th className="num">Replies</th>
                    <th className="num">Cap/day</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.campaigns.map((c) => (
                    <tr key={c.campaign_id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/campaigns?id=${c.campaign_id}`} style={{ color: 'inherit' }}>{c.name}</Link>
                      </td>
                      <td><Badge value={c.status} /></td>
                      <td className="num">{fmtNum(c.emails_sent_live)}</td>
                      <td className="num">{fmtNum(c.emails_dry_run)}</td>
                      <td className="num">{fmtNum(c.replies)}</td>
                      <td className="num">{c.daily_send_cap ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card grow-2">
          <div className="card-head">
            <h2>System health</h2>
            <Link href="/bots">Details →</Link>
          </div>
          <div>
            <div className="list-row">
              <span className="row" style={{ gap: 8, alignItems: 'center' }}>
                <i className={`dot ${system?.safety_pause || n(system?.active_pauses) ? 'red' : system?.dry_run ? 'amber' : 'green'}`} />
                Sending
              </span>
              <span className="muted">
                {system?.safety_pause || n(system?.active_pauses) ? 'Paused' : system?.dry_run || system?.live_sending_enabled === false ? 'Dry run' : 'Live'}
              </span>
            </div>
            <div className="list-row">
              <span className="row" style={{ gap: 8, alignItems: 'center' }}>
                <i className={`dot ${discovery?.runs_failed ? 'red' : 'green'}`} /> Lead searches (7 d)
              </span>
              <span className="muted">
                {fmtNum(discovery?.runs)} runs{discovery?.runs_failed ? `, ${discovery.runs_failed} failed` : ''}
              </span>
            </div>
            <div className="list-row">
              <span className="row" style={{ gap: 8, alignItems: 'center' }}>
                <i className={`dot ${alerts.length ? 'amber' : 'green'}`} /> Open alerts
              </span>
              <span className="muted">{alerts.length}</span>
            </div>
            {alerts.slice(0, 4).map((a, i) => (
              <div className="list-row" key={i} style={{ flexDirection: 'column', gap: 2 }}>
                <div className="card-head">
                  <span style={{ fontWeight: 600 }}>{a.title}</span>
                  <span className={`badge ${tone(a.severity)}`}>{titleCase(a.severity)}</span>
                </div>
                {a.message ? <span className="small muted">{a.message}</span> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
