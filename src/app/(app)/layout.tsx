import { NavLinks } from '@/components/NavLinks';
import { config } from '@/lib/config';
import { requireSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="shell">
      <nav className="nav" aria-label="Main">
        <div className="brand">
          <span className="brand-mark">L</span> LeadOps
        </div>
        <NavLinks />
        <div className="nav-foot">
          <span className="who">{session.email}</span>
          {config.demoMode ? <span className="badge amber" style={{ alignSelf: 'flex-start' }}>Demo data</span> : null}
          <form method="post" action="/api/auth/logout">
            <button type="submit">Sign out</button>
          </form>
        </div>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
}
