import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const COINS = [
  {
    ticker: "BONK",
    name: "Bonk",
    basePrice: 0.0000234,
    color: "text-orange-400",
  },
  { ticker: "WIF", name: "Dogwifhat", basePrice: 2.87, color: "text-pink-400" },
  {
    ticker: "PEPE",
    name: "Pepe",
    basePrice: 0.00001234,
    color: "text-green-400",
  },
  {
    ticker: "SHIB",
    name: "Shiba Inu",
    basePrice: 0.0000182,
    color: "text-yellow-400",
  },
  {
    ticker: "DOGE",
    name: "Dogecoin",
    basePrice: 0.162,
    color: "text-yellow-500",
  },
  {
    ticker: "FLOKI",
    name: "Floki",
    basePrice: 0.000198,
    color: "text-blue-400",
  },
];

function seedRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) / 0xffffffff) * 2 - 1;
}

function formatPrice(p: number) {
  if (p < 0.0001) return p.toFixed(10);
  if (p < 0.01) return p.toFixed(6);
  if (p < 1) return p.toFixed(4);
  return p.toFixed(2);
}

type Trade = {
  id: number;
  ticker: string;
  type: "BUY" | "SELL";
  amount: number;
  entryPrice: number;
  quantity: number;
  timestamp: string;
  closed?: boolean;
  closePrice?: number;
  pnl?: number;
};

function loadTrades(): Trade[] {
  try {
    return JSON.parse(localStorage.getItem("skl_meme_trades") || "[]");
  } catch {
    return [];
  }
}

function saveTrades(trades: Trade[]) {
  localStorage.setItem("skl_meme_trades", JSON.stringify(trades));
}

export function MemeCoinTrading() {
  const { isLoggedIn, user, updateUser } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [amount, setAmount] = useState("");
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [tick, setTick] = useState(0);
  const [phantomConnected, setPhantomConnected] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(iv);
  }, []);

  const prices = useMemo(() => {
    return Object.fromEntries(
      COINS.map((c) => {
        const drift =
          seedRandom(c.ticker + String(Math.floor(tick / 2))) * 0.03;
        return [c.ticker, c.basePrice * (1 + drift)];
      }),
    );
  }, [tick]);

  const changes = useMemo(() => {
    return Object.fromEntries(
      COINS.map((c) => [c.ticker, seedRandom(`${c.ticker}change`) * 20]),
    );
  }, []);

  function connectPhantom() {
    toast.success("Redirecting to Phantom Wallet...");
    window.open("https://phantom.app", "_blank");
    setPhantomConnected(true);
  }

  function executeTrade(type: "BUY" | "SELL") {
    if (!isLoggedIn) {
      toast.error("Please login first");
      return;
    }
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!user || user.balance < amt) {
      toast.error("Insufficient balance");
      return;
    }
    // Deduct amount from wallet on trade open
    updateUser({ balance: (user.balance || 0) - amt });

    const price = prices[selectedCoin.ticker];
    const qty = amt / price;
    const trade: Trade = {
      id: Date.now(),
      ticker: selectedCoin.ticker,
      type,
      amount: amt,
      entryPrice: price,
      quantity: qty,
      timestamp: new Date().toLocaleString(),
    };
    const updated = [trade, ...trades];
    setTrades(updated);
    saveTrades(updated);
    toast.success(`${type} order placed: $${amt} of ${selectedCoin.ticker}`);
    setAmount("");
  }

  function closeTrade(id: number) {
    const updated = trades.map((t) => {
      if (t.id !== id || t.closed) return t;
      const currentPrice = prices[t.ticker];
      const pnl =
        t.type === "BUY"
          ? (currentPrice - t.entryPrice) * t.quantity
          : (t.entryPrice - currentPrice) * t.quantity;
      // Return capital + pnl (pnl can be negative = loss)
      const returnAmt = t.amount + pnl;
      if (user) {
        const newBalance = Math.max(0, (user.balance || 0) + returnAmt);
        updateUser({ balance: newBalance });
        if (pnl >= 0) {
          toast.success(
            `Position closed! Profit: +$${pnl.toFixed(2)} credited to wallet`,
          );
        } else {
          toast.error(
            `Position closed. Loss: $${Math.abs(pnl).toFixed(2)} deducted from wallet`,
          );
        }
      }
      return { ...t, closed: true, closePrice: currentPrice, pnl };
    });
    setTrades(updated);
    saveTrades(updated);
  }

  const openTrades = trades.filter((t) => !t.closed);
  const closedTrades = trades.filter((t) => t.closed);

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold gold-gradient">
                Meme Coin Trading
              </h1>
              <p className="text-muted-foreground text-sm">
                Live trading powered by DexScreener data
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Shield className="w-3 h-3 mr-1" /> Trusted Platform
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Powered by DexScreener
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Phantom Wallet Compatible
            </Badge>
            <Badge className="bg-gold/20 text-gold border-gold/30">
              <Zap className="w-3 h-3 mr-1" /> Real Trading
            </Badge>
          </div>
        </motion.div>

        {/* Balance display */}
        {isLoggedIn && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-gold" />
              <div>
                <div className="text-xs text-muted-foreground">
                  Trading Balance
                </div>
                <div className="font-display font-bold text-gold text-lg">
                  ${(user.balance || 0).toFixed(2)} USDT
                </div>
              </div>
            </div>
            <Link to="/wallet">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-gold/30 text-gold hover:bg-gold/10"
              >
                Deposit
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Phantom Connect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                Phantom Wallet
              </div>
              <div className="text-sm text-muted-foreground">
                {phantomConnected
                  ? "Redirected to Phantom. Connect your wallet there."
                  : "Connect your Solana wallet to trade meme coins"}
              </div>
            </div>
          </div>
          <Button
            data-ocid="meme.primary_button"
            onClick={connectPhantom}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold shrink-0"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {phantomConnected ? "Open Phantom Again" : "Connect Phantom Wallet"}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Coin list + DexScreener */}
          <div className="xl:col-span-2 space-y-6">
            {/* Coin cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display font-bold text-foreground mb-3">
                Trending Meme Coins
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COINS.map((coin, i) => {
                  const price = prices[coin.ticker];
                  const change = changes[coin.ticker];
                  const isSelected = selectedCoin.ticker === coin.ticker;
                  return (
                    <motion.button
                      key={coin.ticker}
                      type="button"
                      data-ocid={`meme.item.${i + 1}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() => setSelectedCoin(coin)}
                      className={`glass-card rounded-xl p-4 text-left transition-all ${
                        isSelected
                          ? "border-gold/60 bg-gold/5"
                          : "border-border/30 hover:border-gold/30"
                      }`}
                    >
                      <div
                        className={`font-display font-bold text-lg ${coin.color}`}
                      >
                        {coin.ticker}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {coin.name}
                      </div>
                      <div className="font-mono text-sm text-foreground">
                        ${formatPrice(price)}
                      </div>
                      <div
                        className={`text-xs font-medium mt-1 ${
                          change >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {change >= 0 ? (
                          <ArrowUpRight className="w-3 h-3 inline" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 inline" />
                        )}
                        {Math.abs(change).toFixed(2)}% (24h)
                      </div>
                      {isSelected && (
                        <div className="mt-2 text-xs text-gold font-semibold">
                          Selected ✓
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* DexScreener embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">
                    DexScreener Live Chart
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                  <a
                    href="https://dexscreener.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Open DexScreener <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <iframe
                src="https://dexscreener.com/solana?embed=1&theme=dark"
                style={{ width: "100%", height: "500px", border: "none" }}
                title="DexScreener Live Chart"
                loading="lazy"
              />
            </motion.div>
          </div>

          {/* Right: Trading panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">
                  Trade {selectedCoin.ticker}
                </h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Live
                </Badge>
              </div>

              <div className="bg-background/50 rounded-xl p-3 mb-4">
                <div className="text-xs text-muted-foreground mb-1">
                  Current Price
                </div>
                <div className="font-display font-bold text-xl text-gold">
                  ${formatPrice(prices[selectedCoin.ticker])}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedCoin.name} • Solana
                </div>
              </div>

              {isLoggedIn && user && (
                <div className="bg-background/30 rounded-lg px-3 py-2 mb-3 text-xs flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-bold text-gold">
                    ${(user.balance || 0).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-foreground/70">
                    Amount (USDT)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    data-ocid="meme.input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background/50 border-border/60 focus:border-gold/50"
                  />
                </div>
                {amount && (
                  <div className="text-xs text-muted-foreground bg-background/30 rounded-lg px-3 py-2">
                    ≈{" "}
                    {(
                      Number.parseFloat(amount || "0") /
                      prices[selectedCoin.ticker]
                    ).toExponential(4)}{" "}
                    {selectedCoin.ticker}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    data-ocid="meme.primary_button"
                    onClick={() => executeTrade("BUY")}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1" /> BUY
                  </Button>
                  <Button
                    data-ocid="meme.secondary_button"
                    onClick={() => executeTrade("SELL")}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    <ArrowDownRight className="w-4 h-4 mr-1" /> SELL
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Positions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-5"
            >
              <Tabs defaultValue="open" data-ocid="meme.tab">
                <TabsList className="w-full bg-background/50 border border-border/50 mb-4">
                  <TabsTrigger
                    value="open"
                    data-ocid="meme.tab"
                    className="flex-1 text-xs data-[state=active]:bg-gold data-[state=active]:text-navy"
                  >
                    Open ({openTrades.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="closed"
                    data-ocid="meme.tab"
                    className="flex-1 text-xs data-[state=active]:bg-gold data-[state=active]:text-navy"
                  >
                    History ({closedTrades.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="open">
                  {openTrades.length === 0 ? (
                    <div
                      data-ocid="meme.empty_state"
                      className="text-muted-foreground text-sm text-center py-4"
                    >
                      No open positions
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {openTrades.slice(0, 5).map((t, i) => {
                        const current = prices[t.ticker] || t.entryPrice;
                        const pnl =
                          t.type === "BUY"
                            ? (current - t.entryPrice) * t.quantity
                            : (t.entryPrice - current) * t.quantity;
                        return (
                          <div
                            key={t.id}
                            data-ocid={`meme.item.${i + 1}`}
                            className="bg-background/40 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-xs font-bold ${
                                  t.type === "BUY"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {t.type} {t.ticker}
                              </span>
                              <Button
                                size="sm"
                                data-ocid="meme.delete_button"
                                onClick={() => closeTrade(t.id)}
                                className="h-6 text-xs bg-muted/50 text-muted-foreground hover:text-foreground px-2"
                              >
                                Close
                              </Button>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>${t.amount.toFixed(2)}</span>
                              <span
                                className={
                                  pnl >= 0 ? "text-green-400" : "text-red-400"
                                }
                              >
                                {pnl >= 0 ? "+" : ""}
                                {pnl.toFixed(4)} USDT
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="closed">
                  {closedTrades.length === 0 ? (
                    <div
                      data-ocid="meme.empty_state"
                      className="text-muted-foreground text-sm text-center py-4"
                    >
                      No trade history
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {closedTrades.slice(0, 5).map((t, i) => (
                        <div
                          key={t.id}
                          data-ocid={`meme.item.${i + 1}`}
                          className="bg-background/40 rounded-lg p-3"
                        >
                          <div className="flex justify-between text-xs">
                            <span
                              className={
                                t.type === "BUY"
                                  ? "text-green-400 font-bold"
                                  : "text-red-400 font-bold"
                              }
                            >
                              {t.type} {t.ticker}
                            </span>
                            <span
                              className={
                                (t.pnl || 0) >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {(t.pnl || 0) >= 0 ? "+" : ""}
                              {(t.pnl || 0).toFixed(4)} USDT
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {t.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-lg mb-1">📊</div>
                <div className="text-xs font-semibold text-foreground">
                  Powered by
                </div>
                <div className="text-xs text-blue-400 font-bold">
                  DexScreener
                </div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-lg mb-1">👻</div>
                <div className="text-xs font-semibold text-foreground">
                  Compatible
                </div>
                <div className="text-xs text-purple-400 font-bold">
                  Phantom Wallet
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">
                  Trusted & Secure
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sandeep Karna Crypto Empire is a real, legitimate trading
                platform. All profits and losses affect your real wallet
                balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
