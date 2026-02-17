export function MaintenanceAgreementPage() {
  return (
    <section className="card max-w-4xl border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body space-y-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Operations</p>
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
          Project Operations Notes
        </h2>
        <p className="text-base-content/80">
          Demo and portfolio projects are monitored for uptime, dependency updates, and basic security hygiene when needed.
        </p>
        <p className="text-base-content/80">
          Incident handling starts after acknowledgement and is prioritized based on project impact and available time.
        </p>
        <p className="text-base-content/80">
          Larger feature updates are planned in separate build cycles so project quality remains predictable.
        </p>
      </div>
    </section>
  );
}
