# LeadOps Web

The LeadOps control center: one place to see campaigns, leads, replies and system health, and to talk to **IronWomen** — the same bot you use in Telegram.

- **Overview** — this week's numbers, pipeline (found → booked), emails per day, latest replies, campaigns, system health and alerts.
- **Campaigns** — every campaign with its leads by stage, sends and replies. Run a lead search now, get a report or summary, pause all sending.
- **Leads & Replies** — replies, follow-ups due, top qualified leads and stopped sequences, plus search. Click a lead to see its whole story: score and reasons, research, email angle, emails, last reply, next follow-up.
- **IronWomen & Automations** — a full IronWomen chat (questions, `/newcampaign`, `/run`, `/report`, `/summary`, `/pause`, confirm buttons), bots, schedules, alerts and the automation pipeline.

## How it connects

```
Browser ──▶ this Next.js app (server side) ──▶ n8n "LeadOps W1 — Web App API" ──┬─▶ leadops.jv_* read functions (Postgres)
                                                                                 └─▶ J0 Bot Router (same as Telegram)
```

- The browser never talks to n8n or the database. The app's server calls one n8n webhook with a secret key (`x-leadops-key`).
- **Reads** only call the existing STABLE `leadops.jv_*` functions with parameters (the same ones IronWomen uses). No free SQL.
- **Actions** go through the **J0 Bot Router** as you (your Telegram user id from `OWNERS`), so owner/reviewer/viewer rules, confirmations and safety checks are exactly the same as in Telegram. Nothing new can send email or change state that the bots could not already.

See [`docs/n8n-api.md`](docs/n8n-api.md) for the API contract.

## Run it locally

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
# fill in .env.local (see below)
npm run dev
```

Open http://localhost:3000 (use the same address as `APP_URL`, so the sign-in cookie matches).

### `.env.local`

| Variable | What it is |
| --- | --- |
| `APP_URL` | Address of the app, e.g. `http://localhost:3000`. Used in sign-in links. |
| `SESSION_SECRET` | Long random string. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `OWNERS` | Who can sign in, with their Telegram user id: `you@x.com:123456789,partner@y.com:987654321` |
| `N8N_API_URL` | `https://n8n.mohamad-saad.com/webhook/leadops-web-api` |
| `N8N_API_KEY` | The key in the n8n node **Check Key and Plan** (`SECRET`). Never commit it. |
| `SMTP_*` | Mail server for sign-in links. Leave `SMTP_HOST` empty in development: the link is printed in the terminal. |
| `DEMO_MODE` | `true` = sample data and canned bot replies, no n8n needed. |

### Signing in

1. Enter an email listed in `OWNERS`.
2. In development (no SMTP), copy the link printed in the terminal; otherwise open the email.
3. Press **Continue to LeadOps**. Sessions last 7 days. Links work once and expire after 15 minutes.

Removing someone from `OWNERS` locks them out on their next request.

## Notes and limits (v1)

- The Leads page lists replies, follow-ups, top qualified and stopped sequences, and searches any lead. A full "all leads" table needs a new read function in the database (`leadops.jv_leads`) — planned for v2.
- Resuming sending after a pause is still done with `/resume_all` in the Outreach bot.
- IronWomen conversations from the website share the bot memory with your Telegram chat (same user id).
- Magic-link one-time use is tracked in memory, so it resets if the server restarts (links still expire after 15 minutes).

## Hosting later

Any Node host works (`npm run build && npm start`), e.g. Vercel, Railway or a Docker container next to n8n. Set the same environment variables there, set `APP_URL` to the public https address, and configure SMTP.

## Rotating the API key

1. Generate a new key and put it in the n8n node **Check Key and Plan** (`const SECRET = '…'`), then publish the workflow.
2. Update `N8N_API_KEY` in the app's environment and restart.
