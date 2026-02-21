import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadAgents, type Agent } from "@/lib/mockAgents";

export interface StrategyStep {
  id: string;
  title: string;
  detail: string;
}

export interface StrategyBlueprint {
  marketFocus: string;
  timeframe: string;
  riskLimit: string;
  executionStyle: string;
}

export interface AgentStrategyPreviewResult {
  topAgents: Agent[];
  blueprint: StrategyBlueprint;
  workflow: StrategyStep[];
  updatedAt: string;
}

const DEFAULT_BLUEPRINT: StrategyBlueprint = {
  marketFocus: "BTC, ETH, SOL perpetuals",
  timeframe: "5m entry / 1h trend filter",
  riskLimit: "Max 1.5% equity risk per trade",
  executionStyle: "Adaptive limit-first with fallback market orders",
};

const WORKFLOW: StrategyStep[] = [
  {
    id: "step-signal",
    title: "Signal Layer",
    detail: "Combine momentum and mean-reversion triggers, then gate entries by volatility regime.",
  },
  {
    id: "step-risk",
    title: "Risk Engine",
    detail: "Position sizing uses volatility and max drawdown budget with automatic leverage clamps.",
  },
  {
    id: "step-execution",
    title: "Execution",
    detail: "Route to best-liquidity venue, retry partial fills, and enforce slippage guardrails.",
  },
  {
    id: "step-feedback",
    title: "Feedback Loop",
    detail: "Replay logs nightly, recalibrate thresholds, and publish a daily confidence score.",
  },
];

async function fetchAgentStrategyPreview(): Promise<AgentStrategyPreviewResult> {
  const topAgents = loadAgents()
    .sort((a, b) => b.pnlPercent - a.pnlPercent)
    .slice(0, 3);

  return {
    topAgents,
    blueprint: DEFAULT_BLUEPRINT,
    workflow: WORKFLOW,
    updatedAt: new Date().toISOString(),
  };
}

export function useAgentStrategyPreview() {
  const query = useQuery({
    queryKey: ["home", "agent-strategy-preview"],
    queryFn: fetchAgentStrategyPreview,
    staleTime: 5 * 60_000,
  });

  const hasAgents = useMemo(() => Boolean(query.data?.topAgents.length), [query.data?.topAgents.length]);

  return {
    ...query,
    hasAgents,
  };
}
