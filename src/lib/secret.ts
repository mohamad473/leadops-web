// Shared by the middleware (edge) and server code: no Node-only imports here.

// Used only by `npm run dev` when SESSION_SECRET is missing, so local testing works out of the box.
// It is public (it is in this file), so it is never accepted in production.
const DEV_FALLBACK_SECRET = 'leadops-dev-only-secret-do-not-use-in-production-0001';
let warned = false;

export function sessionKey(): Uint8Array {
  let secret = (process.env.SESSION_SECRET || '').trim();
  if (secret.length < 32) {
    if (process.env.NODE_ENV !== 'production') {
      if (!warned) {
        warned = true;
        console.warn(
          '[LeadOps] SESSION_SECRET is missing or shorter than 32 characters in .env.local, ' +
            'so a built-in development secret is used. Set a real one before hosting the app.'
        );
      }
      secret = DEV_FALLBACK_SECRET;
    } else {
      throw new Error(
        'SESSION_SECRET must be set to at least 32 characters in the environment (see .env.example), then restart the app.'
      );
    }
  }
  return new TextEncoder().encode(secret);
}

export const SESSION_COOKIE = 'leadops_session';
export const SESSION_DAYS = 7;
