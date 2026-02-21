import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { useCryptoNews } from "@/hooks/useCryptoNews";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sentimentClass(sentiment: string): string {
  if (sentiment === "bullish") return "text-emerald-700 bg-emerald-100";
  if (sentiment === "bearish") return "text-rose-700 bg-rose-100";
  return "text-zinc-700 bg-zinc-200";
}

export default function NewsPanel() {
  const { data, isLoading } = useCryptoNews();

  const headline = useMemo(() => data?.items[0], [data?.items]);
  const rest = useMemo(() => data?.items.slice(1, 6) ?? [], [data?.items]);

  if (isLoading && !data) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">Loading crypto headlines...</div>;
  }

  if (!headline) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">News feed is temporarily unavailable.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
      <article className="story-card p-7 sm:p-8">
        <div className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
          <span className={`px-2.5 py-1 rounded-full font-medium ${data?.isLive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"}`}>
            {data?.isLive ? "Live Feed" : "Fallback Feed"}
          </span>
          <span>{headline.source}</span>
        </div>

        <h3 className="mt-5 text-[1.4rem] sm:text-[1.75rem] text-[hsl(var(--foreground))] leading-tight">
          {headline.title}
        </h3>

        <p className="mt-4 text-[0.95rem] text-[hsl(var(--muted-foreground))] leading-relaxed">
          {headline.summary}
        </p>

        <div className="mt-8 flex items-center justify-between gap-3">
          <span className="text-[0.7rem] tracking-[0.12em] uppercase text-[hsl(var(--muted-foreground))]">
            {formatTime(headline.publishedAt)}
          </span>
          <a
            href={headline.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.7rem] tracking-[0.1em] uppercase no-underline border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
          >
            Read Story <ExternalLink size={12} />
          </a>
        </div>
      </article>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {rest.map((item) => (
          <article key={item.id} className="story-card p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{item.source}</span>
              <span className={`text-[0.58rem] uppercase tracking-[0.11em] px-2 py-0.5 rounded-full ${sentimentClass(item.sentiment)}`}>
                {item.sentiment}
              </span>
            </div>
            <h4 className="mt-3 text-[1rem] leading-snug text-[hsl(var(--foreground))]">{item.title}</h4>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-[hsl(var(--muted-foreground))]">
              {item.summary.slice(0, 120)}...
            </p>
            <div className="mt-4 text-[0.62rem] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">{formatTime(item.publishedAt)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
