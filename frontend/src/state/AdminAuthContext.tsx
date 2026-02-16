import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { AdminSession } from '../types/models';

const ADMIN_TOKEN_KEY = 'safasfly_admin_session_token';
const ADMIN_EMAIL_KEY = 'safasfly_admin_session_email';

interface AdminAuthContextValue {
  session: AdminSession | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    const email = window.localStorage.getItem(ADMIN_EMAIL_KEY);
    if (token && email) {
      setSession({ token, email });
    }
  }, []);

  async function login(email: string, password: string) {
    const result = await api.login(email, password);
    const nextSession: AdminSession = {
      token: result.token,
      email: result.user.email,
    };

    setSession(nextSession);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ADMIN_TOKEN_KEY, nextSession.token);
      window.localStorage.setItem(ADMIN_EMAIL_KEY, nextSession.email);
    }
  }

  async function logout() {
    if (session) {
      await api.logout(session.token).catch(() => undefined);
    }

    setSession(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_EMAIL_KEY);
    }
  }

  const value = useMemo(
    () => ({
      session,
      login,
      logout,
    }),
    [session],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
}
