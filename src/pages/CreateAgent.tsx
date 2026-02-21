import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { saveAgent, type Agent } from "@/lib/mockAgents";
import { toast } from "@/hooks/use-toast";

/* ── Data ── */
const STEPS = ["Strategy", "Name", "Markets", "Simulate", "Connect", "Review"] as const;

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
const inputClass = "w-full px-4 py-3.5 bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] text-sm focus:outline-none focus:border-[hsl(var(--card-border-hover))] transition-colors";

const stepAnim = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
};

/* ── Main page ── */
export default function CreateAgent() {
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

  const filteredMarkets = MARKETS.filter((m) => {
    if (marketSearch.trim()) {
      const q = marketSearch.toLowerCase();
      if (!m.symbol.toLowerCase().includes(q) && !m.pair.toLowerCase().includes(q)) return false;
    }
    if (levFilter === "All") return true;
    const filterVal = parseInt(levFilter.replace(/[^0-9]/g, ""));
    return levValue(m.maxLev) >= filterVal;
  });

  const handleCreate = () => {
    const agent: Agent = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: strategy.trim(),
      pnl: 0,
      pnlPercent: 0,
      tags: selectedMarkets.slice(0, 4),
      winRate: 0,
      trades: 0,
      runtime: "0d",
      volume: 0,
      category: "Perpetuals",
      creator: "you.eth",
    };
    saveAgent(agent);
    toast({ title: "Agent Created", description: `${agent.name} is now live.` });
    navigate("/marketplace");
  };

  const runSim = () => {
    setSimRunning(true);
    setTimeout(() => { setSimRunning(false); next(); }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative z-[2]"
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-[2.5rem] py-[1.4rem] bg-[hsl(var(--background))]/80 backdrop-blur-md border-b border-[hsl(var(--nav-divider))]">
        <div className="flex items-center gap-8">
          <Link to="/" className="no-underline text-[hsla(var(--nav-text))] tracking-[0.2em] text-[1.4rem]" style={{ fontFamily: "var(--font-logo)" }}>
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
          <Link
            to="/create-agent"
            className="px-5 py-2 text-[0.72rem] tracking-[0.08em] rounded-full bg-xade-green text-[hsl(var(--background))] font-medium no-underline"
          >
            Create Agent
          </Link>
          <button className="px-5 py-2 text-[0.72rem] tracking-[0.08em] rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--chip-bg))] transition-colors">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-6 pt-16 pb-32">
        <AnimatePresence mode="wait">
          {/* ── Step 0: Strategy ── */}
          {step === 0 && (
            <motion.div key="strategy" {...stepAnim} className="flex flex-col items-center">
              <h1 className="text-[2.2rem] text-[hsl(var(--foreground))] text-center" style={{ fontFamily: "var(--font-display)" }}>
                Create Agent
              </h1>
              <p className="text-[0.85rem] text-[hsl(var(--muted-foreground))] mt-3 text-center">
                Describe your trading strategy in <span className="text-xade-green">natural language</span>.
                <br />And watch it come to life.
              </p>

              <p className={`${labelClass} mt-10 mb-4`}>TRY ONE OF THESE</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {EXAMPLE_STRATEGIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrategy(s)}
                    className={`text-left p-4 rounded-lg border transition-all text-[0.78rem] leading-relaxed ${
                      strategy === s
                        ? "border-xade-green bg-[hsl(var(--chip-bg))] text-[hsl(var(--foreground))]"
                        : "border-[hsl(var(--card-border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--card-border-hover))] hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input bar */}
              <div className="w-full mt-12 relative">
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="Describe your trading strategy..."
                  rows={1}
                  className={`${inputClass} pr-14 resize-none`}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); next(); } }}
                />
                <button
                  onClick={next}
                  disabled={!canNext()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] flex items-center justify-center text-[hsl(var(--foreground))] disabled:opacity-30 hover:bg-[hsl(var(--card-border))] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12V4M8 4L4 8M8 4l4 4"/></svg>
                </button>
              </div>
              <p className="text-[0.65rem] text-[hsl(var(--muted-foreground))] mt-2">Press Enter to send · Shift+Enter for new line</p>
            </motion.div>
          )}

          {/* ── Step 1: Name ── */}
          {step === 1 && (
            <motion.div key="name" {...stepAnim}>
              <div className={`${cardClass} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-xade-green" />
                      <div className="w-2.5 h-2.5 rounded-full bg-xade-green" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--card-border))]" />
                    </div>
                    <span className="text-[0.78rem] text-[hsl(var(--muted-foreground))] ml-2">Name Your Agent</span>
                  </div>
                  <span className="text-[0.7rem] text-xade-green">● Step 2 of 6</span>
                </div>

                {/* Strategy preview */}
                <div className="border border-[hsl(var(--card-border))] rounded-lg p-4 mb-6">
                  <p className={labelClass}>YOUR STRATEGY</p>
                  <p className="text-sm text-[hsl(var(--foreground))] mt-1">{strategy}</p>
                </div>

                <h2 className="text-xl text-[hsl(var(--foreground))] font-semibold" style={{ fontFamily: "var(--font-body)" }}>Give your agent a name</h2>
                <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mt-1 mb-4">This is how your agent will appear in the marketplace</p>

                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Alpha Momentum Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
                <p className="text-[0.65rem] text-[hsl(var(--muted-foreground))] mt-1.5">{name.length}/50 characters</p>

                {/* List toggle */}
                <div className="flex items-center justify-between border border-[hsl(var(--card-border))] rounded-lg p-4 mt-5">
                  <div>
                    <p className="text-sm text-[hsl(var(--foreground))]">List on Marketplace</p>
                    <p className="text-[0.72rem] text-[hsl(var(--muted-foreground))]">
                      {listPublic ? "Your agent will be visible to everyone" : "Your agent will be private — only you can see it"}
                    </p>
                  </div>
                  <button
                    onClick={() => setListPublic(!listPublic)}
                    className={`w-12 h-7 rounded-full relative transition-colors ${listPublic ? "bg-xade-green" : "bg-[hsl(var(--chip-bg))]"}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-[hsl(var(--foreground))] transition-all ${listPublic ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Markets ── */}
          {step === 2 && (
            <motion.div key="markets" {...stepAnim}>
              <div className={`${cardClass} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-xade-green" />
                      <div className="w-2.5 h-2.5 rounded-full bg-xade-green" />
                      <div className="w-2.5 h-2.5 rounded-full bg-xade-green" />
                    </div>
                    <span className="text-[0.78rem] text-[hsl(var(--muted-foreground))] ml-2">Select Markets</span>
                  </div>
                  <span className="text-[0.7rem] text-xade-green">● Hyperliquid</span>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl text-[hsl(var(--foreground))] font-semibold" style={{ fontFamily: "var(--font-body)" }}>Choose your markets</h2>
                    <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mt-1">Select the assets your agent will trade on Hyperliquid.</p>
                  </div>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                      type="text"
                      className="pl-9 pr-4 py-2.5 text-sm bg-[hsl(var(--chip-bg))] border border-[hsl(var(--card-border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none w-48"
                      placeholder="Search markets..."
                      value={marketSearch}
                      onChange={(e) => setMarketSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Leverage filter */}
                <div className="flex items-center gap-2 mb-4">
                  {LEV_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setLevFilter(f)}
                      className={`px-3 py-1.5 text-[0.7rem] rounded-full border transition-colors ${
                        levFilter === f
                          ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-transparent"
                          : "border-[hsl(var(--card-border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                  <span className="ml-auto text-[0.68rem] text-[hsl(var(--muted-foreground))]">{filteredMarkets.length} markets</span>
                </div>

                {/* Market grid */}
                <div className="grid grid-cols-5 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
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
                        <p className="text-[0.6rem] text-[hsl(var(--muted-foreground))]">{m.pair}</p>
                        {m.maxLev && (
                          <span className={`inline-block mt-1.5 text-[0.58rem] px-2 py-0.5 rounded border border-current ${levColor}`}>
                            {m.maxLev} max
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Simulate ── */}
          {step === 3 && (
            <motion.div key="simulate" {...stepAnim}>
              <div className={`${cardClass} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {[0,1,2,3].map((i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-xade-green" />)}
                      <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--card-border))]" />
                    </div>
                    <span className="text-[0.78rem] text-[hsl(var(--muted-foreground))] ml-2">Simulate Strategy</span>
                  </div>
                  <span className="text-[0.7rem] text-xade-green">● Step 4 of 6</span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--chip-bg))] flex items-center justify-center text-[hsl(var(--foreground))]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m7 16 4-8 4 4 6-6"/></svg>
                  </div>
                  <h2 className="text-xl text-[hsl(var(--foreground))] font-semibold" style={{ fontFamily: "var(--font-body)" }}>Test your strategy</h2>
                  <span className="ml-auto text-[0.65rem] px-3 py-1 rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--muted-foreground))]">● SIMULATION</span>
                </div>
                <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mb-6">Validate against historical data before going live</p>

                {/* Strategy + Markets summary */}
                <div className="border border-[hsl(var(--card-border))] rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <p className={labelClass}>STRATEGY</p>
                    <button onClick={() => setStep(0)} className="text-[0.68rem] text-xade-green hover:underline flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z"/></svg>
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-[hsl(var(--foreground))] mt-1">{strategy}</p>
                </div>
                <div className="border border-[hsl(var(--card-border))] rounded-lg p-4 mb-6">
                  <p className={labelClass}>MARKETS</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedMarkets.map((m) => (
                      <span key={m} className="px-3 py-1 text-[0.7rem] rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))]">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Backtest params */}
                <p className={`${labelClass} mb-3`}>BACKTEST PARAMETERS</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-[hsl(var(--card-border))] rounded-lg p-3">
                    <p className="text-[0.6rem] text-xade-green tracking-[0.1em] uppercase mb-1">FROM</p>
                    <input type="date" className="bg-transparent text-sm text-[hsl(var(--foreground))] w-full focus:outline-none" value={simFrom} onChange={(e) => setSimFrom(e.target.value)} />
                  </div>
                  <div className="border border-[hsl(var(--card-border))] rounded-lg p-3">
                    <p className="text-[0.6rem] text-xade-green tracking-[0.1em] uppercase mb-1">TO</p>
                    <input type="date" className="bg-transparent text-sm text-[hsl(var(--foreground))] w-full focus:outline-none" value={simTo} onChange={(e) => setSimTo(e.target.value)} />
                  </div>
                  <div className="border border-[hsl(var(--card-border))] rounded-lg p-3">
                    <p className="text-[0.6rem] text-xade-green tracking-[0.1em] uppercase mb-1">CAPITAL</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">$</span>
                      <input type="number" className="bg-transparent text-sm text-[hsl(var(--foreground))] w-full focus:outline-none" value={simCapital} onChange={(e) => setSimCapital(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Connect ── */}
          {step === 4 && (
            <motion.div key="connect" {...stepAnim}>
              <div className={`${cardClass} p-6 text-center`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {[0,1,2,3,4].map((i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-xade-green" />)}
                      <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--card-border))]" />
                    </div>
                    <span className="text-[0.78rem] text-[hsl(var(--muted-foreground))] ml-2">Connect Wallet</span>
                  </div>
                  <span className="text-[0.7rem] text-xade-green">● Step 5 of 6</span>
                </div>
                <div className="py-12">
                  <h2 className="text-xl text-[hsl(var(--foreground))] font-semibold mb-2" style={{ fontFamily: "var(--font-body)" }}>Connect your wallet</h2>
                  <p className="text-[0.78rem] text-[hsl(var(--muted-foreground))] mb-8">Link your Hyperliquid wallet to fund and control your agent.</p>
                  <button className="px-8 py-3 rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] text-[0.78rem] hover:bg-[hsl(var(--chip-bg))] transition-colors">
                    Connect Wallet
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Review ── */}
          {step === 5 && (
            <motion.div key="review" {...stepAnim}>
              <div className={`${cardClass} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {STEPS.map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-xade-green" />)}
                    </div>
                    <span className="text-[0.78rem] text-[hsl(var(--muted-foreground))] ml-2">Review & Deploy</span>
                  </div>
                  <span className="text-[0.7rem] text-xade-green">● Step 6 of 6</span>
                </div>

                <h2 className="text-xl text-[hsl(var(--foreground))] font-semibold mb-6" style={{ fontFamily: "var(--font-body)" }}>Review your agent</h2>

                {[
                  { label: "NAME", value: name },
                  { label: "STRATEGY", value: strategy },
                  { label: "MARKETS", value: selectedMarkets.join(", ") },
                  { label: "VISIBILITY", value: listPublic ? "Public" : "Private" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-[hsl(var(--card-border))] rounded-lg p-4 mb-3">
                    <p className={labelClass}>{label}</p>
                    <p className="text-sm text-[hsl(var(--foreground))] mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom nav ── */}
        {step > 0 && (
          <div className="flex items-center justify-between mt-8">
            <button onClick={back} className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] text-[0.78rem] hover:bg-[hsl(var(--chip-bg))] transition-colors">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8H4M4 8l4-4M4 8l4 4"/></svg>
              Back
            </button>

            {step === 3 && (
              <button onClick={() => setStep(step + 1)} className="text-[0.72rem] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                Skip
              </button>
            )}

            {step === 3 ? (
              <button
                onClick={runSim}
                disabled={simRunning}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-xade-green text-[hsl(var(--background))] text-[0.78rem] font-medium hover:brightness-110 transition-all disabled:opacity-60"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6V2z"/></svg>
                {simRunning ? "Running..." : "Run Simulation"}
              </button>
            ) : step === 5 ? (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-xade-green text-[hsl(var(--background))] text-[0.78rem] font-medium hover:brightness-110 transition-all"
              >
                Deploy Agent
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12L12 4M12 4H6M12 4V10"/></svg>
              </button>
            ) : (
              <button
                onClick={next}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] text-[0.78rem] hover:bg-[hsl(var(--chip-bg))] transition-colors disabled:opacity-40"
              >
                Continue
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h8M12 8l-4-4M12 8l-4 4"/></svg>
              </button>
            )}
          </div>
        )}

        {/* ── Step indicators ── */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-1 rounded-full ${i <= step ? "bg-xade-green" : "bg-[hsl(var(--card-border))]"}`} />
              <span className={`text-[0.58rem] tracking-[0.05em] ${i <= step ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
