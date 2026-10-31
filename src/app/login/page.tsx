import { LoginForm } from './LoginForm';

export const metadata = { title: 'Sign in · LeadOps' };

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; token?: string }>;
}) {
  const { error, token } = await searchParams;
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div className="brand" style={{ color: 'var(--ink)', padding: 0 }}>
          <span className="brand-mark" style={{ color: '#fff' }}>L</span> LeadOps
        </div>
        {token ? (
          <>
            <h1 style={{ fontSize: 22 }}>Almost there</h1>
            <p className="muted" style={{ margin: 0 }}>Press continue to finish signing in on this device.</p>
            <form method="post" action="/api/auth/verify">
              <input type="hidden" name="token" value={token} />
              <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                Continue to LeadOps
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22 }}>Sign in</h1>
            <p className="muted" style={{ margin: 0 }}>
              Enter your owner email. We&apos;ll send you a sign-in link — no password needed.
            </p>
            {error === 'link' ? (
              <div className="notice error">That sign-in link is invalid, expired or already used. Ask for a new one.</div>
            ) : null}
            <LoginForm />
          </>
        )}
      </div>
    </div>
  );
}
