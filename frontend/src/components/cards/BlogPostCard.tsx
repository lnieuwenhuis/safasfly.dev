import type { BlogPost } from '../../types/models';

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
      <div className="card-body gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{post.category}</p>
        <h3 className="card-title text-lg">{post.title}</h3>
        <p className="line-clamp-3 text-sm text-base-content/80">{post.excerpt}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/60">
          <span>{post.readTime}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}
