// Shapes returned by the leadops.jv_* functions through the n8n Web App API.
// Fields are optional where the database may leave them out.

export type SystemState = {
  dry_run?: boolean;
  live_sending_enabled?: boolean;
  safety_pause?: boolean;
  active_pauses?: number;
  activation_phase?: string;
  open_alerts?: Record<string, number>;
  sent_today_live?: number;
  pauses?: unknown[];
  recent_open_alerts?: Alert[];
};

export type Alert = {
  title: string;
  message?: string;
  severity?: string;
  count?: number;
  last_seen?: string;
};

export type Overview = {
  since?: string;
  period_days?: number;
  leads_discovered?: number;
  leads_qualified?: number;
  leads_disqualified?: number;
  leads_researched?: number;
  drafts_created?: number;
  drafts_approved?: number;
  drafts_waiting_review?: number;
  emails_sent_live?: number;
  emails_dry_run?: number;
  followups_sent_live?: number;
  replies?: number;
  reply_rate_pct?: number | null;
  replies_by_intent?: Record<string, number>;
  opt_outs?: number;
  hard_bounces?: number;
  meetings_booked?: number;
  meetings_upcoming?: number;
  booking_replies_sent_live?: number;
  system?: SystemState;
};

export type Campaign = {
  campaign_id: string;
  short_id?: string;
  name: string;
  status: string;
  created_at?: string;
  lead_source?: string;
  lead_limit?: number | null;
  daily_send_cap?: number | null;
  emails_sent_live?: number;
  emails_dry_run?: number;
  replies?: number;
  leads_by_status?: Record<string, number>;
};

export type SendsDay = {
  day: string;
  live_sent?: number;
  dry_run?: number;
  replies?: number;
  bounces?: number;
};

export type Reply = {
  received_at?: string;
  company?: string;
  contact?: string;
  email?: string;
  intent?: string;
  summary?: string;
  excerpt?: string;
  campaign?: string;
  lead_id?: string;
  short_id?: string;
  [key: string]: unknown;
};

export type TopLead = {
  lead_id: string;
  short_id?: string;
  company?: string;
  contact?: string;
  title?: string;
  domain?: string;
  score?: number;
  campaign?: string;
};

export type Discovery = {
  period_days?: number;
  runs?: number;
  runs_failed?: number;
  fetched?: number;
  accepted?: number;
  new_leads?: number;
  qualified?: number;
  needs_review?: number;
  disqualified?: number;
  researched?: number;
  drafts_ready?: number;
  duplicates?: number;
  invalid?: number;
  suppressed?: number;
  sources?: Record<string, number>;
  leads_by_status?: Record<string, number>;
  top_qualified?: TopLead[];
  last_run_error?: { code?: string } | null;
};

export type FollowUp = {
  lead_id: string;
  short_id?: string;
  company?: string;
  contact?: string;
  title?: string;
  domain?: string;
  campaign?: string;
  step?: number;
  mode?: string;
  status?: string;
  due_at?: string;
  reason?: string | null;
  stopped_at?: string;
};

export type FollowUps = {
  days_ahead?: number;
  due?: FollowUp[];
  stopped_last_14_days?: FollowUp[];
};

export type LeadStory = {
  lead_id: string;
  short_id?: string;
  company?: string;
  contact?: string;
  title?: string;
  domain?: string;
  campaign?: string;
  status?: string;
  score?: number;
  qualification?: string;
  reasons?: string[];
  research_status?: string;
  research_summary?: string;
  email_angle?: string;
  current_draft?: { subject?: string; body?: string; status?: string } | null;
  emails?: { subject?: string; sent_at?: string; status?: string; mode?: string; step?: number }[];
  last_reply?: Reply | null;
  follow_ups?: { next_due?: string | null; sequence?: unknown; stop_reason?: string | null };
  updated_at?: string;
};

export type Dashboard = {
  overview: Overview;
  system: SystemState;
  campaigns: { campaigns: Campaign[] };
  sends: { from?: string; to?: string; days: SendsDay[] };
  replies: { replies: Reply[]; period_days?: number };
  discovery: Discovery;
};

export type LeadsBoard = {
  replies: { replies: Reply[]; period_days?: number };
  followups: FollowUps;
  discovery: Discovery;
};

export type BotButton = { text: string; callback_data: string };
export type BotReply = { route: string; text: string; buttons: BotButton[] };
