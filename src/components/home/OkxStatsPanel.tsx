import { useMemo } from "react";
import { useOkxMarketStats } from "@/hooks/useOkxMarketStats";

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}

function formatPrice(value: number): string {
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(3);
  return value.toFixed(5);
}

export default function OkxStatsPanel() {
  const { data, isLoading } = useOkxMarketStats();

  const best = useMemo(() => data?.leader, [data?.leader]);

  if (isLoading && !data) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">Loading OKX market statistics...</div>;
  }

  if (!data) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">OKX statistics are temporarily unavailable.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
      <section className="story-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[1.2rem] text-[hsl(var(--foreground))]">OKX Spot Snapshot</h3>
          <span className={`text-[0.62rem] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full ${data.isLive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"}`}>
            {data.isLive ? "Live" : "Simulated"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-white/55 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Tracked 24H Vol</p>
            <p className="mt-2 text-[1.3rem] text-[hsl(var(--foreground))]">{formatCompact(data.totalVolume24h)}</p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-white/55 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Avg 24H Change</p>
            <p className={`mt-2 text-[1.3rem] ${data.avgChange24h >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {data.avgChange24h >= 0 ? "+" : ""}{data.avgChange24h.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-white/55 p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Top Mover</p>
            <p className="mt-2 text-[1.3rem] text-[hsl(var(--foreground))]">{best?.instrument ?? "-"}</p>
          </div>
        </div>

        <div className="mt-7 overflow-x-auto rounded-2xl border border-[hsl(var(--card-border))]">
          <table className="w-full min-w-[560px] text-left">
            <thead className="bg-white/70">
              <tr>
                {"Pair,Last,24H,High,Low".split(",").map((label) => (
                  <th key={label} className="px-4 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))] font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.tickers.map((ticker) => (
                <tr key={ticker.instrument} className="border-t border-[hsl(var(--card-border))] bg-white/45">
                  <td className="px-4 py-3 text-[0.86rem] text-[hsl(var(--foreground))]">{ticker.instrument}</td>
                  <td className="px-4 py-3 text-[0.86rem] text-[hsl(var(--foreground))]">{formatPrice(ticker.lastPrice)}</td>
                  <td className={`px-4 py-3 text-[0.86rem] ${ticker.change24h >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {ticker.change24h >= 0 ? "+" : ""}{ticker.change24h.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-[0.86rem] text-[hsl(var(--foreground))]">{formatPrice(ticker.high24h)}</td>
                  <td className="px-4 py-3 text-[0.86rem] text-[hsl(var(--foreground))]">{formatPrice(ticker.low24h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="story-card p-6 sm:p-8">
        <h4 className="text-[1.05rem] text-[hsl(var(--foreground))]">Market Health Signal</h4>
        <p className="mt-3 text-[0.9rem] text-[hsl(var(--muted-foreground))] leading-relaxed">
          Use this live OKX dashboard to decide whether your strategy should trade trend continuation or mean reversion.
          Positive breadth with rising volume favors momentum systems. Mixed breadth with falling volume favors fade setups.
        </p>

        <div className="mt-6 space-y-3">
          {data.tickers.map((ticker) => {
            const pct = Math.min(Math.abs(ticker.change24h) * 12, 100);
            return (
              <div key={`${ticker.instrument}-bar`}>
                <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">
                  <span>{ticker.instrument}</span>
                  <span>{ticker.change24h >= 0 ? "+" : ""}{ticker.change24h.toFixed(2)}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ticker.change24h >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
