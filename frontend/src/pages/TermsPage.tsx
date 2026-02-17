export function TermsPage() {
  return (
    <section className="card max-w-4xl border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body space-y-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Legal</p>
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
          Terms of Use
        </h2>
        <p className="text-base-content/80">
          This website is a personal student portfolio. Content is shared for educational and informational purposes.
        </p>
        <p className="text-base-content/80">
          Code samples, project write-ups, and notes may change over time as I continue developing skills and updating work.
        </p>
        <p className="text-base-content/80">
          Any future collaboration or freelance work is handled only through separate written agreements.
        </p>
      </div>
    </section>
  );
}
