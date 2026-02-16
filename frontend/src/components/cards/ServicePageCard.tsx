import type { ServiceLandingPage } from '../../types/models';

export function ServicePageCard({ item }: { item: ServiceLandingPage }) {
  return (
    <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body gap-3 p-5">
        <h3 className="card-title text-lg">{item.title}</h3>
        <p className="line-clamp-3 text-sm text-base-content/80">{item.summary}</p>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-outline">{item.audience}</span>
          <span className="badge badge-outline">{item.city}</span>
        </div>
      </div>
    </article>
  );
}
