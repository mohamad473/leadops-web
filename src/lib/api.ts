import 'server-only';
import { config } from './config';
import { demoBotReply, demoRead } from './demo';
import type { BotReply, Campaign, Dashboard, FollowUps, LeadsBoard, LeadStory, Reply } from './types';

export class ApiError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

type ReadOp =
  | 'dashboard'
  | 'overview'
  | 'system'
  | 'campaigns'
  | 'replies'
  | 'find_lead'
  | 'followups'
  | 'sends_by_day'
  | 'discovery'
  | 'leads_board';

async function post(body: Record<string, unknown>): Promise<any> {
  if (!config.n8nApiUrl || !config.n8nApiKey) {
    throw new ApiError('N8N_API_URL and N8N_API_KEY are not set (or set DEMO_MODE=true).', 500);
  }
  let res: Response;
  try {
    res = await fetch(config.n8nApiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-leadops-key': config.n8nApiKey },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(body.op === 'bot' ? 90_000 : 20_000)
    });
  } catch (err) {
    throw new ApiError(`Could not reach n8n: ${(err as Error).message}`);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.ok !== true) {
    throw new ApiError(json?.error ? `n8n: ${json.error}` : `n8n answered ${res.status}`, res.status || 502);
  }
  return json;
}

export async function read<T>(op: ReadOp, params: Record<string, unknown> = {}): Promise<T> {
  if (config.demoMode) return demoRead(op, params) as T;
  const json = await post({ op, params });
  return json.data as T;
}

export const api = {
  dashboard: (days = 7) => read<Dashboard>('dashboard', { days }),
  campaigns: (includeFinished = true) =>
    read<{ campaigns: Campaign[] }>('campaigns', { include_finished: includeFinished }),
  leadsBoard: (days = 30) => read<LeadsBoard>('leads_board', { days }),
  replies: (days = 30, intent = '') => read<{ replies: Reply[] }>('replies', { days, intent, limit: 100 }),
  followups: (daysAhead = 14) => read<FollowUps>('followups', { days_ahead: daysAhead }),
  findLead: (query: string, limit = 10) =>
    read<{ query: string; matches: LeadStory[] }>('find_lead', { query, limit })
};

/** Sends a command, question or button press to the IronWomen bot router as this owner. */
export async function askBot(
  telegramUserId: string,
  input: { text?: string; callback_data?: string }
): Promise<BotReply> {
  if (config.demoMode) return demoBotReply(input);
  // Button presses need a numeric update id (the router uses it to ignore repeats).
  const updateId = String(Date.now() * 1000 + Math.floor(Math.random() * 1000));
  const json = await post({
    op: 'bot',
    actor: { telegram_user_id: telegramUserId },
    params: { text: input.text || '', callback_data: input.callback_data || '', update_id: updateId }
  });
  const reply = json.reply || {};
  return {
    route: String(reply.route || 'done'),
    text: String(reply.text || ''),
    buttons: Array.isArray(reply.buttons) ? reply.buttons : []
  };
}
