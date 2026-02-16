import type { OfferPackage } from '../../types/models';

export function OfferCard({ offer }: { offer: OfferPackage }) {
  const keyDeliverables = offer.includes.slice(0, 3);

  return (
    <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-lg">{offer.name}</h3>
          <span className="badge badge-primary badge-lg">{offer.priceFrom}</span>
        </div>

        <p className="line-clamp-2 text-sm text-base-content/80">{offer.description}</p>

        <ul className="space-y-2 text-sm text-base-content/80">
          {keyDeliverables.map((item) => (
            <li key={`${offer.id}-${item}`} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
          {offer.includes.length > keyDeliverables.length ? (
            <li className="text-xs uppercase tracking-[0.15em] text-base-content/60">
              + {offer.includes.length - keyDeliverables.length} more deliverables
            </li>
          ) : null}
        </ul>

        <div className="flex flex-wrap gap-2">
          <span className="badge badge-outline">{offer.timeline}</span>
          <span className="badge badge-outline">{offer.revisions}</span>
        </div>
      </div>
    </article>
  );
}
