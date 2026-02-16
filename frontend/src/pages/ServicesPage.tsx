import { Link } from 'react-router-dom';
import { OfferCard } from '../components/cards/OfferCard';
import { ServicePageCard } from '../components/cards/ServicePageCard';
import { useSiteData } from '../state/SiteDataContext';

export function ServicesPage() {
  const { data } = useSiteData();
  if (!data) {
    return null;
  }

  return (
    <>
      <section className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Services</p>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
            Packages
          </h2>
          <p className="text-base-content/80">Clear scope, clear pricing, fast delivery.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {data.offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Landing pages</p>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
            Audience-focused pages
          </h2>
          <p className="text-base-content/80">Built for discovery and qualification.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.servicePages.map((item) => (
            <ServicePageCard key={item.id} item={item} />
          ))}
        </div>

        <div>
          <Link className="btn btn-primary normal-case" to="/contact">
            Request custom scope
          </Link>
        </div>
      </section>
    </>
  );
}
