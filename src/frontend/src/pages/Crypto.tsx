import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Search, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useCryptoPrices } from "../hooks/useQueries";

function formatPrice(n: number) {
  if (n >= 1000)
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1)
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

function formatMarketCap(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export function Crypto() {
  const {
    data: coins = [],
    isLoading,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useCryptoPrices();
  const [search, setSearch] = useState("");
  const [countdown, setCountdown] = useState(60);

  // biome-ignore lint/correctness/useExhaustiveDependencies: timer restarts on data update; refetch is stable
  useEffect(() => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          refetch();
          return 60;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-mesh pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="gold-gradient">Crypto</span> Dashboard
          </h1>
          <p className="text-foreground/50">
            Live cryptocurrency prices & market data
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              data-ocid="crypto.search_input"
              placeholder="Search coins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-navy-card border-gold/20 focus:border-gold/40 text-foreground"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/50">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${isFetching ? "bg-orange-brand animate-pulse" : "bg-green-500"}`}
              />
              {isFetching ? "Updating..." : "Live"}
            </div>
            <span>Refresh in {countdown}s</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-gold hover:text-gold/70 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div
            data-ocid="crypto.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
              <Skeleton key={k} className="h-40 rounded-xl bg-navy-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((coin, i) => (
              <motion.div
                key={coin.id}
                data-ocid={`crypto.card.item.${i + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card glass-card-hover rounded-xl p-5 transition-all duration-300 cursor-default"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-9 h-9 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div>
                      <div className="font-bold text-sm text-foreground">
                        {coin.name}
                      </div>
                      <div className="text-xs text-foreground/40 uppercase font-mono">
                        {coin.symbol}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      coin.price_change_percentage_24h >= 0
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {coin.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
                <div className="font-mono font-bold text-xl text-gold mb-1">
                  {formatPrice(coin.current_price)}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-foreground/40">Market Cap</span>
                    <div className="text-foreground/70 font-mono mt-0.5">
                      {formatMarketCap(coin.market_cap)}
                    </div>
                  </div>
                  <div>
                    <span className="text-foreground/40">Volume 24h</span>
                    <div className="text-foreground/70 font-mono mt-0.5">
                      {formatMarketCap(coin.total_volume)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-foreground/40">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No coins found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
