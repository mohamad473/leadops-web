import 'server-only';

export type Owner = { email: string; telegramUserId: string };

function parseOwners(raw: string | undefined): Owner[] {
  return String(raw || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const idx = entry.lastIndexOf(':');
      const email = (idx > 0 ? entry.slice(0, idx) : entry).trim().toLowerCase();
      const telegramUserId = idx > 0 ? entry.slice(idx + 1).trim() : '';
      return { email, telegramUserId };
    })
    .filter((o) => o.email.includes('@'));
}

export const config = {
  appUrl: (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  owners: parseOwners(process.env.OWNERS),
  n8nApiUrl: process.env.N8N_API_URL || '',
  n8nApiKey: process.env.N8N_API_KEY || '',
  demoMode: String(process.env.DEMO_MODE || '').toLowerCase() === 'true',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'LeadOps <no-reply@localhost>'
  }
};

export function findOwner(email: string): Owner | undefined {
  const e = String(email || '').trim().toLowerCase();
  return config.owners.find((o) => o.email === e);
}
