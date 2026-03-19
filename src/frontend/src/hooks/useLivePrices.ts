import { useEffect, useState } from "react";

const COINS = [
  { binanceSymbol: "BTCUSDT", symbol: "BTC/USDT", short: "BTC" },
  { binanceSymbol: "ETHUSDT", symbol: "ETH/USDT", short: "ETH" },
  { binanceSymbol: "SOLUSDT", symbol: "SOL/USDT", short: "SOL" },
  { binanceSymbol: "BNBUSDT", symbol: "BNB/USDT", short: "BNB" },
  { binanceSymbol: "XRPUSDT", symbol: "XRP/USDT", short: "XRP" },
  { binanceSymbol: "DOGEUSDT", symbol: "DOGE/USDT", short: "DOGE" },
  { binanceSymbol: "ADAUSDT", symbol: "ADA/USDT", short: "ADA" },
  { binanceSymbol: "AVAXUSDT", symbol: "AVAX/USDT", short: "AVAX" },
];

export type LivePrice = { price: number; change24h: number };

export function useLivePrices(intervalMs = 15000) {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const symbols = JSON.stringify(COINS.map((c) => c.binanceSymbol));
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
        );
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const mapped: Record<string, LivePrice> = {};
        for (const ticker of data) {
          const coin = COINS.find((c) => c.binanceSymbol === ticker.symbol);
          if (coin) {
            const entry: LivePrice = {
              price: Number.parseFloat(ticker.lastPrice),
              change24h: Number.parseFloat(ticker.priceChangePercent),
            };
            mapped[coin.short] = entry;
            mapped[coin.symbol] = entry;
            mapped[coin.binanceSymbol] = entry;
          }
        }
        setPrices(mapped);
        setLoading(false);
      } catch {
        // silently fail, keep previous prices
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { prices, loading };
}

export { COINS };
