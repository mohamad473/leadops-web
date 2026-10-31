# n8n Web App API (LeadOps W1)

Workflow: **LeadOps W1 — Web App API** (`mrApf4OKfcEAihmY`), published.

`POST https://n8n.mohamad-saad.com/webhook/leadops-web-api`
Header: `x-leadops-key: <N8N_API_KEY>` · Body: JSON.

Responses: `{ "ok": true, "op": "...", "data": ... }` for reads, `{ "ok": true, "op": "bot", "reply": { "route", "text", "buttons" } }` for actions,
`{ "ok": false, "error": "..." }` with 400 / 401 / 502 on errors.

## Reads (STABLE `leadops.jv_*` functions only)

| `op` | `params` | Function(s) |
| --- | --- | --- |
| `dashboard` | `days` (1–90, default 7) | `jv_overview`, `jv_system_status`, `jv_campaigns(false)`, `jv_sends_by_day` (last 14 days), `jv_replies(days, '', 8)`, `jv_discovery_summary` |
| `overview` | `days` (1–365) | `jv_overview` |
| `system` | – | `jv_system_status` |
| `campaigns` | `include_finished` (bool) | `jv_campaigns` |
| `replies` | `days`, `intent`, `limit` (≤100) | `jv_replies` |
| `find_lead` | `query` (≥2 chars), `limit` (≤20) | `jv_find_lead` |
| `followups` | `days_ahead` (1–60) | `jv_followups` |
| `sends_by_day` | `from_date`, `to_date` (YYYY-MM-DD) | `jv_sends_by_day` |
| `discovery` | `days` (1–90) | `jv_discovery_summary` |
| `leads_board` | `days` (1–365) | `jv_replies(days, '', 100)`, `jv_followups(14)`, `jv_discovery_summary` |

## Actions

```json
{ "op": "bot", "actor": { "telegram_user_id": "123456789" },
  "params": { "text": "/report", "callback_data": "", "update_id": "1793454430000123" } }
```

Sent to **LeadOps J0 — Bot Router** as `bot: discovery`, `chat_type: private`, `chat_id = user_id = telegram_user_id`.
J0 checks the role (`jv_actor_role`) and handles `/run`, `/newcampaign`, `/summary`, `/report`, `/pause`, questions and buttons.
`callback_data` must be `jv_pause_confirm`, `jv_pause_cancel` or `jv[bkcr]:[yn]:<uuid>`; button presses need a numeric `update_id` (the app sends a unique one).

Successful executions of this workflow are not saved (to keep the execution list clean); failed ones are, and go to the shared error workflow.
