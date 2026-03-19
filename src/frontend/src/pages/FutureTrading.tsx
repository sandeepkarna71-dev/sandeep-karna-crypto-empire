import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  ChevronDown,
  Grid,
  Home,
  List,
  Maximize2,
  Pencil,
  PieChart,
  Radio,
  Search,
  Share2,
  Star,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

// ─── TradingView Chart ───────────────────────────────────────────────────────
type Interval = "1m" | "15m" | "1h" | "4h" | "1D";
type Indicator =
  | "MA"
  | "EMA"
  | "MACD"
  | "Mark"
  | "BOLL"
  | "SAR"
  | "MAVOL"
  | "KL";

type OrderSide = "LONG" | "SHORT";

const TRADING_PAIRS = [
  { symbol: "ETHUSDT", base: "ETH", quote: "USDT", binance: "ETHUSDT" },
  { symbol: "BTCUSDT", base: "BTC", quote: "USDT", binance: "BTCUSDT" },
  { symbol: "SOLUSDT", base: "SOL", quote: "USDT", binance: "SOLUSDT" },
  { symbol: "BNBUSDT", base: "BNB", quote: "USDT", binance: "BNBUSDT" },
];

const INTERVALS: Interval[] = ["1m", "15m", "1h", "4h", "1D"];
const INDICATORS: Indicator[] = [
  "MA",
  "EMA",
  "MACD",
  "BOLL",
  "Mark",
  "SAR",
  "MAVOL",
  "KL",
];

function TradingViewChart({
  symbol,
  interval,
}: { symbol: string; interval: string }) {
  const intervalMap: Record<string, string> = {
    "1m": "1",
    "15m": "15",
    "1h": "60",
    "4h": "240",
    "1D": "D",
  };
  const tvInterval = intervalMap[interval] || "1";
  const src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=BINANCE:${symbol}&interval=${tvInterval}&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=0B0B0D&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&locale=en&hide_top_toolbar=0`;
  return (
    <iframe
      key={`${symbol}-${tvInterval}`}
      src={src}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "#0B0B0D",
        touchAction: "pinch-zoom",
      }}
      allow="fullscreen"
      title="TradingView Chart"
    />
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({
  price,
  markPrice,
  pair,
}: { price: number; markPrice: number; pair: (typeof TRADING_PAIRS)[0] }) {
  const [fundingRate, setFundingRate] = useState<number | null>(null);
  const [openInterest, setOpenInterest] = useState<number | null>(null);
  const [nextFunding, setNextFunding] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [frRes, oiRes] = await Promise.all([
          fetch(
            `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${pair.binance}`,
          ),
          fetch(
            `https://fapi.binance.com/fapi/v1/openInterest?symbol=${pair.binance}`,
          ),
        ]);
        const fr = await frRes.json();
        const oi = await oiRes.json();
        setFundingRate(Number.parseFloat(fr.lastFundingRate) * 100);
        setOpenInterest(Number.parseFloat(oi.openInterest));
      } catch {
        setFundingRate(0.01);
        setOpenInterest(320450.23);
      }
    }
    fetchData();
  }, [pair]);

  useEffect(() => {
    function calcCountdown() {
      const now = new Date();
      const utcH = now.getUTCHours();
      const utcM = now.getUTCMinutes();
      const utcS = now.getUTCSeconds();
      const totalSecs = utcH * 3600 + utcM * 60 + utcS;
      const period = 8 * 3600;
      const secsInPeriod = totalSecs % period;
      const remaining = period - secsInPeriod;
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      setNextFunding(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    }
    calcCountdown();
    const t = setInterval(calcCountdown, 1000);
    return () => clearInterval(t);
  }, []);

  const items = [
    { label: "Contract Type", value: "Perpetual" },
    { label: "Settlement", value: "USDT" },
    { label: "Listing Date", value: "2021-04-02" },
    { label: "Delivery Date", value: "Perpetual" },
    { label: "Tick Size", value: "0.01" },
    { label: "Min Order Qty", value: "0.001" },
    {
      label: "Funding Rate",
      value: fundingRate !== null ? `${fundingRate.toFixed(4)}%` : "...",
    },
    { label: "Next Funding", value: nextFunding || "..." },
    {
      label: "Open Interest",
      value:
        openInterest !== null
          ? `${openInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${pair.base}`
          : "...",
    },
    { label: "Max Leverage", value: "100x" },
    { label: "Insurance Fund", value: "$1.23B" },
    {
      label: "Index Price",
      value:
        price > 0
          ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "...",
    },
    {
      label: "Mark Price",
      value:
        markPrice > 0
          ? `$${markPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "...",
    },
  ];

  return (
    <div
      className="h-full overflow-y-auto p-4"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,215,0,0.12)",
            }}
          >
            <p className="text-xs mb-1" style={{ color: "#6A6E78" }}>
              {item.label}
            </p>
            <p
              className="text-sm font-bold"
              style={{
                color:
                  item.label === "Funding Rate"
                    ? "#00FF88"
                    : item.label.includes("Price")
                      ? "#FFD700"
                      : "#F5F6F8",
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Data Tab ────────────────────────────────────────────────────────────────
function DataTab({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<
    Array<{ price: number; size: number; time: string; side: "buy" | "sell" }>
  >([]);
  const [asks, setAsks] = useState<
    Array<{ price: number; size: number; total: number }>
  >([]);
  const [bids, setBids] = useState<
    Array<{ price: number; size: number; total: number }>
  >([]);

  const fetchData = useCallback(async () => {
    try {
      const [depthRes, tradesRes] = await Promise.all([
        fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=15`),
        fetch(
          `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=20`,
        ),
      ]);
      const depthData = await depthRes.json();
      const tradesData = await tradesRes.json();

      const newAsks = (depthData.asks as [string, string][])
        .slice(0, 10)
        .map(([p, q]) => ({
          price: Number.parseFloat(p),
          size: Number.parseFloat(q),
          total: Number.parseFloat(p) * Number.parseFloat(q),
        }));
      const newBids = (depthData.bids as [string, string][])
        .slice(0, 10)
        .map(([p, q]) => ({
          price: Number.parseFloat(p),
          size: Number.parseFloat(q),
          total: Number.parseFloat(p) * Number.parseFloat(q),
        }));
      setAsks(newAsks);
      setBids(newBids);

      const newTrades = (
        tradesData as Array<{
          id: number;
          price: string;
          qty: string;
          time: number;
          isBuyerMaker: boolean;
        }>
      ).map((t) => ({
        price: Number.parseFloat(t.price),
        size: Number.parseFloat(t.qty),
        time: new Date(t.time).toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        side: t.isBuyerMaker ? ("sell" as const) : ("buy" as const),
      }));
      setTrades(newTrades);
    } catch {
      /* ignore */
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 3000);
    return () => clearInterval(t);
  }, [fetchData]);

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* Order Book */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ borderRight: "1px solid #1C1E23" }}
      >
        <div
          className="px-3 py-2 flex-shrink-0"
          style={{ borderBottom: "1px solid #1C1E23" }}
        >
          <span className="text-xs font-bold" style={{ color: "#8A8F98" }}>
            ORDER BOOK
          </span>
        </div>
        <div className="flex px-3 py-1 flex-shrink-0">
          <span className="flex-1 text-[10px]" style={{ color: "#4A4E58" }}>
            Price
          </span>
          <span
            className="flex-1 text-right text-[10px]"
            style={{ color: "#4A4E58" }}
          >
            Size
          </span>
          <span
            className="flex-1 text-right text-[10px]"
            style={{ color: "#4A4E58" }}
          >
            Total
          </span>
        </div>
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {asks.map((row) => (
            <div
              key={`ask-${row.price.toFixed(4)}`}
              className="flex px-3 py-0.5"
            >
              <span
                className="flex-1 text-xs font-mono"
                style={{ color: "#FF3366" }}
              >
                {row.price.toFixed(2)}
              </span>
              <span
                className="flex-1 text-right text-xs font-mono"
                style={{ color: "#8A8F98" }}
              >
                {row.size}
              </span>
              <span
                className="flex-1 text-right text-xs font-mono"
                style={{ color: "#4A4E58" }}
              >
                {row.total}
              </span>
            </div>
          ))}
          <div
            className="px-3 py-1.5"
            style={{
              borderTop: "1px solid #1C1E23",
              borderBottom: "1px solid #1C1E23",
            }}
          >
            <span
              className="text-sm font-bold font-mono"
              style={{ color: "#FFD700" }}
            >
              {asks.length > 0 && bids.length > 0
                ? (
                    ((asks[asks.length - 1]?.price ?? 0) +
                      (bids[0]?.price ?? 0)) /
                    2
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "—"}
            </span>
          </div>
          {bids.map((row) => (
            <div
              key={`bid-${row.price.toFixed(4)}`}
              className="flex px-3 py-0.5"
            >
              <span
                className="flex-1 text-xs font-mono"
                style={{ color: "#00FF88" }}
              >
                {row.price.toFixed(2)}
              </span>
              <span
                className="flex-1 text-right text-xs font-mono"
                style={{ color: "#8A8F98" }}
              >
                {row.size}
              </span>
              <span
                className="flex-1 text-right text-xs font-mono"
                style={{ color: "#4A4E58" }}
              >
                {row.total}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Trades */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-3 py-2 flex-shrink-0"
          style={{ borderBottom: "1px solid #1C1E23" }}
        >
          <span className="text-xs font-bold" style={{ color: "#8A8F98" }}>
            RECENT TRADES
          </span>
        </div>
        <div className="flex px-3 py-1 flex-shrink-0">
          <span className="flex-1 text-[10px]" style={{ color: "#4A4E58" }}>
            Price
          </span>
          <span
            className="flex-1 text-right text-[10px]"
            style={{ color: "#4A4E58" }}
          >
            Size
          </span>
          <span
            className="flex-1 text-right text-[10px]"
            style={{ color: "#4A4E58" }}
          >
            Time
          </span>
        </div>
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {trades.map((tr, i) => (
            <div key={`trade-${tr.time}-${i}`} className="flex px-3 py-0.5">
              <span
                className="flex-1 text-xs font-mono"
                style={{ color: tr.side === "buy" ? "#00FF88" : "#FF3366" }}
              >
                {tr.price.toFixed(2)}
              </span>
              <span
                className="flex-1 text-right text-xs font-mono"
                style={{ color: "#8A8F98" }}
              >
                {tr.size}
              </span>
              <span
                className="flex-1 text-right text-[10px] font-mono"
                style={{ color: "#4A4E58" }}
              >
                {tr.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feed Tab ────────────────────────────────────────────────────────────────
function FeedTab() {
  const NEWS = [
    {
      icon: "📈",
      title: "ETHUSDT Breaks Key Resistance at $2,200",
      time: "2 hours ago",
      desc: "Ethereum surged past $2,200 resistance as buying pressure intensified. Analysts eye $2,500 as next major target with strong on-chain activity.",
    },
    {
      icon: "⚡",
      title: "Bitcoin Dominance Rises to 52.3% Amid Altcoin Correction",
      time: "4 hours ago",
      desc: "BTC dominance climbing as capital rotates from altcoins. Market participants monitor $70K level for potential continuation.",
    },
    {
      icon: "🔥",
      title: "Futures Open Interest Hits All-Time High for SOL",
      time: "6 hours ago",
      desc: "Solana perpetual futures OI reached new ATH at $3.2B, suggesting significant leveraged positioning ahead of major protocol upgrade.",
    },
    {
      icon: "📊",
      title: "Binance Futures Funding Rate Update — April 2026",
      time: "8 hours ago",
      desc: "Positive funding rates across major pairs signal bullish sentiment. ETHUSDT rate at 0.0100%, BTC at 0.0080% per 8-hour period.",
    },
    {
      icon: "🌊",
      title: "Whale Alert: 12,500 ETH Moved to Derivatives Exchanges",
      time: "10 hours ago",
      desc: "Large wallet addresses transferred significant ETH to futures platforms, potentially signaling increased trading activity ahead.",
    },
    {
      icon: "💡",
      title: "SKCE Trading Tip: Managing Risk with Leverage",
      time: "12 hours ago",
      desc: "When using high leverage (50x-100x), always set stop-loss orders. Start with 20x leverage and scale up only after consistent profitable trades.",
    },
  ];

  return (
    <div
      className="h-full overflow-y-auto p-4 space-y-3"
      style={{ scrollbarWidth: "none" }}
    >
      {NEWS.map((item) => (
        <div
          key={item.title}
          className="rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderLeft: "3px solid #FFA500",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-white leading-tight">
                  {item.title}
                </h4>
              </div>
              <p className="text-[10px] mb-2" style={{ color: "#FFA500" }}>
                {item.time}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#8A8F98" }}
              >
                {item.desc}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FutureTrading() {
  const navigate = useNavigate();
  const { isLoggedIn, user, updateUser } = useAuth();

  const [pair, setPair] = useState(TRADING_PAIRS[0]);
  const [price, setPrice] = useState(0);
  const [price24h, setPrice24h] = useState({
    high: 0,
    low: 0,
    vol: 0,
    change: 0,
    changeRaw: 0,
  });
  const [markPrice, setMarkPrice] = useState(0);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const prevPrice = useRef(0);

  const [activeInterval, setActiveInterval] = useState<Interval>("1m");
  const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([
    "MA",
    "EMA",
    "MACD",
    "BOLL",
    "Mark",
  ]);
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<
    "Chart" | "Overview" | "Data" | "Feed"
  >("Chart");
  const [qty, setQty] = useState("");
  const [leverage, setLeverage] = useState(20);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch real Binance price
  useEffect(() => {
    async function fetch24h() {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair.binance}`,
        );
        const d = await res.json();
        const newPrice = Number.parseFloat(d.lastPrice);
        setPrice((p) => {
          prevPrice.current = p;
          return newPrice;
        });
        try {
          const markRes = await fetch(
            `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${pair.binance}`,
          );
          const markData = await markRes.json();
          setMarkPrice(Number.parseFloat(markData.markPrice));
        } catch {
          setMarkPrice(newPrice);
        }
        setPrice24h({
          high: Number.parseFloat(d.highPrice),
          low: Number.parseFloat(d.lowPrice),
          vol: Number.parseFloat(d.quoteVolume),
          change: Number.parseFloat(d.priceChangePercent),
          changeRaw: Number.parseFloat(d.priceChange),
        });
        if (prevPrice.current > 0) {
          setPriceFlash(newPrice > prevPrice.current ? "up" : "down");
          setTimeout(() => setPriceFlash(null), 600);
        }
      } catch {
        /* ignore */
      }
    }
    fetch24h();
    const iv = setInterval(fetch24h, 8000);
    return () => clearInterval(iv);
  }, [pair]);

  function toggleIndicator(ind: Indicator) {
    setActiveIndicators((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind],
    );
  }

  function handleTrade(side: OrderSide) {
    if (!isLoggedIn) {
      toast.error("Please login first");
      return;
    }
    const amount = Number.parseFloat(qty) || 0;
    if (amount <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    const margin = amount;
    if (!user || (user.balance || 0) < margin) {
      toast.error("Insufficient balance");
      return;
    }
    updateUser({ balance: (user.balance || 0) - margin });
    const position = {
      id: `pos_${Date.now()}`,
      symbol: pair.binance,
      type: side === "LONG" ? "long" : "short",
      entryPrice: price,
      leverage,
      margin,
      amount,
      timestamp: Date.now(),
    };
    try {
      const existing = JSON.parse(
        localStorage.getItem("skce_positions") || "[]",
      );
      localStorage.setItem(
        "skce_positions",
        JSON.stringify([...existing, position]),
      );
    } catch {}
    toast.success(`${side} $${amount} USDT @ $${price.toFixed(2)}`, {
      description: `Margin: $${margin.toFixed(2)} | ${leverage}x leverage | View in Positions`,
    });
    setQty("");
  }

  const priceDisplayColor =
    priceFlash === "up"
      ? "#21C57A"
      : priceFlash === "down"
        ? "#E24A4A"
        : "#21C57A";

  const formatVol = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    return `${(v / 1000).toFixed(1)}K`;
  };

  return (
    <>
      <div
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{
          background: "#0B0B0D",
          zIndex: 50,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ── Section 1: Top Navigation ── */}
        <header
          className="flex-shrink-0"
          style={{ background: "#0B0B0D", borderBottom: "1px solid #1C1E23" }}
        >
          <div className="flex items-center px-4 h-12">
            {/* Orange hamburger circle */}
            <div
              className="flex items-center justify-center flex-shrink-0 mr-3 cursor-pointer"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#F2A23A",
              }}
            >
              <div className="flex flex-col gap-[4px]">
                <span
                  style={{
                    display: "block",
                    width: 14,
                    height: 2,
                    background: "#000",
                    borderRadius: 1,
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: 14,
                    height: 2,
                    background: "#000",
                    borderRadius: 1,
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: 10,
                    height: 2,
                    background: "#000",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>

            {/* Nav tabs */}
            <div className="flex items-center gap-0 flex-1 overflow-x-auto">
              {(["Convert", "Spot", "Futures", "TradFi"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    className="px-3 py-1 text-sm whitespace-nowrap flex-shrink-0"
                    onClick={() => {
                      if (tab === "Convert") navigate({ to: "/convert" });
                      else if (tab === "Spot") navigate({ to: "/trading" });
                      else if (tab === "TradFi") navigate({ to: "/tradefi" });
                    }}
                    style={{
                      color: tab === "Futures" ? "#F5F6F8" : "#5E616A",
                      fontWeight: tab === "Futures" ? 700 : 400,
                      borderBottom:
                        tab === "Futures"
                          ? "2px solid #F5F6F8"
                          : "2px solid transparent",
                    }}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
          </div>
        </header>

        {/* ── Section 2: Pair Header ── */}
        <div
          className="flex-shrink-0 px-4 py-2"
          style={{ background: "#0B0B0D", borderBottom: "1px solid #1C1E23" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setShowPairSelector((s) => !s)}
                className="flex items-center gap-1"
              >
                <span
                  style={{ color: "#F5F6F8", fontSize: 22, fontWeight: 700 }}
                >
                  {pair.symbol}
                </span>
                <ChevronDown
                  style={{
                    color: "#8A8F98",
                    width: 16,
                    height: 16,
                    marginTop: 2,
                  }}
                />
              </button>
              <span
                style={{
                  color: "#E24A4A",
                  fontSize: 14,
                  fontWeight: 500,
                  marginTop: -2,
                }}
              >
                {price24h.change >= 0 ? "+" : ""}
                {price24h.change.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex flex-col items-center justify-center px-2 py-0.5"
                style={{
                  border: "1px solid #29C784",
                  borderRadius: 20,
                  minWidth: 42,
                }}
              >
                <span
                  style={{
                    color: "#29C784",
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  MM
                </span>
                <span
                  style={{ color: "#29C784", fontSize: 10, lineHeight: 1.2 }}
                >
                  0.00%
                </span>
              </div>
              <div
                className="flex items-center gap-2 px-2 py-1.5"
                style={{ background: "#2A2D34", borderRadius: 20 }}
              >
                <BarChart2
                  style={{ width: 16, height: 16, color: "#8A8F98" }}
                />
                <List style={{ width: 16, height: 16, color: "#8A8F98" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Sub-tabs ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4"
          style={{
            background: "#0B0B0D",
            borderBottom: "1px solid #1C1E23",
            height: 42,
          }}
        >
          <div className="flex items-center gap-4">
            {(["Chart", "Overview", "Data", "Feed"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSubTab(tab)}
                style={{
                  color: activeSubTab === tab ? "#F5F6F8" : "#6A6E78",
                  fontSize: 14,
                  fontWeight: activeSubTab === tab ? 600 : 400,
                  paddingBottom: 4,
                  borderBottom:
                    activeSubTab === tab
                      ? "2px solid #F5F6F8"
                      : "2px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Zap style={{ width: 20, height: 20, color: "#F5F6F8" }} />
            <button type="button" onClick={() => setIsFavorite((f) => !f)}>
              <Star
                style={{
                  width: 20,
                  height: 20,
                  color: isFavorite ? "#F2A23A" : "#F5F6F8",
                  fill: isFavorite ? "#F2A23A" : "none",
                }}
              />
            </button>
            <div className="relative">
              <Bell style={{ width: 20, height: 20, color: "#F5F6F8" }} />
              <span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#E24A4A" }}
              />
            </div>
            <Share2 style={{ width: 20, height: 20, color: "#F5F6F8" }} />
          </div>
        </div>

        {/* ── Section 4: Price (compact) ── */}
        <div
          className="flex-shrink-0 px-4 py-1.5"
          style={{ background: "#0B0B0D", borderBottom: "1px solid #1C1E23" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span style={{ color: "#6A6E78", fontSize: 11 }}>
                Last Traded Price ▾
              </span>
              <span
                className="font-mono font-bold transition-colors duration-300"
                style={{
                  color: priceDisplayColor,
                  fontSize: 28,
                  lineHeight: 1.1,
                }}
              >
                {price > 0
                  ? price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "---"}
              </span>
              <span style={{ color: "#7B808B", fontSize: 11, marginTop: 1 }}>
                Mark {markPrice > 0 ? markPrice.toFixed(2) : "---"}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-right">
              <div>
                <span style={{ color: "#7B808B", fontSize: 10 }}>24h High</span>
                <div
                  style={{ color: "#F5F6F8", fontSize: 12, fontWeight: 500 }}
                >
                  {price24h.high > 0 ? price24h.high.toFixed(2) : "---"}
                </div>
              </div>
              <div>
                <span style={{ color: "#7B808B", fontSize: 10 }}>24h Low</span>
                <div
                  style={{ color: "#F5F6F8", fontSize: 12, fontWeight: 500 }}
                >
                  {price24h.low > 0 ? price24h.low.toFixed(2) : "---"}
                </div>
              </div>
              <div>
                <span style={{ color: "#7B808B", fontSize: 10 }}>Turnover</span>
                <div
                  style={{ color: "#F5F6F8", fontSize: 12, fontWeight: 500 }}
                >
                  {price24h.vol > 0 ? formatVol(price24h.vol) : "---"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 5: Announcement banner ── */}
        <AnimatePresence>
          {showAnnouncement && (
            <motion.div
              initial={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex-shrink-0 flex items-center px-4 py-1.5 gap-2"
              style={{
                background: "#0B0B0D",
                borderBottom: "1px solid #1C1E23",
              }}
            >
              <span style={{ fontSize: 14 }}>📢</span>
              <span style={{ color: "#F5F6F8", fontSize: 12, flex: 1 }}>
                Delisting of CTSIUSDT Perpetual Contract
              </span>
              <button type="button" onClick={() => setShowAnnouncement(false)}>
                <X style={{ width: 14, height: 14, color: "#8A8F98" }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Section 6: Combined sticky toolbar (intervals + indicators) ── */}
        <div
          className="flex-shrink-0 flex items-center gap-1 px-3 overflow-x-auto"
          style={{
            background: "#0B0B0D",
            borderBottom: "1px solid #1C1E23",
            height: 40,
            scrollbarWidth: "none",
          }}
        >
          {/* Time label */}
          <span
            style={{
              color: "#6A6E78",
              fontSize: 12,
              flexShrink: 0,
              marginRight: 2,
            }}
          >
            Time
          </span>
          {/* Interval buttons */}
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setActiveInterval(iv)}
              className="px-2 py-0.5 flex-shrink-0"
              style={{
                color: activeInterval === iv ? "#F5F6F8" : "#6A6E78",
                fontWeight: activeInterval === iv ? 700 : 400,
                fontSize: 12,
                background:
                  activeInterval === iv
                    ? "rgba(245,246,248,0.08)"
                    : "transparent",
                borderRadius: 4,
              }}
            >
              {iv}
            </button>
          ))}
          {/* Separator */}
          <div
            style={{
              width: 1,
              height: 16,
              background: "#2A2D34",
              flexShrink: 0,
              margin: "0 4px",
            }}
          />
          {/* Indicator buttons */}
          {INDICATORS.map((ind) => (
            <button
              key={ind}
              type="button"
              onClick={() => toggleIndicator(ind)}
              className="flex-shrink-0 px-2 py-0.5"
              style={{
                color: activeIndicators.includes(ind) ? "#F5F6F8" : "#6A6E78",
                fontWeight: activeIndicators.includes(ind) ? 700 : 400,
                fontSize: 12,
                background: activeIndicators.includes(ind)
                  ? "rgba(242,162,58,0.12)"
                  : "transparent",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {ind}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Tool icons */}
          <Pencil
            style={{
              width: 14,
              height: 14,
              color: "#6A6E78",
              flexShrink: 0,
              cursor: "pointer",
            }}
          />
          <Radio
            style={{
              width: 14,
              height: 14,
              color: "#6A6E78",
              flexShrink: 0,
              cursor: "pointer",
              marginLeft: 8,
            }}
          />
          <Grid
            style={{
              width: 14,
              height: 14,
              color: "#6A6E78",
              flexShrink: 0,
              cursor: "pointer",
              marginLeft: 8,
            }}
          />
          {/* Fullscreen button — mobile only */}
          <button
            type="button"
            className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-lg ml-2 flex-shrink-0"
            style={{ background: "#1A1D24", color: "#F5F6F8", fontSize: 11 }}
            onClick={() => setIsFullscreen(true)}
            data-ocid="futures.fullscreen_button"
          >
            <Maximize2 size={14} />
            <span>Full</span>
          </button>
        </div>

        {/* ── Section 7: Chart / Overview / Data / Feed ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: "#0B0B0D",
            position: "relative",
          }}
        >
          {activeSubTab === "Chart" && (
            <TradingViewChart symbol={pair.binance} interval={activeInterval} />
          )}
          {activeSubTab === "Overview" && (
            <OverviewTab price={price} markPrice={markPrice} pair={pair} />
          )}
          {activeSubTab === "Data" && <DataTab symbol={pair.binance} />}
          {activeSubTab === "Feed" && <FeedTab />}
        </div>

        {/* ── Section 8: Bottom Trading Panel (compact) ── */}
        <div
          className="flex-shrink-0 px-3 pt-1.5 pb-1"
          style={{ background: "#0D0F14", borderTop: "1px solid #1C1E23" }}
        >
          {/* Top row: Quantity USDT + Leverage selector */}
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-1.5"
              style={{
                background: "#1A1D24",
                borderRadius: 10,
                border: "1px solid #2A2D34",
              }}
            >
              <span
                style={{
                  color: "#8A8F98",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                Amount (USDT)
              </span>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-right outline-none w-full text-sm font-bold"
                style={{ color: "#F5F6F8", fontFamily: "monospace" }}
                data-ocid="futures.input"
              />
              <span style={{ color: "#F0B90B", fontSize: 12, fontWeight: 700 }}>
                USDT
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1.5"
              style={{
                background: "#1A1D24",
                borderRadius: 10,
                border: "1px solid #2A2D34",
              }}
            >
              <span style={{ color: "#8A8F98", fontSize: 11 }}>Lev</span>
              <select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="bg-transparent outline-none text-sm font-bold cursor-pointer"
                style={{
                  color: "#F0B90B",
                  fontFamily: "monospace",
                  border: "none",
                }}
                data-ocid="futures.leverage_select"
              >
                {[1, 2, 3, 5, 10, 20, 25, 50, 75, 100].map((lv) => (
                  <option
                    key={lv}
                    value={lv}
                    style={{ background: "#1A1D24", color: "#F5F6F8" }}
                  >
                    {lv}x
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Long / Short buttons */}
          <div className="flex items-stretch gap-2">
            {/* Long button */}
            <button
              type="button"
              onClick={() => handleTrade("LONG")}
              className="flex-1 flex flex-col items-center justify-center py-2 active:scale-95 transition-all"
              style={{
                background: "linear-gradient(135deg, #0ECB81 0%, #0AA066 100%)",
                borderRadius: 14,
                boxShadow:
                  "0 0 18px rgba(14,203,129,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                border: "1px solid rgba(14,203,129,0.3)",
              }}
              data-ocid="futures.long_button"
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span
                  style={{
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  ▲ LONG
                </span>
              </div>
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  letterSpacing: "0.3px",
                }}
              >
                {price > 0 ? price.toFixed(2) : "---"}
              </span>
            </button>

            {/* Short button */}
            <button
              type="button"
              onClick={() => handleTrade("SHORT")}
              className="flex-1 flex flex-col items-center justify-center py-2 active:scale-95 transition-all"
              style={{
                background: "linear-gradient(135deg, #F6465D 0%, #C43346 100%)",
                borderRadius: 14,
                boxShadow:
                  "0 0 18px rgba(246,70,93,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                border: "1px solid rgba(246,70,93,0.3)",
              }}
              data-ocid="futures.short_button"
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span
                  style={{
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  ▼ SHORT
                </span>
              </div>
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  letterSpacing: "0.3px",
                }}
              >
                {price > 0 ? (price - 0.01).toFixed(2) : "---"}
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 10,
                  marginTop: 1,
                }}
              >
                {leverage}x · Liq: $
                {price > 0 && qty
                  ? (price - (price / leverage) * 0.9).toFixed(0)
                  : "---"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Section 9: Bottom App Nav ── */}
        <nav
          className="flex-shrink-0 flex items-center justify-around py-2"
          style={{ background: "#14161B", borderTop: "1px solid #1C1E23" }}
        >
          {[
            { icon: <Home size={24} />, label: "Home", to: "/" },
            {
              icon: <TrendingUp size={24} />,
              label: "Markets",
              to: "/crypto",
            },
            {
              icon: <BarChart2 size={24} />,
              label: "Trade",
              to: "/futures",
              active: true,
            },
            {
              icon: <PieChart size={24} />,
              label: "Positions",
              to: "/positions",
            },
            { icon: <Wallet size={24} />, label: "Assets", to: "/wallet" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center gap-0.5"
              data-ocid={`nav.${item.label.toLowerCase()}_link`}
            >
              <span style={{ color: item.active ? "#F5F6F8" : "#6A6E78" }}>
                {item.icon}
              </span>
              <span
                style={{
                  color: item.active ? "#F5F6F8" : "#6A6E78",
                  fontSize: 11,
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* ── Pair Selector Modal ── */}
        <AnimatePresence>
          {showPairSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-start justify-center pt-20"
              style={{ background: "rgba(0,0,0,0.7)", zIndex: 100 }}
              onClick={() => setShowPairSelector(false)}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="rounded-2xl p-4 w-72"
                style={{ background: "#1C1E23", border: "1px solid #2A2D34" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ color: "#F5F6F8", fontWeight: 700 }}>
                    Select Pair
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPairSelector(false)}
                  >
                    <X style={{ width: 18, height: 18, color: "#8A8F98" }} />
                  </button>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                  style={{ background: "#0B0B0D" }}
                >
                  <Search style={{ width: 14, height: 14, color: "#8A8F98" }} />
                  <input
                    placeholder="Search pairs..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "#F5F6F8" }}
                  />
                </div>
                {TRADING_PAIRS.map((p) => (
                  <button
                    key={p.symbol}
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
                    onClick={() => {
                      setPair(p);
                      setShowPairSelector(false);
                    }}
                  >
                    <span
                      style={{
                        color: pair.symbol === p.symbol ? "#F2A23A" : "#F5F6F8",
                        fontWeight: 600,
                      }}
                    >
                      {p.symbol}
                    </span>
                    <span style={{ color: "#6A6E78", fontSize: 12 }}>
                      Perpetual
                    </span>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Fullscreen Chart Overlay ── */}
      {isFullscreen && (
        <div
          className="fixed inset-0 flex flex-col"
          style={{ background: "#0B0B0D", zIndex: 200 }}
        >
          {/* Close bar */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4"
            style={{ height: 44, borderBottom: "1px solid #1C1E23" }}
          >
            <span style={{ color: "#F5F6F8", fontWeight: 700, fontSize: 15 }}>
              {pair.symbol} Perpetual
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              data-ocid="futures.close_button"
            >
              <X style={{ width: 24, height: 24, color: "#F5F6F8" }} />
            </button>
          </div>
          {/* Chart fills remaining space */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <TradingViewChart symbol={pair.binance} interval={activeInterval} />
          </div>
        </div>
      )}
    </>
  );
}
