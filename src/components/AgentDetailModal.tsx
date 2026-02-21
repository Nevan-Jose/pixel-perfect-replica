import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Agent } from "@/lib/mockAgents";

interface Props {
  agent: Agent | null;
  onClose: () => void;
}

const AgentDetailModal = memo(({ agent, onClose }: Props) => {
  if (!agent) return null;

  const isPositive = agent.pnlPercent >= 0;
  const pnlSign = isPositive && agent.pnlPercent > 0 ? "+" : "";

  return (
    <AnimatePresence>
      {agent && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[hsl(var(--background))]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-0 top-[10vh] mx-auto z-50 w-full max-w-[640px] max-h-[80vh] overflow-y-auto border border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] rounded-xl p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-2xl text-[hsl(var(--foreground))] font-semibold"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {agent.name}
                </h2>
                <p className="text-[0.72rem] text-[hsl(var(--muted-foreground))] mt-1">
                  by {agent.creator} · {agent.category}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-[hsl(var(--card-border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:shadow-[0_0_12px_2px_hsla(0,0%,0%,0.15)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            {/* PnL hero */}
            <div className="border border-[hsl(var(--card-border))] rounded-lg p-5 mb-5">
              <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[hsl(var(--muted-foreground))] mb-1">
                TOTAL PNL
              </p>
              <div className="flex items-end gap-3">
                <span
                  className="text-4xl font-semibold text-[hsl(var(--foreground))]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {pnlSign}{agent.pnlPercent.toFixed(2)}%
                </span>
                <span className="text-lg text-[hsl(var(--muted-foreground))] mb-1">
                  ({pnlSign}${agent.pnl.toFixed(2)})
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="border border-[hsl(var(--card-border))] rounded-lg p-5 mb-5">
              <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[hsl(var(--muted-foreground))] mb-2">
                STRATEGY
              </p>
              <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "WIN RATE", value: `${agent.winRate.toFixed(1)}%` },
                { label: "TOTAL TRADES", value: agent.trades.toString() },
                { label: "RUNTIME", value: agent.runtime },
                { label: "VOLUME", value: `$${formatVolume(agent.volume)}` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="border border-[hsl(var(--card-border))] rounded-lg p-4"
                >
                  <p className="text-[0.58rem] tracking-[0.1em] uppercase text-[hsl(var(--muted-foreground))]">
                    {label}
                  </p>
                  <p
                    className="text-xl text-[hsl(var(--foreground))] font-semibold mt-1"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="border border-[hsl(var(--card-border))] rounded-lg p-5 mb-5">
              <p className="text-[0.6rem] tracking-[0.12em] uppercase text-[hsl(var(--muted-foreground))] mb-3">
                MARKETS
              </p>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-[0.7rem] rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional mock stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "AVG TRADE", value: agent.trades > 0 ? `$${(agent.volume / agent.trades).toFixed(0)}` : "$0" },
                { label: "MAX DRAWDOWN", value: agent.pnlPercent < 0 ? `${agent.pnlPercent.toFixed(1)}%` : "-2.1%" },
                { label: "SHARPE RATIO", value: agent.trades > 10 ? ((agent.pnlPercent / 10) + 0.5).toFixed(2) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center border border-[hsl(var(--card-border))] rounded-lg p-3">
                  <p className="text-[0.55rem] tracking-[0.1em] uppercase text-[hsl(var(--muted-foreground))]">{label}</p>
                  <p className="text-sm text-[hsl(var(--foreground))] font-medium mt-1" style={{ fontFamily: "var(--font-body)" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex-1 px-6 py-3 text-[0.72rem] tracking-[0.05em] rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-medium hover:shadow-[0_0_20px_4px_hsla(0,0%,0%,0.2)] transition-all">
                Configure & Launch
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 text-[0.72rem] tracking-[0.05em] rounded-full border border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] hover:shadow-[0_0_12px_2px_hsla(0,0%,0%,0.12)] transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

function formatVolume(v: number): string {
  if (v >= 1000) return (v / 1000).toFixed(2) + "K";
  return v.toFixed(2);
}

AgentDetailModal.displayName = "AgentDetailModal";
export default AgentDetailModal;
