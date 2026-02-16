import type { RetainerPlan } from '../../types/models';

export function RetainerCard({ plan }: { plan: RetainerPlan }) {
  return (
    <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <h3 className="card-title text-lg">{plan.name}</h3>
          <span className="badge badge-primary badge-lg">{plan.price}</span>
        </header>

        <p className="text-sm text-base-content/80">{plan.hoursPerMonth} development hours / month</p>
        <p className="text-sm text-base-content/80">{plan.supportSla}</p>

        <ul className="space-y-2 text-sm text-base-content/80">
          {plan.includes.map((item) => (
            <li key={`${plan.id}-${item}`} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-base-content/60">{plan.hostingIncluded ? 'Hosting included' : 'Hosting optional'}</p>
      </div>
    </article>
  );
}
