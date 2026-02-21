export interface Agent {
  id: string;
  name: string;
  description: string;
  pnl: number;
  pnlPercent: number;
  tags: string[];
  winRate: number;
  trades: number;
  runtime: string;
  volume: number;
  category: string;
  creator: string;
}

const MOCK_AGENTS: Agent[] = [
  { id: "1", name: "Alpha HFT", description: "Buy 10.5$ of coin on max leverage and monitor continuously. As soon as my position is profitable, close it. Everytime my total...", pnl: 0.30, pnlPercent: 4.88, tags: ["BTC"], winRate: 78.9, trades: 180, runtime: "7d", volume: 2940, category: "Perpetuals", creator: "xade.eth" },
  { id: "2", name: "ALPHA BOT", description: "Set up a scalping bot that trades on 1-min candles Perform the same for the following coins/markets: BTC", pnl: 0, pnlPercent: 0, tags: ["BTC"], winRate: 0, trades: 0, runtime: "4d", volume: 0, category: "Perpetuals", creator: "xade.eth" },
  { id: "3", name: "alpha bot", description: "Set up a scalping bot that trades on 1-min candles Perform the same for the following coins/markets: BTC, ETH, SOL, XRP", pnl: 0.06, pnlPercent: 0.25, tags: ["BTC", "ETH", "SOL"], winRate: 100, trades: 2, runtime: "4d", volume: 30, category: "Perpetuals", creator: "xade.eth" },
  { id: "4", name: "915 EMA", description: "9 15 EMA BOT THAT ON 1H TIMEFRAME THAT ENTERS A LONG POSITION IF MARKET GOES ABOVE 9 EMA WITH A STOP LOSS ...", pnl: -8.07, pnlPercent: -24.35, tags: ["BTC", "ETH", "SOL"], winRate: 33.3, trades: 12, runtime: "14d", volume: 1200, category: "Perpetuals", creator: "xade.eth" },
  { id: "5", name: "GRID BOT", description: "Build a grid trading strategy between support and resistance Perform the same for the following coins/markets: BTC, ETH, SOL", pnl: 0, pnlPercent: 0, tags: ["BTC", "ETH", "SOL"], winRate: 0, trades: 0, runtime: "2d", volume: 0, category: "Spot", creator: "xade.eth" },
  { id: "6", name: "JEET BOT", description: "I want a mean reversion agent with tight stop losses Perform the same for the following coins/markets: BTC, ETH", pnl: 0, pnlPercent: 0, tags: ["BTC", "ETH"], winRate: 0, trades: 0, runtime: "1d", volume: 0, category: "Perpetuals", creator: "xade.eth" },
  { id: "7", name: "Momentum Rider", description: "Trend-following strategy that rides momentum breakouts on high volume candles across major pairs.", pnl: 1.45, pnlPercent: 12.3, tags: ["BTC", "ETH"], winRate: 65.2, trades: 89, runtime: "21d", volume: 8900, category: "Perpetuals", creator: "trader.eth" },
  { id: "8", name: "Arb Scanner", description: "Cross-exchange arbitrage scanner that identifies price discrepancies and executes instant trades.", pnl: 0.82, pnlPercent: 3.15, tags: ["BTC", "ETH", "SOL"], winRate: 92.1, trades: 340, runtime: "30d", volume: 45000, category: "Spot", creator: "arb.eth" },
  { id: "9", name: "Funding Farmer", description: "Captures funding rate differentials between perpetual and spot markets for delta-neutral yield.", pnl: 0.55, pnlPercent: 2.1, tags: ["BTC", "ETH"], winRate: 88.5, trades: 56, runtime: "15d", volume: 12000, category: "Funding Rate", creator: "yield.eth" },
  { id: "10", name: "DCA Bot Pro", description: "Dollar cost averaging bot with smart timing based on RSI oversold conditions for accumulation.", pnl: 2.10, pnlPercent: 8.42, tags: ["BTC"], winRate: 71.0, trades: 24, runtime: "60d", volume: 6200, category: "Spot", creator: "hodl.eth" },
  { id: "11", name: "Liquidation Hunter", description: "Monitors on-chain liquidation levels and front-runs large liquidation cascades on major pairs.", pnl: 3.20, pnlPercent: 15.6, tags: ["BTC", "ETH", "SOL"], winRate: 58.3, trades: 45, runtime: "10d", volume: 18500, category: "Perpetuals", creator: "whale.eth" },
  { id: "12", name: "Mean Rev ETH", description: "Mean reversion strategy on ETH using Bollinger Bands and RSI divergence for entry signals.", pnl: -0.45, pnlPercent: -1.8, tags: ["ETH"], winRate: 42.1, trades: 67, runtime: "7d", volume: 3400, category: "Perpetuals", creator: "quant.eth" },
];

export function getDefaultAgents(): Agent[] {
  return MOCK_AGENTS;
}

export function loadAgents(): Agent[] {
  // TODO: Replace with backend API call
  const stored = localStorage.getItem("xade_custom_agents");
  const custom: Agent[] = stored ? JSON.parse(stored) : [];
  return [...MOCK_AGENTS, ...custom];
}

export function saveAgent(agent: Agent): void {
  // TODO: Replace with backend API call
  const stored = localStorage.getItem("xade_custom_agents");
  const custom: Agent[] = stored ? JSON.parse(stored) : [];
  custom.push(agent);
  localStorage.setItem("xade_custom_agents", JSON.stringify(custom));
}
