import { useQuery } from "@tanstack/react-query";

export interface TradeLogEntry {
  id: string;
  pair: string;
  side: "LONG" | "SHORT";
  strategy: string;
  pnl: number;
  status: "FILLED" | "CLOSED" | "STOPPED";
  timestamp: string;
}

export interface TradeLogStats {
  totalTrades: number;
  winRate: number;
  realizedPnl: number;
  avgPnl: number;
}

export interface TradeLogResult {
  logs: TradeLogEntry[];
  stats: TradeLogStats;
  isDemo: boolean;
  updatedAt: string;
}

const FALLBACK_LOGS: TradeLogEntry[] = [
  { id: "log-1", pair: "BTC-USDT", side: "LONG", strategy: "RSI Bounce", pnl: 412.38, status: "CLOSED", timestamp: "2026-02-20T22:14:00.000Z" },
  { id: "log-2", pair: "ETH-USDT", side: "SHORT", strategy: "Funding Reversion", pnl: -143.5, status: "STOPPED", timestamp: "2026-02-20T20:02:00.000Z" },
  { id: "log-3", pair: "SOL-USDT", side: "LONG", strategy: "Momentum Ladder", pnl: 268.11, status: "CLOSED", timestamp: "2026-02-20T18:47:00.000Z" },
  { id: "log-4", pair: "OKB-USDT", side: "LONG", strategy: "Breakout Confirm", pnl: 87.04, status: "FILLED", timestamp: "2026-02-20T16:23:00.000Z" },
  { id: "log-5", pair: "XRP-USDT", side: "SHORT", strategy: "VWAP Fade", pnl: 52.87, status: "CLOSED", timestamp: "2026-02-20T15:06:00.000Z" },
  { id: "log-6", pair: "BTC-USDT", side: "LONG", strategy: "Opening Range", pnl: -69.22, status: "STOPPED", timestamp: "2026-02-20T13:58:00.000Z" },
];

function buildStats(logs: TradeLogEntry[]): TradeLogStats {
  const totalTrades = logs.length;
  const winning = logs.filter((item) => item.pnl > 0).length;
  const realizedPnl = logs.reduce((sum, item) => sum + item.pnl, 0);
  const avgPnl = totalTrades ? realizedPnl / totalTrades : 0;

  return {
    totalTrades,
    winRate: totalTrades ? (winning / totalTrades) * 100 : 0,
    realizedPnl,
    avgPnl,
  };
}

async function fetchTradeLogs(): Promise<TradeLogResult> {
  const raw = localStorage.getItem("soros-trade-logs");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as TradeLogEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          logs: parsed.slice(0, 8),
          stats: buildStats(parsed),
          isDemo: false,
          updatedAt: new Date().toISOString(),
        };
      }
    } catch {
      // fall back to demo dataset
    }
  }

  return {
    logs: FALLBACK_LOGS,
    stats: buildStats(FALLBACK_LOGS),
    isDemo: true,
    updatedAt: new Date().toISOString(),
  };
}

export function useTradeLogs() {
  return useQuery({
    queryKey: ["home", "trade-logs"],
    queryFn: fetchTradeLogs,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
