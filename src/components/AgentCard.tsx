import { memo, lazy, Suspense } from "react";
import type { Agent } from "@/lib/mockAgents";

const AgentCoin3D = lazy(() => import("@/components/AgentCoin3D"));

const AgentCard = memo(({ agent, onClick }: { agent: Agent; onClick?: () => void }) => {
  const isPositive = agent.pnlPercent >= 0;
  const pnlSign = isPositive && agent.pnlPercent > 0 ? "+" : "";

  const displayTags = agent.tags.slice(0, 3);

  return (
    <div
      onClick={onClick}
      className="border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 hover:border-[hsl(var(--card-border-hover))] cursor-pointer hover:shadow-[0_0_20px_2px_hsla(0,0%,0%,0.06)] hover:scale-[1.03]"
    >
      {/* Big 3D Coin */}
      <div className="flex justify-center py-2">
        <Suspense fallback={<div className="w-[100px] h-[100px] rounded-full bg-[hsl(var(--chip-bg))]" />}>
          <AgentCoin3D size={100} seed={agent.id} />
        </Suspense>
      </div>

      {/* Name */}
      <div className="text-center">
        <h3 className="text-sm text-[hsl(var(--foreground))] font-semibold" style={{ fontFamily: "var(--font-body)" }}>{agent.name}</h3>
        <span className="text-[0.6rem] text-[hsl(var(--muted-foreground))]">{agent.creator}</span>
      </div>

      {/* Description */}
      <p className="text-[0.7rem] text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-2 text-center">{agent.description}</p>

      {/* Tags + PnL */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {displayTags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-[0.65rem] rounded-full bg-[hsl(var(--tag-bg))] text-[hsl(var(--foreground))] font-medium">{tag}</span>
          ))}
        </div>
        <span className="text-base font-semibold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-body)" }}>
          {pnlSign}{agent.pnlPercent.toFixed(2)}%
        </span>
      </div>

      {/* Chart */}
      <div className="h-10 w-full rounded overflow-hidden relative">
        <svg viewBox="0 0 200 48" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? "hsl(145 63% 49%)" : "hsl(0 84% 50%)"} stopOpacity="0.15" />
              <stop offset="100%" stopColor={isPositive ? "hsl(145 63% 49%)" : "hsl(0 84% 50%)"} stopOpacity="0" />
            </linearGradient>
          </defs>
          {agent.trades > 0 ? (
            <>
              <path d={generateChartPath(agent.id, isPositive)} fill={`url(#grad-${agent.id})`} />
              <path d={generateLinePath(agent.id, isPositive)} fill="none" stroke={isPositive ? "hsl(145 63% 49%)" : "hsl(0 84% 50%)"} strokeWidth="1.5" strokeOpacity="0.7" />
            </>
          ) : (
            <line x1="0" y1="24" x2="200" y2="24" stroke="hsl(0 0% 80%)" strokeWidth="1" strokeDasharray="4 4" />
          )}
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "WIN RATE", value: `${agent.winRate.toFixed(1)}%` },
          { label: "TRADES", value: agent.trades.toString() },
          { label: "RUNTIME", value: agent.runtime },
          { label: "VOLUME", value: `$${formatVolume(agent.volume)}` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-[0.55rem] tracking-[0.1em] text-[hsl(var(--metric-label))] uppercase">{label}</p>
            <p className="text-xs text-[hsl(var(--metric-value))] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center mt-auto pt-2">
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          className="px-4 py-2 text-[0.65rem] rounded-full border border-[hsl(var(--foreground))] text-[hsl(var(--foreground))] tracking-[0.05em] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:shadow-[0_0_16px_3px_hsla(0,0%,0%,0.2)] transition-all duration-200 flex items-center gap-1.5"
        >
          Configure & Launch
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12L12 4M12 4H6M12 4V10"/></svg>
        </button>
      </div>
    </div>
  );
});

function generateChartPath(id: string, up: boolean): string {
  const seed = hashId(id);
  const points: number[] = [];
  let y = 24;
  for (let i = 0; i <= 20; i++) {
    y += (pseudoRandom(seed + i) - (up ? 0.55 : 0.45)) * 8;
    y = Math.max(4, Math.min(44, y));
    points.push(y);
  }
  let d = `M0,48 L0,${points[0]}`;
  points.forEach((py, i) => { d += ` L${i * 10},${py}`; });
  d += ` L200,48 Z`;
  return d;
}

function generateLinePath(id: string, up: boolean): string {
  const seed = hashId(id);
  const points: number[] = [];
  let y = 24;
  for (let i = 0; i <= 20; i++) {
    y += (pseudoRandom(seed + i) - (up ? 0.55 : 0.45)) * 8;
    y = Math.max(4, Math.min(44, y));
    points.push(y);
  }
  let d = `M0,${points[0]}`;
  points.forEach((py, i) => { if (i > 0) d += ` L${i * 10},${py}`; });
  return d;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function formatVolume(v: number): string {
  if (v >= 1000) return (v / 1000).toFixed(2) + "K";
  return v.toFixed(2);
}

AgentCard.displayName = "AgentCard";
export default AgentCard;
