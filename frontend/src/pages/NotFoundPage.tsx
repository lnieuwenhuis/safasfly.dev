import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-14 pt-8 text-center md:px-6">
      <div className="rounded-3xl border border-primary/25 bg-base-200/60 p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">404</p>
        <h2 className="mt-3 text-4xl font-semibold text-base-content" style={{ fontFamily: 'Sora, sans-serif' }}>
          Page not found
        </h2>
        <p className="mt-3 text-base text-base-content/75">The page you requested does not exist.</p>
        <Link className="btn btn-primary mt-6" to="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
