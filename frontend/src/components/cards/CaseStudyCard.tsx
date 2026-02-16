import type { CaseStudy } from '../../types/models';

export function CaseStudyCard({ item }: { item: CaseStudy }) {
  return (
    <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{item.industry}</p>
        <h3 className="card-title text-lg">{item.title}</h3>
        <p className="line-clamp-3 text-sm text-base-content/80">{item.outcome}</p>
        <p className="text-xs text-base-content/60">{item.clientName}</p>
        <div className="card-actions">
          <a href={item.projectUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-primary btn-sm normal-case">
            Open project
          </a>
        </div>
      </div>
    </article>
  );
}
