/** Deterministic mapping from agent tag (uppercase) to coin logo file in /coins/ */
const COIN_MAP: Record<string, string> = {
  BTC: "/coins/btc.png",
  ETH: "/coins/eth.png",
  BNB: "/coins/bnb.png",
  XLM: "/coins/xlm.png",
  AVAX: "/coins/avax.png",
  POL: "/coins/pol.png",
  CHESS: "/coins/chess.png",
  MLN: "/coins/mln.png",
  SEI: "/coins/sei.png",
  JUP: "/coins/jup.png",
};

export function getCoinImagePath(tag: string): string | null {
  return COIN_MAP[tag.toUpperCase()] ?? null;
}

/** Deterministic color from a string hash for fallback monogram ring */
const RING_COLORS = [
  "#F7931A", "#627EEA", "#F3BA2F", "#E84142", "#8247E5",
  "#00D4AA", "#2775CA", "#26A17B", "#FF007A", "#00ADEF",
];

export function getFallbackColor(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = ((h << 5) - h + tag.charCodeAt(i)) | 0;
  return RING_COLORS[Math.abs(h) % RING_COLORS.length];
}
