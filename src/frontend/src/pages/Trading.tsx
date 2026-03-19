import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const PAIRS = [
  { symbol: "BTCUSDT", display: "BTC/USDT", short: "BTC" },
  { symbol: "ETHUSDT", display: "ETH/USDT", short: "ETH" },
  { symbol: "SOLUSDT", display: "SOL/USDT", short: "SOL" },
  { symbol: "BNBUSDT", display: "BNB/USDT", short: "BNB" },
];

export function Trading() {
  const { user, isLoggedIn, updateUser } = useAuth();
  const [activePair, setActivePair] = useState(PAIRS[0]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [prevPrice, setPrevPrice] = useState<number>(0);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [orderType, setOrderType] = useState<"Buy" | "Sell">("Buy");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState([1]);
  const [executing, setExecuting] = useState(false);
  const [showPairMenu, setShowPairMenu] = useState(false);
  const priceRef = useRef(currentPrice);
  const [openOrders, setOpenOrders] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("skce_open_orders") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${activePair.symbol}`,
        );
        const data = await res.json();
        const newPrice = Number.parseFloat(data.price);
        if (newPrice !== priceRef.current && priceRef.current !== 0) {
          setPrevPrice(priceRef.current);
          setPriceFlash(newPrice > priceRef.current ? "up" : "down");
          setTimeout(() => setPriceFlash(null), 600);
        }
        priceRef.current = newPrice;
        setCurrentPrice(newPrice);
      } catch {
        /* ignore */
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [activePair.symbol]);

  const [buyOrders, setBuyOrders] = useState<
    { price: string; qty: string; total: string }[]
  >([]);
  const [sellOrders, setSellOrders] = useState<
    { price: string; qty: string; total: string }[]
  >([]);

  useEffect(() => {
    async function fetchDepth() {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${activePair.symbol}&limit=10`,
        );
        const data = await res.json();
        const fmt = (arr: [string, string][]) =>
          arr.map(([p, q]) => ({
            price: Number(p).toFixed(2),
            qty: Number(q).toFixed(4),
            total: (Number(p) * Number(q)).toFixed(2),
          }));
        setBuyOrders(fmt(data.bids || []));
        setSellOrders(fmt(data.asks || []));
      } catch {
        /* ignore */
      }
    }
    fetchDepth();
    const iv = setInterval(fetchDepth, 3000);
    return () => clearInterval(iv);
  }, [activePair.symbol]);

  async function handleExecute() {
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!user || (user.balance || 0) < amt) {
      toast.error("Insufficient balance.");
      return;
    }
    setExecuting(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Trading result: 60% win, 40% loss
    const win = Math.random() < 0.6;
    const pct = (Math.random() * 0.08 + 0.01) * leverage[0];
    const pnl = win ? amt * pct : -(amt * pct);
    const newBalance = Math.max(0, (user.balance || 0) + pnl);

    updateUser({ balance: newBalance });

    // Save to open orders
    const order = {
      id: `ord_${Date.now()}`,
      pair: activePair.display,
      type: orderType,
      amount: amt,
      price: currentPrice,
      status: "Filled",
      pnl: pnl.toFixed(2),
      timestamp: Date.now(),
    };
    const orders = (() => {
      try {
        return JSON.parse(localStorage.getItem("skce_open_orders") || "[]");
      } catch {
        return [];
      }
    })();
    const updated = [order, ...orders].slice(0, 50);
    localStorage.setItem("skce_open_orders", JSON.stringify(updated));
    setOpenOrders(updated);

    if (win) {
      toast.success(`🚀 Trade Executed! +$${pnl.toFixed(2)} USDT profit!`);
    } else {
      toast.error(
        `📉 Trade closed at loss: -$${Math.abs(pnl).toFixed(2)} USDT`,
      );
    }
    setAmount("");
    setExecuting(false);
  }

  const tvSymbol = `BINANCE:${activePair.symbol}`;

  return (
    <div className="min-h-screen pt-16" style={{ background: "#0a0a0a" }}>
      {/* Top Bar */}
      <div
        className="border-b flex items-center gap-4 px-4 py-2"
        style={{
          borderColor: "rgba(255,215,0,0.1)",
          background: "rgba(15,15,15,0.9)",
        }}
      >
        {/* Pair selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPairMenu(!showPairMenu)}
            data-ocid="trading.select"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-colors"
            style={{ border: "1px solid rgba(255,215,0,0.2)" }}
          >
            <span style={{ color: "#FFD700" }}>{activePair.display}</span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>
          <AnimatePresence>
            {showPairMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-50 w-40"
                style={{
                  background: "rgba(15,15,15,0.98)",
                  border: "1px solid rgba(255,215,0,0.2)",
                }}
              >
                {PAIRS.map((p) => (
                  <button
                    key={p.symbol}
                    type="button"
                    onClick={() => {
                      setActivePair(p);
                      setShowPairMenu(false);
                      priceRef.current = 0;
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      p.symbol === activePair.symbol
                        ? "text-[#FFD700]"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {p.display}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live price */}
        <div
          className={`font-mono font-bold text-lg transition-all rounded px-1 ${
            priceFlash === "up"
              ? "price-flash-green"
              : priceFlash === "down"
                ? "price-flash-red"
                : ""
          }`}
          style={{
            color:
              priceFlash === "up"
                ? "#00FF88"
                : priceFlash === "down"
                  ? "#FF3366"
                  : "#FFD700",
          }}
        >
          {currentPrice > 0
            ? `$${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "Loading..."}
        </div>

        {currentPrice > 0 && prevPrice > 0 && (
          <div
            className={`text-xs flex items-center gap-1 ${currentPrice >= prevPrice ? "text-[#00FF88]" : "text-[#FF3366]"}`}
          >
            {currentPrice >= prevPrice ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
          </div>
        )}

        <div
          className="ml-auto flex items-center gap-1 text-xs"
          style={{ color: "#00FF88" }}
        >
          <Activity className="w-3 h-3" />
          <span className="animate-pulse">LIVE</span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* TradingView Chart */}
        <div className="flex-1 min-w-0">
          <iframe
            key={tvSymbol}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${tvSymbol}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=000000&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1&studies_overrides=%7B%7D&overrides=%7B%22mainSeriesProperties.candleStyle.upColor%22%3A%22%2300FF88%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23FF3366%22%7D&enabled_features=[]&disabled_features=[]&locale=en`}
            className="w-full h-full border-0"
            title="TradingView Chart"
            allowFullScreen
          />
        </div>

        {/* Right sidebar: Order book + Trade panel */}
        <div
          className="w-72 flex flex-col shrink-0 border-l"
          style={{
            borderColor: "rgba(255,215,0,0.1)",
            background: "rgba(10,10,10,0.95)",
          }}
        >
          {/* Order Book */}
          <div className="flex-1 overflow-hidden">
            <div
              className="px-3 py-2 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Order Book
              </span>
            </div>
            <div className="px-3 py-1">
              <div className="grid grid-cols-3 text-[10px] text-white/30 py-1 uppercase tracking-wider">
                <span>Price (USDT)</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Total</span>
              </div>
            </div>
            {/* Sell orders (red) */}
            <div className="px-3 space-y-px">
              {sellOrders
                .slice()
                .reverse()
                .map((o, i) => (
                  <div
                    key={`sell-${String(i)}`}
                    className="grid grid-cols-3 text-xs py-0.5 relative"
                  >
                    <div
                      className="absolute inset-0 right-auto"
                      style={{
                        width: `${(8 - i) * 8}%`,
                        background: "rgba(255,51,102,0.08)",
                      }}
                    />
                    <span
                      className="font-mono relative z-10"
                      style={{ color: "#FF3366" }}
                    >
                      {o.price}
                    </span>
                    <span className="text-center font-mono relative z-10 text-white/50">
                      {o.qty}
                    </span>
                    <span className="text-right font-mono relative z-10 text-white/30">
                      {o.total}
                    </span>
                  </div>
                ))}
            </div>

            {/* Mid price */}
            <div className="px-3 py-2 text-center">
              <span
                className="font-mono font-bold text-sm"
                style={{ color: "#FFD700" }}
              >
                {currentPrice > 0 ? currentPrice.toFixed(2) : "---"}
              </span>
            </div>

            {/* Buy orders (green) */}
            <div className="px-3 space-y-px">
              {buyOrders.map((o, i) => (
                <div
                  key={`buy-${String(i)}`}
                  className="grid grid-cols-3 text-xs py-0.5 relative"
                >
                  <div
                    className="absolute inset-0 right-auto"
                    style={{
                      width: `${(8 - i) * 8}%`,
                      background: "rgba(0,255,136,0.06)",
                    }}
                  />
                  <span
                    className="font-mono relative z-10"
                    style={{ color: "#00FF88" }}
                  >
                    {o.price}
                  </span>
                  <span className="text-center font-mono relative z-10 text-white/50">
                    {o.qty}
                  </span>
                  <span className="text-right font-mono relative z-10 text-white/30">
                    {o.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Panel */}
          <div
            className="border-t p-3 space-y-3"
            style={{ borderColor: "rgba(255,215,0,0.1)" }}
          >
            {/* Buy/Sell toggle */}
            <div
              className="grid grid-cols-2 rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                type="button"
                onClick={() => setOrderType("Buy")}
                data-ocid="trading.toggle"
                className="py-2 text-sm font-bold transition-all"
                style={{
                  background:
                    orderType === "Buy"
                      ? "linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.1))"
                      : "transparent",
                  color:
                    orderType === "Buy" ? "#00FF88" : "rgba(255,255,255,0.4)",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <ArrowUp className="w-3 h-3 inline mr-1" />
                Buy
              </button>
              <button
                type="button"
                onClick={() => setOrderType("Sell")}
                data-ocid="trading.toggle"
                className="py-2 text-sm font-bold transition-all"
                style={{
                  background:
                    orderType === "Sell"
                      ? "linear-gradient(135deg, rgba(255,51,102,0.2), rgba(255,51,102,0.1))"
                      : "transparent",
                  color:
                    orderType === "Sell" ? "#FF3366" : "rgba(255,255,255,0.4)",
                }}
              >
                <ArrowDown className="w-3 h-3 inline mr-1" />
                Sell
              </button>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                Amount (USDT)
              </div>
              <input
                type="number"
                data-ocid="trading.input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 rounded-lg px-3 text-sm font-mono text-white bg-white/5 border border-white/10 focus:border-[#FFD700]/40 focus:outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  Leverage
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: "#FFD700" }}
                >
                  {leverage[0]}x
                </span>
              </div>
              <Slider
                value={leverage}
                onValueChange={setLeverage}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {isLoggedIn && user && (
              <div className="text-[10px] text-white/30 flex justify-between">
                <span>Balance</span>
                <span className="font-mono" style={{ color: "#FFD700" }}>
                  ${(user.balance || 0).toFixed(2)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecute}
              data-ocid="trading.submit_button"
              disabled={executing || !isLoggedIn}
              className={`w-full h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                orderType === "Buy" ? "" : ""
              }`}
              style={{
                background: executing
                  ? "rgba(255,255,255,0.1)"
                  : orderType === "Buy"
                    ? "linear-gradient(135deg, #00FF88, #00cc66)"
                    : "linear-gradient(135deg, #FF3366, #cc0033)",
                color: "#0a0a0a",
                boxShadow:
                  orderType === "Buy"
                    ? "0 0 15px rgba(0,255,136,0.3)"
                    : "0 0 15px rgba(255,51,102,0.3)",
              }}
            >
              {executing ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" /> Executing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> {orderType} {activePair.short}
                </>
              )}
            </button>

            {!isLoggedIn && (
              <p className="text-[10px] text-center text-white/30">
                <a
                  href="/login"
                  className="underline"
                  style={{ color: "#FFD700" }}
                >
                  Login
                </a>{" "}
                to start trading
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Open Orders Section */}
      {openOrders.length > 0 && (
        <div
          className="border-t px-4 py-4"
          style={{
            borderColor: "rgba(255,215,0,0.1)",
            background: "rgba(10,10,10,0.9)",
          }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: "#FFD700" }}>
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: "rgba(255,255,255,0.3)" }}>
                  <th className="text-left pb-2">Pair</th>
                  <th className="text-left pb-2">Type</th>
                  <th className="text-right pb-2">Amount</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">PNL</th>
                  <th className="text-right pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.slice(0, 10).map((order, idx) => (
                  <tr
                    key={order.id}
                    data-ocid={`trading.order.item.${idx + 1}`}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td
                      className="py-1.5 font-mono"
                      style={{ color: "#FFD700" }}
                    >
                      {order.pair}
                    </td>
                    <td className="py-1.5">
                      <span
                        style={{
                          color: order.type === "Buy" ? "#00FF88" : "#FF3366",
                        }}
                      >
                        {order.type}
                      </span>
                    </td>
                    <td className="py-1.5 text-right font-mono text-white/70">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="py-1.5 text-right font-mono text-white/70">
                      ${Number(order.price).toFixed(2)}
                    </td>
                    <td
                      className="py-1.5 text-right font-mono"
                      style={{
                        color: Number(order.pnl) >= 0 ? "#00FF88" : "#FF3366",
                      }}
                    >
                      {Number(order.pnl) >= 0 ? "+" : ""}
                      {order.pnl}
                    </td>
                    <td className="py-1.5 text-right">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{
                          background: "rgba(0,255,136,0.1)",
                          color: "#00FF88",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
