export function MaintenanceAgreementPage() {
  return (
    <section className="card max-w-4xl border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body space-y-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Operations</p>
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
          Maintenance and Hosting Agreement
        </h2>
        <p className="text-base-content/80">
          Monthly maintenance plans include uptime checks, SSL renewals, dependency updates, backup verification, and
          support response according to your plan SLA.
        </p>
        <p className="text-base-content/80">
          Incident handling begins on acknowledgement. Priority levels are assigned based on production impact.
        </p>
        <p className="text-base-content/80">
          Content and feature requests are executed within available monthly hours or scoped separately if they exceed
          plan capacity.
        </p>
      </div>
    </section>
  );
}
