import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { loadAgents, type Agent } from "@/lib/mockAgents";
import AgentCard from "@/components/AgentCard";
import AgentDetailModal from "@/components/AgentDetailModal";

const CreateAgentModal = lazy(() => import("@/components/CreateAgentModal"));

const FILTERS = [
  { label: "All Strategies", value: "all" },
  { label: "Perpetuals", value: "Perpetuals" },
  { label: "Funding Rate", value: "Funding Rate", soon: true },
  { label: "Prediction Markets", value: "Prediction", soon: true },
  { label: "LP Bots", value: "LP Bots", soon: true },
  { label: "Spot Bots", value: "Spot", soon: true },
  { label: "Dropshipping", value: "Dropshipping", soon: true },
];

const SORT_OPTIONS = [
  { label: "Top PnL", value: "pnl" },
  { label: "Most Used", value: "trades" },
  { label: "Newest", value: "newest" },
];

export default function Marketplace() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sort, setSort] = useState("pnl");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    document.body.classList.remove("landing-page");
    document.documentElement.classList.add("marketplace-dark");
    setAgents(loadAgents());
    return () => {
      document.documentElement.classList.remove("marketplace-dark");
    };
  }, []);

  const stats = useMemo(() => {
    const totalVolume = agents.reduce((s, a) => s + a.volume, 0);
    const totalTrades = agents.reduce((s, a) => s + a.trades, 0);
    const strategies = new Set(agents.map((a) => a.category)).size;
    return { totalVolume, totalTrades, strategies };
  }, [agents]);

  const filtered = useMemo(() => {
    let list = agents;
    if (activeFilter !== "all") list = list.filter((a) => a.category === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (sort === "pnl") list = [...list].sort((a, b) => b.pnlPercent - a.pnlPercent);
    else if (sort === "trades") list = [...list].sort((a, b) => b.trades - a.trades);
    else list = [...list].sort((a, b) => (b.id > a.id ? 1 : -1));
    return list;
  }, [agents, activeFilter, search, sort]);

  const handleCreated = (agent: Agent) => {
    setAgents((prev) => [...prev, agent]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen relative z-[2]"
    >
      
      <nav className="sticky top-0 z-20 flex items-center justify-between px-[2.5rem] py-[1.4rem] bg-[hsl(var(--background))] border-b border-[hsl(var(--nav-divider))]">
        <div className="flex items-center gap-8">
          <Link to="/" className="no-underline text-[hsla(var(--nav-text))] tracking-[0.2em] text-[1.4rem]" style={{ fontFamily: "var(--font-logo)" }}>
            Soros
          </Link>
          <div className="flex items-center gap-1">
            {[
              { label: "Marketplace", href: "/marketplace", active: true },
              { label: "My Agents", href: "#" },
              { label: "Analytics", href: "#" },
              { label: "Docs", href: "#" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`px-4 py-1.5 text-[0.72rem] tracking-[0.05em] no-underline rounded-full transition-colors duration-200 ${
                  item.active
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-medium"
                    : "text-[hsla(var(--nav-link))] hover:text-[hsla(var(--nav-link-hover))]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/create-agent"
            className="px-5 py-2 text-[0.72rem] tracking-[0.08em] rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-medium hover:shadow-[0_0_16px_4px_hsla(0,0%,0%,0.2)] transition-all no-underline"
          >
            Create Agent
          </Link>
          <button className="px-5 py-2 text-[0.72rem] tracking-[0.08em] rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] hover:shadow-[0_0_12px_2px_hsla(0,0%,0%,0.12)] hover:bg-[hsl(var(--chip-bg))] transition-all">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="px-[2.5rem] py-8 max-w-[1440px] mx-auto">
        {/* Header + Stats */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[2.2rem] text-[hsl(var(--foreground))] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Agent Marketplace
            </h1>
            <p className="text-[0.85rem] text-[hsl(var(--muted-foreground))] mt-2">
              Browse, configure, and launch autonomous trading agents on Hyperliquid.
            </p>
          </div>
          <div className="flex items-end gap-12 text-right">
            {[
              { value: `$${(stats.totalVolume / 1000).toFixed(2)}K`, label: "TOTAL VOLUME", highlight: true },
              { value: stats.totalTrades.toString(), label: "TOTAL TRADES" },
              { value: stats.strategies.toString(), label: "STRATEGIES" },
            ].map(({ value, label, highlight }) => (
              <div key={label}>
                <p className={`text-2xl font-semibold ${highlight ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--stat-value))]"}`} style={{ fontFamily: "var(--font-body)" }}>
                  {value}
                </p>
                <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[hsl(var(--stat-label))] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => !f.soon && setActiveFilter(f.value)}
              className={`px-4 py-2 text-[0.72rem] rounded-full border transition-all duration-200 flex items-center gap-2 ${
                activeFilter === f.value
                  ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-transparent font-medium"
                  : "border-[hsl(var(--card-border))] text-[hsl(var(--chip-text))] hover:text-[hsl(var(--foreground))]"
              } ${f.soon ? "opacity-60 cursor-default" : "cursor-pointer"}`}
            >
              {f.label}
              {f.soon && <span className="text-[0.55rem] px-1.5 py-0.5 rounded bg-[hsl(var(--chip-bg))] text-[hsl(var(--muted-foreground))]">soon</span>}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-full text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--card-border-hover))]"
            />
          </div>
          <div className="flex items-center gap-2">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`px-3 py-1.5 text-[0.68rem] rounded-full transition-colors ${
                  sort === s.value
                    ? "bg-[hsl(var(--chip-bg))] text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
            <p className="text-lg">No agents found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />

      {/* Create Agent Modal */}
      <Suspense fallback={null}>
        <CreateAgentModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      </Suspense>
    </motion.div>
  );
}
