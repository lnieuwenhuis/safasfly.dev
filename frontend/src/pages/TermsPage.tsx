export function TermsPage() {
  return (
    <section className="card max-w-4xl border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body space-y-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Legal</p>
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
          Terms of Service
        </h2>
        <p className="text-base-content/80">
          Engagements are executed under written scope agreements. Timelines and deliverables are bound to the approved
          project scope and revision terms.
        </p>
        <p className="text-base-content/80">
          Fixed-scope projects require milestone approval before handoff. Ongoing retainer work is delivered in monthly
          cycles based on reserved hours.
        </p>
        <p className="text-base-content/80">
          Hosting and maintenance plans include operational support, but third-party service outages remain outside direct
          control.
        </p>
      </div>
    </section>
  );
}
