// Shared by the middleware (edge) and server code: no Node-only imports here.
export function sessionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || '';
  if (secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters (see .env.example).');
  }
  return new TextEncoder().encode(secret);
}

export const SESSION_COOKIE = 'leadops_session';
export const SESSION_DAYS = 7;
