import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const MOCK_SIGNALS = [
  {
    id: 1,
    asset: "BTC/USDT",
    type: "BUY" as const,
    entryPrice: 67800,
    targetPrice: 72000,
    stopLoss: 65000,
    date: "2026-03-15",
    description:
      "Strong support at $67K. Bullish divergence on RSI. Target: $72K.",
    result: "active",
  },
  {
    id: 2,
    asset: "ETH/USDT",
    type: "BUY" as const,
    entryPrice: 3250,
    targetPrice: 3600,
    stopLoss: 3100,
    date: "2026-03-14",
    description:
      "ETH consolidating above $3200. Breakout imminent with high volume.",
    result: "won",
  },
  {
    id: 3,
    asset: "SOL/USDT",
    type: "SELL" as const,
    entryPrice: 185,
    targetPrice: 165,
    stopLoss: 195,
    date: "2026-03-13",
    description:
      "Overbought on 4H. Resistance at $186. Short for quick profit.",
    result: "won",
  },
  {
    id: 4,
    asset: "BNB/USDT",
    type: "HOLD" as const,
    entryPrice: 580,
    targetPrice: 620,
    stopLoss: 560,
    date: "2026-03-12",
    description:
      "BNB in accumulation phase. Hold existing positions, don't add new.",
    result: "active",
  },
  {
    id: 5,
    asset: "XRP/USDT",
    type: "BUY" as const,
    entryPrice: 0.62,
    targetPrice: 0.75,
    stopLoss: 0.57,
    date: "2026-03-11",
    description: "XRP testing key breakout level. Buy on dip for 20% gains.",
    result: "won",
  },
  {
    id: 6,
    asset: "DOGE/USDT",
    type: "SELL" as const,
    entryPrice: 0.18,
    targetPrice: 0.14,
    stopLoss: 0.21,
    date: "2026-03-10",
    description: "DOGE failed breakout at $0.18. Bearish setup for short term.",
    result: "lost",
  },
  {
    id: 7,
    asset: "AVAX/USDT",
    type: "BUY" as const,
    entryPrice: 38,
    targetPrice: 46,
    stopLoss: 34,
    date: "2026-03-09",
    description:
      "AVAX showing strength. Double bottom confirmed. Good entry here.",
    result: "won",
  },
  {
    id: 8,
    asset: "ADA/USDT",
    type: "HOLD" as const,
    entryPrice: 0.48,
    targetPrice: 0.58,
    stopLoss: 0.44,
    date: "2026-03-08",
    description: "ADA waiting for market clarity. Maintain current positions.",
    result: "active",
  },
];

const typeColors = {
  BUY: "bg-green-500/20 text-green-400 border-green-500/30",
  SELL: "bg-red-500/20 text-red-400 border-red-500/30",
  HOLD: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const resultColors = {
  active: "text-blue-400",
  won: "text-green-400",
  lost: "text-red-400",
};

type Filter = "ALL" | "BUY" | "SELL" | "HOLD";

export function Signals() {
  const [filter, setFilter] = useState<Filter>("ALL");

  const signals =
    filter === "ALL"
      ? MOCK_SIGNALS
      : MOCK_SIGNALS.filter((s) => s.type === filter);
  const won = MOCK_SIGNALS.filter((s) => s.result === "won").length;
  const total = MOCK_SIGNALS.filter((s) => s.result !== "active").length;
  const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-4">
            Live Trading Signals
          </Badge>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-3">
            Expert Signals
          </h1>
          <p className="text-muted-foreground">
            Expert-curated crypto trading signals. Follow signals to maximize
            profits.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Signals",
              value: MOCK_SIGNALS.length,
              icon: BarChart2,
            },
            { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp },
            { label: "Wins", value: won, icon: TrendingUp },
            {
              label: "Active",
              value: MOCK_SIGNALS.filter((s) => s.result === "active").length,
              icon: TrendingDown,
            },
          ].map((s) => (
            <div
              key={s.value}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div className="font-display text-2xl font-bold text-gold">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["ALL", "BUY", "SELL", "HOLD"] as Filter[]).map((f) => (
            <Button
              key={f}
              data-ocid={"signals.tab"}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "bg-gold text-navy font-bold"
                  : "border-gold/30 text-gold/70 hover:bg-gold/10"
              }
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Signals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((sig, i) => (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`signals.item.${i + 1}`}
              className="glass-card glass-card-hover rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-display font-bold text-lg text-foreground">
                    {sig.asset}
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {sig.date}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={typeColors[sig.type]}>
                    {sig.type === "BUY" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : sig.type === "SELL" ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : null}
                    {sig.type}
                  </Badge>
                  <span
                    className={`text-xs font-medium ${resultColors[sig.result as keyof typeof resultColors]}`}
                  >
                    {sig.result.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {sig.description}
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-background/40 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Entry</div>
                  <div className="text-sm font-mono font-bold text-foreground">
                    ${sig.entryPrice}
                  </div>
                </div>
                <div className="bg-background/40 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Target</div>
                  <div className="text-sm font-mono font-bold text-green-400">
                    ${sig.targetPrice}
                  </div>
                </div>
                <div className="bg-background/40 rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">Stop Loss</div>
                  <div className="text-sm font-mono font-bold text-red-400">
                    ${sig.stopLoss}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
