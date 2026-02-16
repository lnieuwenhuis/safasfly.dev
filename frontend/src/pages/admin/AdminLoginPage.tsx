import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { trackEvent } from '../../lib/analytics';
import { useAdminAuth } from '../../state/AdminAuthContext';

const SEEDED_ADMIN_EMAIL = 'lnieuwenhuis48@icloud.com';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, login } = useAdminAuth();
  const [email, setEmail] = useState(SEEDED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    trackEvent('admin_login_page_view').catch(() => undefined);
  }, []);

  if (session) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      setPassword('');
      trackEvent('admin_login_success').catch(() => undefined);
      navigate('/admin/dashboard', { replace: true });
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'Failed to login');
      trackEvent('admin_login_failed').catch(() => undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-14 pt-8 md:px-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Admin</p>
        <h2 className="text-4xl font-semibold leading-tight text-base-content md:text-5xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          Dashboard access
        </h2>
        <p className="text-base text-base-content/75">Sign in to manage projects, offers, SEO pages, insights, and incoming leads.</p>
      </div>

      <form
        className="mt-6 rounded-3xl border border-primary/30 bg-base-200/65 p-6 shadow-xl shadow-primary/10 backdrop-blur
          [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.18em] [&_label]:text-base-content/70
          [&_input]:mt-2 [&_input]:mb-4 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-primary/35 [&_input]:bg-base-100/60
          [&_input]:px-4 [&_input]:py-2.5 [&_input]:text-sm [&_input]:text-base-content [&_input]:outline-none [&_input]:transition
          [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-primary/35"
        onSubmit={handleSubmit}
      >
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {error ? <p className="mt-4 text-sm font-semibold text-error">{error}</p> : null}
      </form>
    </section>
  );
}
