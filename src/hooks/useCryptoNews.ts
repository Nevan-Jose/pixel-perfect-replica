import { useQuery } from "@tanstack/react-query";

export type NewsSentiment = "bullish" | "bearish" | "neutral";

export interface CryptoNewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  sentiment: NewsSentiment;
}

export interface CryptoNewsResult {
  items: CryptoNewsItem[];
  isLive: boolean;
  updatedAt: string;
}

const FALLBACK_NEWS: CryptoNewsItem[] = [
  {
    id: "fallback-1",
    title: "Bitcoin regains momentum as macro risk appetite improves",
    source: "Soros Research",
    url: "https://www.okx.com/learn",
    publishedAt: "2026-02-20T14:05:00.000Z",
    summary: "BTC spot demand returned during the US session with stronger derivatives basis and rising perpetual open interest.",
    sentiment: "bullish",
  },
  {
    id: "fallback-2",
    title: "Ethereum L2 activity rises while gas fees remain contained",
    source: "Soros Research",
    url: "https://www.okx.com/learn",
    publishedAt: "2026-02-20T11:30:00.000Z",
    summary: "Rollup transfer volume increased across major ecosystems and stablecoin settlement flow remained steady.",
    sentiment: "neutral",
  },
  {
    id: "fallback-3",
    title: "Solana ecosystem tokens continue high-beta rotation",
    source: "Soros Research",
    url: "https://www.okx.com/learn",
    publishedAt: "2026-02-20T09:20:00.000Z",
    summary: "Market participants rotated into high-beta pairs, with larger intraday ranges and faster mean reversion windows.",
    sentiment: "bullish",
  },
  {
    id: "fallback-4",
    title: "Funding rates normalize after weekend leverage reset",
    source: "Soros Research",
    url: "https://www.okx.com/learn",
    publishedAt: "2026-02-19T21:15:00.000Z",
    summary: "Perpetual funding cooled from extremes as liquidations flushed over-levered positions and basis drifted toward neutral.",
    sentiment: "neutral",
  },
  {
    id: "fallback-5",
    title: "Altcoin pair volatility spikes around major resistance",
    source: "Soros Research",
    url: "https://www.okx.com/learn",
    publishedAt: "2026-02-19T18:40:00.000Z",
    summary: "Breakout attempts were rejected repeatedly, producing wider wicks and increased stop-hunting behavior across majors.",
    sentiment: "bearish",
  },
  {
    id: "fallback-6",
    title: "Institutional desk flows favor BTC and ETH over long tail assets",
    source: "Soros Research",
    url: "https://www.okx.com/learn",
    publishedAt: "2026-02-19T16:10:00.000Z",
    summary: "Large ticket flow clustered in the top pairs while smaller-cap allocation remained tactical and short-term.",
    sentiment: "neutral",
  },
];

function inferSentiment(title: string): NewsSentiment {
  const text = title.toLowerCase();
  const bullishWords = ["surge", "rally", "breakout", "gain", "up", "jump", "rise", "record"];
  const bearishWords = ["drop", "fall", "sell-off", "crash", "down", "slump", "risk-off", "liquidation"];

  if (bullishWords.some((word) => text.includes(word))) return "bullish";
  if (bearishWords.some((word) => text.includes(word))) return "bearish";
  return "neutral";
}

async function fetchCryptoNews(): Promise<CryptoNewsResult> {
  try {
    const response = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`News request failed: ${response.status}`);
    }

    const json = await response.json();
    const rawItems = Array.isArray(json?.Data) ? json.Data : [];

    const items = rawItems
      .slice(0, 6)
      .map((item: any, index: number): CryptoNewsItem | null => {
        if (!item?.title || !item?.url) return null;

        return {
          id: String(item.id ?? `live-${index}`),
          title: String(item.title),
          source: String(item.source_info?.name ?? "CryptoCompare"),
          url: String(item.url),
          publishedAt: item.published_on
            ? new Date(Number(item.published_on) * 1000).toISOString()
            : new Date().toISOString(),
          summary: String(item.body ?? "Latest crypto market update from global newswire feeds.").slice(0, 220),
          sentiment: inferSentiment(String(item.title)),
        };
      })
      .filter((entry: CryptoNewsItem | null): entry is CryptoNewsItem => Boolean(entry));

    if (items.length === 0) {
      throw new Error("No live news available");
    }

    return {
      items,
      isLive: true,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      items: FALLBACK_NEWS,
      isLive: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function useCryptoNews() {
  return useQuery({
    queryKey: ["home", "crypto-news"],
    queryFn: fetchCryptoNews,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
