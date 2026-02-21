import { useQuery } from "@tanstack/react-query";

export interface OkxTicker {
  instrument: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface OkxMarketStatsResult {
  tickers: OkxTicker[];
  totalVolume24h: number;
  avgChange24h: number;
  leader: OkxTicker;
  isLive: boolean;
  updatedAt: string;
}

const TRACKED_INSTRUMENTS = ["BTC-USDT", "ETH-USDT", "SOL-USDT", "OKB-USDT", "XRP-USDT"];

const FALLBACK_TICKERS: OkxTicker[] = [
  { instrument: "BTC-USDT", lastPrice: 63842.3, change24h: 2.84, high24h: 64511.7, low24h: 62124.4, volume24h: 105230 },
  { instrument: "ETH-USDT", lastPrice: 3478.6, change24h: 1.52, high24h: 3522.4, low24h: 3369.2, volume24h: 284910 },
  { instrument: "SOL-USDT", lastPrice: 172.18, change24h: 4.09, high24h: 176.21, low24h: 161.74, volume24h: 1914400 },
  { instrument: "OKB-USDT", lastPrice: 58.22, change24h: 0.96, high24h: 59.1, low24h: 56.84, volume24h: 246580 },
  { instrument: "XRP-USDT", lastPrice: 0.82, change24h: -1.24, high24h: 0.86, low24h: 0.79, volume24h: 36418200 },
];

function safeNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

async function fetchTicker(instId: string): Promise<OkxTicker | null> {
  const response = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed for ${instId}`);
  }

  const json = await response.json();
  const row = json?.data?.[0];
  if (!row) return null;

  const lastPrice = safeNumber(row.last);
  const open24h = safeNumber(row.open24h);
  const high24h = safeNumber(row.high24h);
  const low24h = safeNumber(row.low24h);
  const volume24h = safeNumber(row.vol24h);
  const change24h = open24h > 0 ? ((lastPrice - open24h) / open24h) * 100 : 0;

  return {
    instrument: instId,
    lastPrice,
    change24h,
    high24h,
    low24h,
    volume24h,
  };
}

function buildResult(tickers: OkxTicker[], isLive: boolean): OkxMarketStatsResult {
  const totalVolume24h = tickers.reduce((sum, item) => sum + item.volume24h, 0);
  const avgChange24h = tickers.length > 0
    ? tickers.reduce((sum, item) => sum + item.change24h, 0) / tickers.length
    : 0;
  const leader = [...tickers].sort((a, b) => b.change24h - a.change24h)[0] ?? FALLBACK_TICKERS[0];

  return {
    tickers,
    totalVolume24h,
    avgChange24h,
    leader,
    isLive,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchOkxMarketStats(): Promise<OkxMarketStatsResult> {
  try {
    const tickerResults = await Promise.all(TRACKED_INSTRUMENTS.map((inst) => fetchTicker(inst)));
    const tickers = tickerResults.filter((item): item is OkxTicker => Boolean(item));

    if (!tickers.length) {
      throw new Error("No OKX tickers available");
    }

    return buildResult(tickers, true);
  } catch {
    return buildResult(FALLBACK_TICKERS, false);
  }
}

export function useOkxMarketStats() {
  return useQuery({
    queryKey: ["home", "okx-market-stats"],
    queryFn: fetchOkxMarketStats,
    staleTime: 30_000,
    refetchInterval: 45_000,
  });
}
