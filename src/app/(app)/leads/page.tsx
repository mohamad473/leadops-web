import Link from 'next/link';
import { Badge, Empty, LoadError } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDate, replyTime, timeAgo, titleCase } from '@/lib/format';
import type { LeadsBoard, LeadStory } from '@/lib/types';

export const metadata = { title: 'Leads & Replies · LeadOps' };

type Tab = 'replies' | 'followups' | 'top' | 'stopped';
const TABS: { key: Tab; label: string }[] = [
  { key: 'replies', label: 'Replies (30 d)' },
  { key: 'followups', label: 'Follow-ups due' },
  { key: 'top', label: 'Top qualified' },
  { key: 'stopped', label: 'Stopped sequences' }
];

function href(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return `/leads${s ? `?${s}` : ''}`;
}

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; q?: string; lead?: string }>;
}) {
  const sp = await searchParams;
  const tab: Tab = (TABS.find((t) => t.key === sp.tab)?.key || 'replies') as Tab;
  const q = String(sp.q || '').trim().slice(0, 200);
  const leadKey = String(sp.lead || '').trim().slice(0, 64);

  let board: LeadsBoard;
  try {
    board = await api.leadsBoard(30);
  } catch (err) {
    return (
      <>
        <h1>Leads &amp; Replies</h1>
        <LoadError error={err} />
      </>
    );
  }

  let matches: LeadStory[] = [];
  let searchError = '';
  const lookup = leadKey || (q.length >= 2 ? q : '');
  if (lookup) {
    try {
      matches = (await api.findLead(lookup, leadKey ? 1 : 10)).matches || [];
    } catch (err) {
      searchError = (err as Error).message;
    }
  }
  const replies = board.replies?.replies || [];
  const due = board.followups?.due || [];
  const stopped = board.followups?.stopped_last_14_days || [];
  const top = board.discovery?.top_qualified || [];
  const counts: Record<Tab, number> = { replies: replies.length, followups: due.length, top: top.length, stopped: stopped.length };
  const leadLink = (key?: string) => href({ tab, q, lead: key });

  return (
    <>
      <header className="page-head">
        <div>
          <div className="eyebrow">Find any lead and see its whole story: qualification, research, emails, replies and follow-ups</div>
          <h1>Leads &amp; Replies</h1>
        </div>
        <form method="get" action="/leads" className="btns" role="search">
          <input type="hidden" name="tab" value={tab} />
          <label htmlFor="q" style={{ position: 'absolute', left: -9999 }}>Search leads</label>
          <input id="q" name="q" className="input" defaultValue={q} placeholder="Company, contact, email, domain or id" style={{ width: 300, maxWidth: '100%' }} />
          <button className="btn btn-dark" type="submit">Search</button>
        </form>
      </header>

      <nav className="tabs" aria-label="Lead lists">
        {TABS.map((t) => (
          <Link key={t.key} href={href({ tab: t.key, q })} className="tab" aria-current={t.key === tab ? 'page' : undefined}>
            {t.label} <span className="mono" style={{ opacity: 0.75 }}>{counts[t.key]}</span>
          </Link>
        ))}
      </nav>

      <div className="row">
        <section className="card grow-3" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            {tab === 'replies' ? (
              replies.length === 0 ? (
                <div style={{ padding: 20 }}><Empty>No replies in the last 30 days.</Empty></div>
              ) : (
                <table style={{ minWidth: 620 }}>
                  <thead><tr><th style={{ paddingLeft: 16 }}>Lead</th><th>Intent</th><th>What they said</th><th>When</th></tr></thead>
                  <tbody>
                    {replies.map((r, i) => (
                      <tr key={`${r.lead_id}-${i}`}>
                        <td style={{ paddingLeft: 16 }}>
                          <Link href={leadLink(r.short_id || r.lead_id)} style={{ fontWeight: 600, color: 'inherit' }}>{r.contact || r.email || 'Unknown'}</Link>
                          <div className="small muted">{r.company}{r.campaign ? ` · ${r.campaign}` : ''}</div>
                        </td>
                        <td><Badge value={r.intent} /></td>
                        <td style={{ maxWidth: 360 }}>{String(r.summary || r.excerpt || '')}</td>
                        <td className="small muted" style={{ whiteSpace: 'nowrap' }}>{timeAgo(replyTime(r))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : null}

            {tab === 'followups' ? (
              due.length === 0 ? (
                <div style={{ padding: 20 }}><Empty>No follow-ups due in the next 14 days.</Empty></div>
              ) : (
                <table style={{ minWidth: 620 }}>
                  <thead><tr><th style={{ paddingLeft: 16 }}>Lead</th><th>Campaign</th><th>Step</th><th>Mode</th><th>Due</th></tr></thead>
                  <tbody>
                    {due.map((f, i) => (
                      <tr key={`${f.lead_id}-${i}`}>
                        <td style={{ paddingLeft: 16 }}>
                          <Link href={leadLink(f.short_id || f.lead_id)} style={{ fontWeight: 600, color: 'inherit' }}>{f.contact || 'Unknown'}</Link>
                          <div className="small muted">{f.company}{f.title ? ` · ${f.title}` : ''}</div>
                        </td>
                        <td>{f.campaign}</td>
                        <td className="mono">{f.step ?? '—'}</td>
                        <td><Badge value={f.mode} /></td>
                        <td className="small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(f.due_at)}<div className="muted">{timeAgo(f.due_at)}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : null}

            {tab === 'top' ? (
              top.length === 0 ? (
                <div style={{ padding: 20 }}><Empty>No qualified leads found in the last 30 days.</Empty></div>
              ) : (
                <table style={{ minWidth: 620 }}>
                  <thead><tr><th style={{ paddingLeft: 16 }}>Lead</th><th>Title</th><th>Campaign</th><th className="num" style={{ paddingRight: 16 }}>ICP score</th></tr></thead>
                  <tbody>
                    {top.map((t) => (
                      <tr key={t.lead_id}>
                        <td style={{ paddingLeft: 16 }}>
                          <Link href={leadLink(t.short_id || t.lead_id)} style={{ fontWeight: 600, color: 'inherit' }}>{t.contact || 'Unknown'}</Link>
                          <div className="small muted">{t.company}{t.domain ? ` · ${t.domain}` : ''}</div>
                        </td>
                        <td>{t.title}</td>
                        <td>{t.campaign}</td>
                        <td className="num" style={{ paddingRight: 16 }}>{t.score ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : null}

            {tab === 'stopped' ? (
              stopped.length === 0 ? (
                <div style={{ padding: 20 }}><Empty>No sequences stopped in the last 14 days.</Empty></div>
              ) : (
                <table style={{ minWidth: 560 }}>
                  <thead><tr><th style={{ paddingLeft: 16 }}>Lead</th><th>Campaign</th><th>Reason</th></tr></thead>
                  <tbody>
                    {stopped.map((f, i) => (
                      <tr key={`${f.lead_id}-${i}`}>
                        <td style={{ paddingLeft: 16 }}>
                          <Link href={leadLink(f.short_id || f.lead_id)} style={{ fontWeight: 600, color: 'inherit' }}>{f.contact || 'Unknown'}</Link>
                          <div className="small muted">{f.company}</div>
                        </td>
                        <td>{f.campaign}</td>
                        <td><Badge value={f.reason || undefined} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : null}
          </div>
        </section>

        <aside className="card grow-2" aria-label="Lead details" style={{ maxWidth: 520 }}>
          {searchError ? <div className="notice error">{searchError}</div> : null}
          {!lookup ? (
            <Empty>Pick a lead from the list, or search by company, contact, email, domain or short id.</Empty>
          ) : matches.length === 0 && !searchError ? (
            <Empty>No lead matches “{lookup}”.</Empty>
          ) : (
            matches.map((m) => <LeadCard key={m.lead_id} lead={m} linkTo={!leadKey && matches.length > 1 ? leadLink(m.short_id || m.lead_id) : undefined} />)
          )}
        </aside>
      </div>
    </>
  );
}

function LeadCard({ lead, linkTo }: { lead: LeadStory; linkTo?: string }) {
  const name = lead.contact || 'Unknown contact';
  if (linkTo) {
    return (
      <Link href={linkTo} className="list-row" style={{ color: 'inherit' }}>
        <span><strong>{name}</strong><span className="muted"> · {lead.company}</span></span>
        <Badge value={lead.status} />
      </Link>
    );
  }
  const reply = lead.last_reply;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20 }}>{name}</h2>
        <div className="muted">{[lead.title, lead.company, lead.domain].filter(Boolean).join(' · ')}</div>
        <div className="btns" style={{ marginTop: 10, gap: 8 }}>
          <Badge value={lead.status} />
          {lead.qualification ? <Badge value={lead.qualification} /> : null}
          {lead.score != null ? <span className="badge gray">ICP {lead.score}</span> : null}
          {lead.campaign ? <span className="badge gray">{lead.campaign}</span> : null}
        </div>
      </div>

      {reply ? (
        <div className="stat" style={{ gap: 6 }}>
          <span className="k">Last reply · {titleCase(String(reply.intent || ''))} · {timeAgo(replyTime(reply))}</span>
          <span className="pre">{String(reply.summary || reply.excerpt || '')}</span>
        </div>
      ) : null}

      {lead.research_summary ? (
        <div>
          <h3>Research</h3>
          <p style={{ margin: '6px 0 0' }}>{lead.research_summary}</p>
        </div>
      ) : null}

      {lead.email_angle ? (
        <div>
          <h3>Email angle</h3>
          <p className="pre muted" style={{ margin: '6px 0 0' }}>{lead.email_angle}</p>
        </div>
      ) : null}

      {lead.current_draft?.subject ? (
        <div>
          <h3>Current draft</h3>
          <p style={{ margin: '6px 0 0', fontWeight: 600 }}>{lead.current_draft.subject}</p>
          {lead.current_draft.body ? <p className="pre muted small" style={{ margin: '4px 0 0' }}>{lead.current_draft.body}</p> : null}
        </div>
      ) : null}

      {lead.emails?.length ? (
        <div>
          <h3>Emails</h3>
          {lead.emails.map((e, i) => (
            <div className="list-row" key={i}>
              <span>{e.subject || '(no subject)'}</span>
              <span className="small muted" style={{ whiteSpace: 'nowrap' }}>{titleCase(e.mode || e.status)} · {fmtDate(e.sent_at)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <h3>Follow-ups</h3>
        <p className="muted" style={{ margin: '6px 0 0' }}>
          {lead.follow_ups?.stop_reason
            ? `Stopped: ${titleCase(lead.follow_ups.stop_reason)}`
            : lead.follow_ups?.next_due
              ? `Next follow-up ${fmtDate(lead.follow_ups.next_due)} (${timeAgo(lead.follow_ups.next_due)})`
              : 'None planned.'}
        </p>
      </div>

      {lead.reasons?.length ? (
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Why this score</summary>
          <ul className="small muted" style={{ paddingLeft: 18 }}>
            {lead.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </details>
      ) : null}
      <div className="small muted">Updated {fmtDate(lead.updated_at)} · id <span className="mono">{lead.short_id}</span></div>
    </div>
  );
}
