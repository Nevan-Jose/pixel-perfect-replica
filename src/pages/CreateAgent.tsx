import { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { saveAgent, type Agent } from "@/lib/mockAgents";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

/* ── Data ── */
const STEPS = ["Strategy", "Name", "Markets", "Simulate", "Connect", "Review"] as const;

const STEP_ICONS = [
  // Strategy
  <svg key="s" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  // Name
  <svg key="n" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  // Markets
  <svg key="m" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  // Simulate
  <svg key="si" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m7 16 4-8 4 4 6-6"/></svg>,
  // Connect
  <svg key="c" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  // Review
  <svg key="r" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
];

const EXAMPLE_STRATEGIES = [
  "Long BTC and ETH on RSI oversold bounces with 3x leverage, 2% stop loss",
  "Trend-follow SOL using 20/50 EMA crossovers, scale in on pullbacks to the fast EMA",
  "Mean-revert DOGE and WIF when price deviates 2σ from VWAP, close at mean",
  "Momentum snipe new Hyperliquid listings within first hour, trail stop at 5%",
];

const MARKETS = [
  { symbol: "BTC", pair: "BTC-PERP", maxLev: "40x" },
  { symbol: "ETH", pair: "ETH-PERP", maxLev: "25x" },
  { symbol: "ATOM", pair: "ATOM-PERP", maxLev: "5x" },
  { symbol: "DYDX", pair: "DYDX-PERP", maxLev: "5x" },
  { symbol: "SOL", pair: "SOL-PERP", maxLev: "20x" },
  { symbol: "AVAX", pair: "AVAX-PERP", maxLev: "10x" },
  { symbol: "BNB", pair: "BNB-PERP", maxLev: "10x" },
  { symbol: "APE", pair: "APE-PERP", maxLev: "5x" },
  { symbol: "OP", pair: "OP-PERP", maxLev: "10x" },
  { symbol: "LTC", pair: "LTC-PERP", maxLev: "10x" },
  { symbol: "ARB", pair: "ARB-PERP", maxLev: "10x" },
  { symbol: "DOGE", pair: "DOGE-PERP", maxLev: "10x" },
  { symbol: "INJ", pair: "INJ-PERP", maxLev: "10x" },
  { symbol: "SUI", pair: "SUI-PERP", maxLev: "10x" },
  { symbol: "kPEPE", pair: "kPEPE-PERP", maxLev: "10x" },
  { symbol: "CRV", pair: "CRV-PERP", maxLev: "5x" },
  { symbol: "LDO", pair: "LDO-PERP", maxLev: "5x" },
  { symbol: "LINK", pair: "LINK-PERP", maxLev: "10x" },
  { symbol: "STX", pair: "STX-PERP", maxLev: "5x" },
  { symbol: "CFX", pair: "CFX-PERP", maxLev: "5x" },
];

const LEV_FILTERS = ["All", "40x", "20x+", "10x+", "5x+", "3x"];
const levValue = (s: string) => parseInt(s.replace("x", "")) || 0;

/* ── Shared styles ── */
const cardClass = "bg-[hsl(var(--card-bg))] border border-[hsl(var(--card-border))] rounded-xl";
const labelClass = "text-[0.65rem] tracking-[0.1em] uppercase text-[hsl(var(--muted-foreground))]";
const inputClass = "w-full px-4 py-3 bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] text-sm focus:outline-none focus:border-[hsl(var(--card-border-hover))] transition-colors";

const stepAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
};

/* ── Preview Panel ── */
function AgentPreview({ strategy, name, selectedMarkets, listPublic, step }: {
  strategy: string; name: string; selectedMarkets: string[]; listPublic: boolean; step: number;
}) {
  const rows = [
    { label: "Name", value: name || "—" },
    { label: "Strategy", value: strategy ? (strategy.length > 120 ? strategy.slice(0, 120) + "…" : strategy) : "—" },
    { label: "Assets", value: selectedMarkets.length > 0 ? selectedMarkets.join(", ") : "Not defined" },
    { label: "Visibility", value: listPublic ? "Public" : "Private" },
    { label: "Risk", value: "Not defined" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className={labelClass}>AGENT PREVIEW</p>
        <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-[hsl(var(--chip-bg))] text-[hsl(var(--muted-foreground))]">
          Draft
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {rows.map(({ label, value }) => (
          <div key={label} className="border border-[hsl(var(--card-border))] rounded-lg p-3">
            <p className="text-[0.6rem] tracking-[0.1em] uppercase text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
            <p className={`text-[0.78rem] ${value === "—" || value === "Not defined" ? "text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--foreground))]"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[hsl(var(--card-border))]">
        <p className="text-[0.6rem] tracking-[0.1em] uppercase text-[hsl(var(--muted-foreground))] mb-1.5">STATUS</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${step >= 5 ? "bg-xade-green" : "bg-[hsl(var(--muted-foreground))]"}`} />
          <span className="text-[0.75rem] text-[hsl(var(--foreground))]">
            {step >= 5 ? "Ready to deploy" : `Step ${step + 1} of ${STEPS.length}`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function CreateAgent() {
  useEffect(() => {
    document.body.classList.remove("landing-page");
    document.documentElement.classList.add("marketplace-dark");
    return () => {
      document.documentElement.classList.remove("marketplace-dark");
    };
  }, []);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [strategy, setStrategy] = useState("");
  const [name, setName] = useState("");
  const [listPublic, setListPublic] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [marketSearch, setMarketSearch] = useState("");
  const [levFilter, setLevFilter] = useState("All");
  const [simFrom, setSimFrom] = useState("2025-11-22");
  const [simTo, setSimTo] = useState("2026-02-20");
  const [simCapital, setSimCapital] = useState("10000");
  const [simRunning, setSimRunning] = useState(false);

  const canNext = useCallback(() => {
    if (step === 0) return strategy.trim().length > 0;
    if (step === 1) return name.trim().length > 0 && name.length <= 50;
    if (step === 2) return selectedMarkets.length > 0;
    return true;
  }, [step, strategy, name, selectedMarkets]);

  const next = () => { if (canNext() && step < STEPS.length - 1) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); };

  const toggleMarket = (sym: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(sym) ? prev.filter((m) => m !== sym) : [...prev, sym]
    );
  };

  const filteredMarkets = useMemo(() => MARKETS.filter((m) => {
    if (marketSearch.trim()) {
      const q = marketSearch.toLowerCase();
      if (!m.symbol.toLowerCase().includes(q) && !m.pair.toLowerCase().includes(q)) return false;
    }
    if (levFilter === "All") return true;
    const filterVal = parseInt(levFilter.replace(/[^0-9]/g, ""));
    return levValue(m.maxLev) >= filterVal;
  }), [marketSearch, levFilter]);

  const handleCreate = () => {
    const agent: Agent = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: strategy.trim(),
      pnl: 0, pnlPercent: 0,
      tags: selectedMarkets.slice(0, 4),
      winRate: 0, trades: 0, runtime: "0d", volume: 0,
      category: "Perpetuals", creator: "you.eth",
    };
    saveAgent(agent);
    toast({ title: "Agent Created", description: `${agent.name} is now live.` });
    navigate("/marketplace");
  };

  const runSim = () => {
    setSimRunning(true);
    setTimeout(() => { setSimRunning(false); next(); }, 2000);
  };

  const isStepComplete = (i: number) => {
    if (i === 0) return strategy.trim().length > 0 && step > 0;
    if (i === 1) return name.trim().length > 0 && step > 1;
    if (i === 2) return selectedMarkets.length > 0 && step > 2;
    return step > i;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="h-screen flex flex-col relative z-[2]"
    >
      {/* Navbar */}
      <nav className="flex-shrink-0 flex items-center justify-between px-[2rem] py-[1rem] bg-[hsl(var(--background))]/80 backdrop-blur-md border-b border-[hsl(var(--nav-divider))]">
        <div className="flex items-center gap-8">
          <Link to="/" className="no-underline text-[hsla(var(--nav-text))] tracking-[0.2em] text-[1.3rem]" style={{ fontFamily: "var(--font-logo)" }}>
            Soros
          </Link>
          <div className="flex items-center gap-1">
            {["Marketplace", "My Agents", "Analytics", "Docs"].map((label) => (
              <Link
                key={label}
                to={label === "Marketplace" ? "/marketplace" : "#"}
                className="px-4 py-1.5 text-[0.72rem] tracking-[0.05em] no-underline rounded-full text-[hsla(var(--nav-link))] hover:text-[hsla(var(--nav-link-hover))] transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.68rem] text-[hsl(var(--muted-foreground))] mr-2">Create Agent</span>
          <button className="px-5 py-2 text-[0.72rem] tracking-[0.08em] rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--chip-bg))] transition-colors">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Step navigation sidebar */}
        <aside className="w-[200px] flex-shrink-0 border-r border-[hsl(var(--card-border))] bg-[hsl(var(--background))] p-4 flex flex-col">
          <p className={`${labelClass} mb-4 px-2`}>STEPS</p>
          <div className="flex flex-col gap-0.5 flex-1">
            {STEPS.map((s, i) => {
              const active = i === step;
              const complete = isStepComplete(i);
              return (
                <button
                  key={s}
                  onClick={() => {
                    // Allow navigating to completed steps or current step
                    if (i <= step || complete) setStep(i);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[0.75rem] transition-all ${
                    active
                      ? "bg-[hsl(var(--chip-bg))] text-[hsl(var(--foreground))] font-medium"
                      : i <= step
                        ? "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--chip-bg))]/50"
                        : "text-[hsl(var(--muted-foreground))] cursor-default opacity-50"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    complete
                      ? "bg-xade-green text-[hsl(var(--background))]"
                      : active
                        ? "border-2 border-xade-green text-xade-green"
                        : "border border-[hsl(var(--card-border))] text-[hsl(var(--muted-foreground))]"
                  }`}>
                    {complete ? <Check className="w-3 h-3" /> : STEP_ICONS[i]}
                  </span>
                  {s}
                </button>
              );
            })}
          </div>

          {/* Bottom nav buttons in sidebar */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[hsl(var(--card-border))]">
            {step > 0 && (
              <button onClick={back} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] text-[0.72rem] hover:bg-[hsl(var(--chip-bg))] transition-colors">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8H4M4 8l4-4M4 8l4 4"/></svg>
                Back
              </button>
            )}
            {step === 3 ? (
              <>
                <button onClick={() => setStep(step + 1)} className="text-[0.68rem] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors py-1">
                  Skip simulation
                </button>
                <button
                  onClick={runSim}
                  disabled={simRunning}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-xade-green text-[hsl(var(--background))] text-[0.72rem] font-medium hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {simRunning ? "Running..." : "Run Simulation"}
                </button>
              </>
            ) : step === 5 ? (
              <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-xade-green text-[hsl(var(--background))] text-[0.72rem] font-medium hover:brightness-110 transition-all"
              >
                Deploy Agent
              </button>
            ) : (
              <button
                onClick={next}
                disabled={!canNext()}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-xade-green text-[hsl(var(--background))] text-[0.72rem] font-medium hover:brightness-110 transition-all disabled:opacity-30"
              >
                Continue
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h8M12 8l-4-4M12 8l-4 4"/></svg>
              </button>
            )}
          </div>
        </aside>

        {/* CENTER: Main workspace */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[640px] mx-auto">
            <AnimatePresence mode="wait">
              {/* ── Step 0: Strategy ── */}
              {step === 0 && (
                <motion.div key="strategy" {...stepAnim}>
                  <p className={`${labelClass} mb-2`}>STEP 1 — DEFINE STRATEGY</p>
                  <h2 className="text-lg text-[hsl(var(--foreground))] font-medium mb-1" style={{ fontFamily: "var(--font-body)" }}>
                    Describe your trading strategy
                  </h2>
                  <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mb-6">
                    Use <span className="text-xade-green">natural language</span> to define how your agent should trade.
                  </p>

                  {/* Input bar */}
                  <div className="relative mb-6">
                    <textarea
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      placeholder="Describe your trading strategy..."
                      rows={3}
                      className={`${inputClass} pr-14 resize-none`}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); next(); } }}
                    />
                    <button
                      onClick={next}
                      disabled={!canNext()}
                      className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] flex items-center justify-center text-[hsl(var(--foreground))] disabled:opacity-30 hover:bg-[hsl(var(--card-border))] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12V4M8 4L4 8M8 4l4 4"/></svg>
                    </button>
                  </div>

                  <p className={`${labelClass} mb-3`}>OR TRY AN EXAMPLE</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXAMPLE_STRATEGIES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStrategy(s)}
                        className={`text-left p-3 rounded-lg border transition-all text-[0.75rem] leading-relaxed ${
                          strategy === s
                            ? "border-xade-green bg-[hsl(var(--chip-bg))] text-[hsl(var(--foreground))]"
                            : "border-[hsl(var(--card-border))] bg-[hsl(var(--chip-bg))]/50 text-[hsl(var(--foreground))]/75 hover:border-[hsl(var(--card-border-hover))] hover:text-[hsl(var(--foreground))]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Name ── */}
              {step === 1 && (
                <motion.div key="name" {...stepAnim}>
                  <p className={`${labelClass} mb-2`}>STEP 2 — NAME YOUR AGENT</p>
                  <h2 className="text-lg text-[hsl(var(--foreground))] font-medium mb-1" style={{ fontFamily: "var(--font-body)" }}>Give your agent a name</h2>
                  <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mb-5">This is how it appears in the marketplace.</p>

                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Alpha Momentum Bot"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-[0.6rem] text-[hsl(var(--muted-foreground))] mt-1.5 mb-5">{name.length}/50 characters</p>

                  {/* List toggle */}
                  <div className="flex items-center justify-between border border-[hsl(var(--card-border))] rounded-lg p-4">
                    <div>
                      <p className="text-sm text-[hsl(var(--foreground))]">List on Marketplace</p>
                      <p className="text-[0.72rem] text-[hsl(var(--muted-foreground))]">
                        {listPublic ? "Visible to everyone" : "Only you can see it"}
                      </p>
                    </div>
                    <button
                      onClick={() => setListPublic(!listPublic)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${listPublic ? "bg-xade-green" : "bg-[hsl(var(--chip-bg))]"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[hsl(var(--foreground))] transition-all ${listPublic ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Markets ── */}
              {step === 2 && (
                <motion.div key="markets" {...stepAnim}>
                  <p className={`${labelClass} mb-2`}>STEP 3 — SELECT MARKETS</p>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg text-[hsl(var(--foreground))] font-medium" style={{ fontFamily: "var(--font-body)" }}>Choose your markets</h2>
                      <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mt-1">Select assets your agent will trade on Hyperliquid.</p>
                    </div>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <input
                        type="text"
                        className="pl-9 pr-4 py-2 text-sm bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none w-44"
                        placeholder="Search..."
                        value={marketSearch}
                        onChange={(e) => setMarketSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Leverage filter */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {LEV_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setLevFilter(f)}
                        className={`px-3 py-1 text-[0.68rem] rounded-full border transition-colors ${
                          levFilter === f
                            ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-transparent"
                            : "border-[hsl(var(--card-border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                    <span className="ml-auto text-[0.65rem] text-[hsl(var(--muted-foreground))]">{filteredMarkets.length} markets</span>
                  </div>

                  {/* Market grid */}
                  <div className="grid grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {filteredMarkets.map((m) => {
                      const sel = selectedMarkets.includes(m.symbol);
                      const levColor =
                        levValue(m.maxLev) >= 40 ? "text-[#F7931A]" :
                        levValue(m.maxLev) >= 20 ? "text-xade-green" :
                        levValue(m.maxLev) >= 10 ? "text-[#627EEA]" :
                        "text-[#8247E5]";
                      return (
                        <button
                          key={m.symbol}
                          onClick={() => toggleMarket(m.symbol)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            sel
                              ? "border-xade-green bg-[hsla(145,63%,49%,0.08)]"
                              : "border-[hsl(var(--card-border))] hover:border-[hsl(var(--card-border-hover))]"
                          }`}
                        >
                          <p className="text-sm text-[hsl(var(--foreground))] font-medium">{m.symbol}</p>
                          <p className="text-[0.58rem] text-[hsl(var(--muted-foreground))]">{m.pair}</p>
                          <span className={`inline-block mt-1 text-[0.55rem] px-2 py-0.5 rounded border border-current ${levColor}`}>
                            {m.maxLev} max
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Simulate ── */}
              {step === 3 && (
                <motion.div key="simulate" {...stepAnim}>
                  <p className={`${labelClass} mb-2`}>STEP 4 — SIMULATE</p>
                  <h2 className="text-lg text-[hsl(var(--foreground))] font-medium mb-1" style={{ fontFamily: "var(--font-body)" }}>Test your strategy</h2>
                  <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mb-5">Validate against historical data before going live.</p>

                  {/* Strategy + Markets summary */}
                  <div className="border border-[hsl(var(--card-border))] rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between">
                      <p className={labelClass}>STRATEGY</p>
                      <button onClick={() => setStep(0)} className="text-[0.65rem] text-xade-green hover:underline">Edit</button>
                    </div>
                    <p className="text-[0.78rem] text-[hsl(var(--foreground))] mt-1">{strategy}</p>
                  </div>
                  <div className="border border-[hsl(var(--card-border))] rounded-lg p-3 mb-5">
                    <p className={labelClass}>MARKETS</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {selectedMarkets.map((m) => (
                        <span key={m} className="px-2 py-0.5 text-[0.65rem] rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))]">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Backtest params */}
                  <p className={`${labelClass} mb-2`}>BACKTEST PARAMETERS</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-[hsl(var(--card-border))] rounded-lg p-3">
                      <p className="text-[0.58rem] text-xade-green tracking-[0.1em] uppercase mb-1">FROM</p>
                      <input type="date" className="bg-transparent text-sm text-[hsl(var(--foreground))] w-full focus:outline-none" value={simFrom} onChange={(e) => setSimFrom(e.target.value)} />
                    </div>
                    <div className="border border-[hsl(var(--card-border))] rounded-lg p-3">
                      <p className="text-[0.58rem] text-xade-green tracking-[0.1em] uppercase mb-1">TO</p>
                      <input type="date" className="bg-transparent text-sm text-[hsl(var(--foreground))] w-full focus:outline-none" value={simTo} onChange={(e) => setSimTo(e.target.value)} />
                    </div>
                    <div className="border border-[hsl(var(--card-border))] rounded-lg p-3">
                      <p className="text-[0.58rem] text-xade-green tracking-[0.1em] uppercase mb-1">CAPITAL</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">$</span>
                        <input type="number" className="bg-transparent text-sm text-[hsl(var(--foreground))] w-full focus:outline-none" value={simCapital} onChange={(e) => setSimCapital(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Connect ── */}
              {step === 4 && (
                <motion.div key="connect" {...stepAnim}>
                  <p className={`${labelClass} mb-2`}>STEP 5 — CONNECT</p>
                  <h2 className="text-lg text-[hsl(var(--foreground))] font-medium mb-1" style={{ fontFamily: "var(--font-body)" }}>Connect your wallet</h2>
                  <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mb-8">Link your Hyperliquid wallet to fund and control your agent.</p>
                  <div className="flex justify-center">
                    <button className="px-8 py-3 rounded-lg border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] text-[0.78rem] hover:bg-[hsl(var(--chip-bg))] transition-colors">
                      Connect Wallet
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 5: Review ── */}
              {step === 5 && (
                <motion.div key="review" {...stepAnim}>
                  <p className={`${labelClass} mb-2`}>STEP 6 — REVIEW & DEPLOY</p>
                  <h2 className="text-lg text-[hsl(var(--foreground))] font-medium mb-5" style={{ fontFamily: "var(--font-body)" }}>Review your agent</h2>

                  {[
                    { label: "NAME", value: name },
                    { label: "STRATEGY", value: strategy },
                    { label: "MARKETS", value: selectedMarkets.join(", ") },
                    { label: "VISIBILITY", value: listPublic ? "Public" : "Private" },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-[hsl(var(--card-border))] rounded-lg p-3 mb-2">
                      <p className={labelClass}>{label}</p>
                      <p className="text-[0.78rem] text-[hsl(var(--foreground))] mt-1">{value}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* RIGHT: Agent preview panel */}
        <aside className="w-[240px] flex-shrink-0 border-l border-[hsl(var(--card-border))] bg-[hsl(var(--background))] p-4 overflow-y-auto">
          <AgentPreview
            strategy={strategy}
            name={name}
            selectedMarkets={selectedMarkets}
            listPublic={listPublic}
            step={step}
          />
        </aside>
      </div>
    </motion.div>
  );
}
