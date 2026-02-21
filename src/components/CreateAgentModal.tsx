import { memo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { saveAgent, type Agent } from "@/lib/mockAgents";

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (agent: Agent) => void;
}

const STRATEGY_TYPES = ["Scalping", "Momentum", "Mean Reversion", "Grid Trading", "DCA", "Arbitrage", "Trend Following"];
const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];
const RISK_LEVELS = ["Low", "Medium", "High", "Aggressive"];
const CATEGORIES = ["Perpetuals", "Spot", "Funding Rate", "Prediction", "LP Bots"];

const CreateAgentModal = memo(({ open, onClose, onCreated }: CreateAgentModalProps) => {
  const [form, setForm] = useState({
    name: "",
    markets: "",
    strategy: STRATEGY_TYPES[0],
    timeframe: TIMEFRAMES[2],
    risk: RISK_LEVELS[1],
    leverage: "5",
    stopLoss: "2",
    takeProfit: "5",
    maxPosition: "1000",
    category: CATEGORIES[0],
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length > 50) e.name = "Name required (max 50 chars)";
    if (!form.markets.trim()) e.markets = "At least one market required";
    const lev = parseFloat(form.leverage);
    if (isNaN(lev) || lev < 1 || lev > 100) e.leverage = "1-100x";
    const sl = parseFloat(form.stopLoss);
    if (isNaN(sl) || sl < 0.1 || sl > 50) e.stopLoss = "0.1-50%";
    const tp = parseFloat(form.takeProfit);
    if (isNaN(tp) || tp < 0.1 || tp > 100) e.takeProfit = "0.1-100%";
    const mp = parseFloat(form.maxPosition);
    if (isNaN(mp) || mp < 1) e.maxPosition = "Min $1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const markets = form.markets.split(",").map((m) => m.trim().toUpperCase()).filter(Boolean);

    const agent: Agent = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      description: `${form.strategy} strategy on ${form.timeframe} timeframe with ${form.risk} risk. Markets: ${markets.join(", ")}. Leverage: ${form.leverage}x, SL: ${form.stopLoss}%, TP: ${form.takeProfit}%.`,
      pnl: 0,
      pnlPercent: 0,
      tags: markets.slice(0, 4),
      winRate: 0,
      trades: 0,
      runtime: "0d",
      volume: 0,
      category: form.category,
      creator: "you.eth",
    };

    // TODO: Replace with backend API call to create agent
    saveAgent(agent);
    onCreated(agent);
    onClose();

    toast({
      title: "Agent Created",
      description: `${agent.name} has been added to the marketplace.`,
    });

    // Reset form
    setForm({
      name: "", markets: "", strategy: STRATEGY_TYPES[0], timeframe: TIMEFRAMES[2],
      risk: RISK_LEVELS[1], leverage: "5", stopLoss: "2", takeProfit: "5",
      maxPosition: "1000", category: CATEGORIES[0], notes: "",
    });
  };

  const fieldClass = "bg-[hsl(var(--chip-bg))] border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] text-sm rounded-lg";
  const labelClass = "text-[0.7rem] tracking-[0.08em] uppercase text-[hsl(var(--muted-foreground))] mb-1.5 block";
  const errorClass = "text-[0.65rem] text-xade-red mt-1";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[hsl(var(--card-bg))] border-[hsl(var(--card-border))] text-[hsl(var(--foreground))] max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>Create Agent</DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))] text-sm">
            Configure your autonomous trading agent.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Name */}
          <div>
            <label className={labelClass}>Agent Name</label>
            <Input className={fieldClass} placeholder="e.g. Alpha Scalper" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={50} />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          {/* Markets */}
          <div>
            <label className={labelClass}>Markets / Symbols</label>
            <Input className={fieldClass} placeholder="BTC, ETH, SOL" value={form.markets} onChange={(e) => update("markets", e.target.value)} />
            {errors.markets && <p className={errorClass}>{errors.markets}</p>}
          </div>

          {/* Strategy + Timeframe row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Strategy Type</label>
              <select className={`w-full px-3 py-2 ${fieldClass} border`} value={form.strategy} onChange={(e) => update("strategy", e.target.value)}>
                {STRATEGY_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Timeframe</label>
              <select className={`w-full px-3 py-2 ${fieldClass} border`} value={form.timeframe} onChange={(e) => update("timeframe", e.target.value)}>
                {TIMEFRAMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Risk + Leverage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Risk Level</label>
              <select className={`w-full px-3 py-2 ${fieldClass} border`} value={form.risk} onChange={(e) => update("risk", e.target.value)}>
                {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Leverage (x)</label>
              <Input className={fieldClass} type="number" min="1" max="100" value={form.leverage} onChange={(e) => update("leverage", e.target.value)} />
              {errors.leverage && <p className={errorClass}>{errors.leverage}</p>}
            </div>
          </div>

          {/* SL + TP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Stop Loss %</label>
              <Input className={fieldClass} type="number" step="0.1" value={form.stopLoss} onChange={(e) => update("stopLoss", e.target.value)} />
              {errors.stopLoss && <p className={errorClass}>{errors.stopLoss}</p>}
            </div>
            <div>
              <label className={labelClass}>Take Profit %</label>
              <Input className={fieldClass} type="number" step="0.1" value={form.takeProfit} onChange={(e) => update("takeProfit", e.target.value)} />
              {errors.takeProfit && <p className={errorClass}>{errors.takeProfit}</p>}
            </div>
          </div>

          {/* Max Position + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Max Position Size ($)</label>
              <Input className={fieldClass} type="number" min="1" value={form.maxPosition} onChange={(e) => update("maxPosition", e.target.value)} />
              {errors.maxPosition && <p className={errorClass}>{errors.maxPosition}</p>}
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={`w-full px-3 py-2 ${fieldClass} border`} value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <textarea
              className={`w-full px-3 py-2 ${fieldClass} border resize-none h-16`}
              placeholder="Any additional instructions..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 mt-2 rounded-lg bg-xade-red text-[hsl(var(--foreground))] text-sm tracking-[0.1em] uppercase font-medium transition-all hover:brightness-110"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Create Agent
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

CreateAgentModal.displayName = "CreateAgentModal";
export default CreateAgentModal;
