import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { api } from '../../lib/api';

const STAGING_UNLOCK_KEY = 'safasfly_staging_unlocked';

function isStagingGuardEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const forced = String(import.meta.env.VITE_STAGING_GUARD || '').toLowerCase() === 'true';
  if (forced) {
    return true;
  }

  const hostPrefix = String(import.meta.env.VITE_STAGING_HOST_PREFIX || 'staging.').trim().toLowerCase();
  if (!hostPrefix) {
    return false;
  }

  return window.location.hostname.toLowerCase().startsWith(hostPrefix);
}

export function StagingAccessGate({ children }: { children: ReactNode }) {
  const guardEnabled = useMemo(() => isStagingGuardEnabled(), []);
  const [isUnlocked, setIsUnlocked] = useState(!guardEnabled);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!guardEnabled || typeof window === 'undefined') {
      return;
    }

    const unlocked = window.sessionStorage.getItem(STAGING_UNLOCK_KEY) === '1';
    setIsUnlocked(unlocked);
  }, [guardEnabled]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.unlockStaging(password);

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(STAGING_UNLOCK_KEY, '1');
      }

      setIsUnlocked(true);
      setPassword('');
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'Invalid password');
    } finally {
      setLoading(false);
    }
  }

  if (!guardEnabled || isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div data-theme="night" className="relative min-h-screen overflow-x-hidden bg-base-100 text-base-content">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% -10%, rgba(88,101,242,0.35), transparent 40%), radial-gradient(circle at 100% 0%, rgba(147,112,219,0.22), transparent 34%), radial-gradient(circle at 90% 90%, rgba(58,37,102,0.55), transparent 32%)',
        }}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4">
        <form
          className="card w-full max-w-md border border-primary/30 bg-base-200/65 shadow-xl shadow-primary/15 backdrop-blur"
          onSubmit={handleSubmit}
        >
          <div className="card-body gap-4 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Staging</p>
            <h1 className="text-3xl font-semibold leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              Access required
            </h1>
            <p className="text-sm text-base-content/75">Enter the admin password to access this staging environment.</p>

            <label htmlFor="staging-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/70">
              Admin password
            </label>
            <input
              id="staging-password"
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button type="submit" className="btn btn-primary normal-case" disabled={loading}>
              {loading ? 'Checking...' : 'Unlock staging'}
            </button>

            {error ? <p className="text-sm text-error">{error}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

