import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAgentStrategyPreview } from "@/hooks/useAgentStrategyPreview";

export default function StrategyPanel() {
  const { data, isLoading } = useAgentStrategyPreview();

  if (isLoading && !data) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">Building strategy view...</div>;
  }

  if (!data) {
    return <div className="story-card p-8 text-sm text-[hsl(var(--muted-foreground))]">Strategy preview is not available right now.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
      <section className="story-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[1.2rem] text-[hsl(var(--foreground))]">Agent Builder</h3>
          <Link
            to="/create-agent"
            className="inline-flex items-center gap-1.5 no-underline px-4 py-2 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[0.68rem] uppercase tracking-[0.1em]"
          >
            Create Agent <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard label="Market Focus" value={data.blueprint.marketFocus} />
          <InfoCard label="Timeframe" value={data.blueprint.timeframe} />
          <InfoCard label="Risk Limit" value={data.blueprint.riskLimit} />
          <InfoCard label="Execution" value={data.blueprint.executionStyle} />
        </div>

        <div className="mt-7 space-y-3">
          {data.workflow.map((step, index) => (
            <article key={step.id} className="rounded-2xl border border-[hsl(var(--card-border))] bg-white/60 p-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[0.72rem] flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <h4 className="text-[0.95rem] text-[hsl(var(--foreground))]">{step.title}</h4>
              </div>
              <p className="mt-2 text-[0.82rem] text-[hsl(var(--muted-foreground))] leading-relaxed">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="story-card p-6 sm:p-8">
        <h4 className="text-[1.05rem] text-[hsl(var(--foreground))]">Top Performing Templates</h4>
        <p className="mt-2 text-[0.84rem] text-[hsl(var(--muted-foreground))]">
          Clone high-performing agent configs, then customize risk and execution before launch.
        </p>

        <div className="mt-5 space-y-3">
          {data.topAgents.map((agent) => (
            <article key={agent.id} className="rounded-2xl border border-[hsl(var(--card-border))] bg-white/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-[0.92rem] text-[hsl(var(--foreground))]">{agent.name}</h5>
                  <p className="text-[0.72rem] text-[hsl(var(--muted-foreground))] mt-1">{agent.creator}</p>
                </div>
                <span className={`text-[0.8rem] font-semibold ${agent.pnlPercent >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {agent.pnlPercent >= 0 ? "+" : ""}{agent.pnlPercent.toFixed(2)}%
                </span>
              </div>
              <p className="mt-2 text-[0.78rem] text-[hsl(var(--muted-foreground))] leading-relaxed">{agent.description.slice(0, 110)}...</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.tags.slice(0, 3).map((tag) => (
                  <span key={`${agent.id}-${tag}`} className="px-2 py-1 rounded-full bg-zinc-200 text-zinc-700 text-[0.58rem] uppercase tracking-[0.08em]">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-white/60 p-4">
      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="mt-2 text-[0.92rem] text-[hsl(var(--foreground))] leading-snug">{value}</p>
    </div>
  );
}
