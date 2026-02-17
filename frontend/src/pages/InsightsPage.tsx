import { BlogPostCard } from '../components/cards/BlogPostCard';
import { useSiteData } from '../state/SiteDataContext';

export function InsightsPage() {
  const { data } = useSiteData();
  if (!data) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Notes</p>
        <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          Learning notes
        </h2>
        <p className="text-base-content/80">
          Short write-ups on technical decisions, build trade-offs, and lessons from recent projects.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.blogPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
