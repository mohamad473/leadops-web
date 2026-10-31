// Sample data for DEMO_MODE=true. Invented companies and people, same shapes as the real API.
import type { BotReply, Campaign, Discovery, FollowUps, LeadStory, Reply, SendsDay, SystemState } from './types';

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const system: SystemState = {
  dry_run: false,
  live_sending_enabled: true,
  safety_pause: false,
  active_pauses: 0,
  activation_phase: 'PHASE_3',
  open_alerts: { MEDIUM: 1 },
  sent_today_live: 6,
  recent_open_alerts: [
    { title: 'Dead letters awaiting inspection', message: '1 item awaits inspection (/failures).', severity: 'MEDIUM', count: 3, last_seen: isoDaysAgo(0) }
  ]
};

const campaigns: Campaign[] = [
  {
    campaign_id: '11111111-1111-4111-8111-111111111111', short_id: '11111111', name: 'Sample — Agencies', status: 'RUNNING',
    created_at: isoDaysAgo(12), lead_source: 'APOLLO', lead_limit: 40, daily_send_cap: 10, emails_sent_live: 14, emails_dry_run: 2, replies: 3,
    leads_by_status: { SENT: 14, APPROVED: 4, QUALIFIED: 6, RESEARCHED: 5, SEND_QUEUED: 2, REVIEW_REQUIRED: 2, RESEARCH_INSUFFICIENT: 1, REPLIED: 3 }
  },
  {
    campaign_id: '22222222-2222-4222-8222-222222222222', short_id: '22222222', name: 'Sample — SaaS Founders', status: 'PAUSED',
    created_at: isoDaysAgo(30), lead_source: 'APOLLO', lead_limit: 25, daily_send_cap: 8, emails_sent_live: 9, emails_dry_run: 0, replies: 1,
    leads_by_status: { SENT: 9, QUALIFIED: 3, DISQUALIFIED: 4, REPLIED: 1 }
  }
];

const sendsDays: SendsDay[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const live = weekend ? 0 : [3, 5, 4, 6, 2, 7, 5, 4, 6, 3][i % 10];
  return { day: d.toISOString().slice(0, 10), live_sent: live, dry_run: i === 3 ? 1 : 0, replies: i % 5 === 0 ? 1 : 0, bounces: 0 };
});

const replies: Reply[] = [
  { received_at: isoDaysAgo(0), company: 'Northwind Studio', contact: 'Sara Example', intent: 'INTERESTED', summary: 'Wants a short call next week.', excerpt: 'This is timely, can we talk next week?', campaign: 'Sample — Agencies', lead_id: 'aaaaaaaa-0000-4000-8000-000000000001', short_id: 'aaaaaaaa' },
  { received_at: isoDaysAgo(2), company: 'Brightdesk', contact: 'Omar Example', intent: 'QUESTION', summary: 'Asked about pricing.', excerpt: 'What does this usually cost?', campaign: 'Sample — Agencies', lead_id: 'aaaaaaaa-0000-4000-8000-000000000002', short_id: 'aaaaaaab' },
  { received_at: isoDaysAgo(4), company: 'Pixel & Co', contact: 'Nour Example', intent: 'NOT_NOW', summary: 'Maybe next quarter.', excerpt: 'Not right now, maybe in Q1.', campaign: 'Sample — SaaS Founders', lead_id: 'aaaaaaaa-0000-4000-8000-000000000003', short_id: 'aaaaaaac' }
];

const discovery: Discovery = {
  period_days: 7, runs: 3, runs_failed: 0, fetched: 45, accepted: 30, new_leads: 30, qualified: 22, needs_review: 3, disqualified: 5,
  researched: 18, drafts_ready: 2, duplicates: 4, invalid: 1, suppressed: 0, sources: { APOLLO: 3 },
  leads_by_status: campaigns[0].leads_by_status,
  top_qualified: [
    { lead_id: 'bbbbbbbb-0000-4000-8000-000000000001', short_id: 'bbbbbbbb', company: 'Example Agency', contact: 'Alex Sample', title: 'Founder & CEO', domain: 'example.com', score: 94, campaign: 'Sample — Agencies' },
    { lead_id: 'bbbbbbbb-0000-4000-8000-000000000002', short_id: 'bbbbbbbc', company: 'Demo Digital', contact: 'Jamie Sample', title: 'Managing Director', domain: 'example.org', score: 89, campaign: 'Sample — Agencies' },
    { lead_id: 'bbbbbbbb-0000-4000-8000-000000000003', short_id: 'bbbbbbbd', company: 'Placeholder Labs', contact: 'Rita Sample', title: 'CEO', domain: 'example.net', score: 86, campaign: 'Sample — SaaS Founders' }
  ],
  last_run_error: null
};

const followups: FollowUps = {
  days_ahead: 14,
  due: [
    { lead_id: 'bbbbbbbb-0000-4000-8000-000000000001', short_id: 'bbbbbbbb', company: 'Example Agency', contact: 'Alex Sample', title: 'Founder & CEO', campaign: 'Sample — Agencies', step: 1, mode: 'LIVE', status: 'APPROVED', due_at: isoDaysAgo(-1) }
  ],
  stopped_last_14_days: [
    { lead_id: 'aaaaaaaa-0000-4000-8000-000000000001', short_id: 'aaaaaaaa', company: 'Northwind Studio', contact: 'Sara Example', campaign: 'Sample — Agencies', reason: 'REPLIED', stopped_at: isoDaysAgo(0) }
  ]
};

const lead: LeadStory = {
  lead_id: 'bbbbbbbb-0000-4000-8000-000000000001', short_id: 'bbbbbbbb', company: 'Example Agency', contact: 'Alex Sample', title: 'Founder & CEO',
  domain: 'example.com', campaign: 'Sample — Agencies', status: 'SENT', score: 94, qualification: 'QUALIFIED',
  reasons: ['Industry 25/25 (TARGET): matches a target industry.', 'Contact role 20/20 (TARGET): title matches "founder".', 'Score 94 against thresholds 75 (qualified) and 55 (review).'],
  research_status: 'SUFFICIENT', research_summary: 'Example Agency is a sample company used for demo mode.',
  email_angle: 'Hook (verified fact): sample hook.\nHypothesis (unverified): sample hypothesis.',
  current_draft: null,
  emails: [{ subject: 'Quick idea for Example Agency', sent_at: isoDaysAgo(3), status: 'SENT', mode: 'LIVE', step: 0 }],
  last_reply: null,
  follow_ups: { next_due: isoDaysAgo(-1), sequence: null, stop_reason: null },
  updated_at: isoDaysAgo(1)
};

export function demoRead(op: string, params: Record<string, unknown>): unknown {
  const overview = {
    since: isoDaysAgo(7), period_days: 7, leads_discovered: 30, leads_qualified: 22, leads_disqualified: 5, leads_researched: 18,
    drafts_created: 16, drafts_approved: 14, drafts_waiting_review: 1, emails_sent_live: 23, emails_dry_run: 2, followups_sent_live: 4,
    replies: 4, reply_rate_pct: 17.4, replies_by_intent: { INTERESTED: 1, QUESTION: 1, NOT_NOW: 1, OUT_OF_OFFICE: 1 }, opt_outs: 0,
    hard_bounces: 0, meetings_booked: 1, meetings_upcoming: 1, booking_replies_sent_live: 1, system
  };
  switch (op) {
    case 'dashboard':
      return { overview, system, campaigns: { campaigns: campaigns.filter((c) => c.status !== 'COMPLETED') }, sends: { days: sendsDays }, replies: { replies }, discovery };
    case 'campaigns':
      return { campaigns };
    case 'leads_board':
      return { replies: { replies }, followups, discovery };
    case 'replies':
      return { replies };
    case 'followups':
      return followups;
    case 'find_lead': {
      const q = String(params.query || '').toLowerCase();
      const hit = [lead.company, lead.contact, lead.domain, lead.short_id].some((v) => String(v || '').toLowerCase().includes(q));
      return { query: params.query, matches: hit ? [lead] : [] };
    }
    case 'system':
      return system;
    default:
      return {};
  }
}

export function demoBotReply(input: { text?: string; callback_data?: string }): BotReply {
  const text = String(input.text || '').trim();
  if (input.callback_data === 'jv_pause_confirm') return { route: 'done', text: 'Demo mode: nothing was paused.', buttons: [] };
  if (input.callback_data) return { route: 'done', text: 'Demo mode: button received, nothing changed.', buttons: [] };
  if (text.startsWith('/pause')) {
    return {
      route: 'done',
      text: 'Pause all sending now? Queued emails are held until an owner resumes.',
      buttons: [
        { text: 'Pause everything', callback_data: 'jv_pause_confirm' },
        { text: 'Cancel', callback_data: 'jv_pause_cancel' }
      ]
    };
  }
  if (text.startsWith('/report')) return { route: 'done', text: 'Weekly report, last 7 days (demo)\n\nLeads\n• Found 30, researched 18, qualified 22\n\nEmails\n• Sent 23 first emails and 4 follow-ups\n\nResults\n• Replies 4 (17.4% reply rate), calls booked 1', buttons: [] };
  if (text.startsWith('/summary')) return { route: 'done', text: 'Lead discovery, last 7 days (demo)\n\n• New leads: 30 (qualified 22, needs review 3)\n• Researched: 18', buttons: [] };
  if (text.startsWith('/run')) return { route: 'done', text: 'Start a lead search for "Sample — Agencies" now? (demo)', buttons: [{ text: 'Start now', callback_data: 'jvr:y:11111111-1111-4111-8111-111111111111' }, { text: 'Cancel', callback_data: 'jvr:n:11111111-1111-4111-8111-111111111111' }] };
  if (text.startsWith('/newcampaign')) return { route: 'done', text: 'New campaign (demo). Which countries should this campaign target?', buttons: [] };
  return { route: 'done', text: `Demo mode: in the real app IronWomen would answer "${text.slice(0, 120)}" from your LeadOps data.`, buttons: [] };
}
