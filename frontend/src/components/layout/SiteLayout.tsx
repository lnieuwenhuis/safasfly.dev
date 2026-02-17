import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { trackEvent } from '../../lib/analytics';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/services', label: 'Skills' },
  { to: '/insights', label: 'Notes' },
  { to: '/contact', label: 'Contact' },
];

export function SiteLayout() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    trackEvent('page_view').catch(() => undefined);
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div data-theme="lofi" className="relative min-h-screen overflow-x-hidden bg-base-100 text-base-content">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% -10%, rgba(14,165,233,0.25), transparent 45%), radial-gradient(circle at 95% 0%, rgba(250,204,21,0.28), transparent 38%), radial-gradient(circle at 85% 95%, rgba(20,184,166,0.22), transparent 40%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-44 -top-40 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.36) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-48 top-40 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.34) 0%, transparent 70%)' }}
      />

      <header className="sticky top-0 z-40 border-b border-primary/20 bg-base-100/80 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-3">
            <NavLink to="/" className="text-xl font-bold tracking-wide text-base-content" style={{ fontFamily: 'Sora, sans-serif' }}>
              safasfly.dev
            </NavLink>

            <button
              type="button"
              className="btn btn-ghost btn-sm border border-primary/25 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>

            <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `btn btn-sm normal-case ${isActive ? 'btn-primary' : 'btn-ghost text-base-content/80'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <NavLink to="/contact" className="btn btn-primary btn-sm hidden normal-case md:inline-flex">
              Say hello
            </NavLink>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-3 space-y-2 rounded-2xl border border-primary/25 bg-base-200/70 p-3 md:hidden">
              <nav aria-label="Mobile navigation" className="grid gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `btn btn-sm justify-start normal-case ${isActive ? 'btn-primary' : 'btn-ghost text-base-content/85'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <NavLink to="/contact" className="btn btn-primary btn-sm w-full normal-case">
                Say hello
              </NavLink>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.22,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-primary/20 bg-base-100/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-2 px-4 py-5 text-sm text-base-content/70 md:flex-row md:items-center md:justify-between md:gap-3 md:px-6">
          <p>{new Date().getFullYear()} safasfly.dev</p>
          <p className="flex flex-wrap items-center gap-2">
            <NavLink to="/terms" className="link-hover">
              Terms
            </NavLink>
            <span>•</span>
            <NavLink to="/privacy" className="link-hover">
              Privacy
            </NavLink>
            <span>•</span>
            <NavLink to="/maintenance-agreement" className="link-hover">
              Ops notes
            </NavLink>
          </p>
          <p>4th-year MBO4 Software Development student portfolio</p>
        </div>
      </footer>
    </div>
  );
}
