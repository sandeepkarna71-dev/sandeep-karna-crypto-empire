import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  Award,
  BarChart2,
  CheckCircle,
  ChevronRight,
  Coins,
  Crown,
  ExternalLink,
  Flame,
  Gift,
  Heart,
  Play,
  RefreshCw,
  Rocket,
  Shield,
  ShieldCheck,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function loadLS<T>(key: string, def: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? def;
  } catch {
    return def;
  }
}

type AdminTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  adUrl: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  steps: string[];
  reward: number;
  date: string;
};

const EARN_CATEGORIES = [
  {
    key: "Daily",
    label: "Daily Tasks",
    icon: <Flame className="w-6 h-6" style={{ color: "#FFD700" }} />,
    desc: "Login bonus, check-in streak, daily rewards",
    glow: "rgba(255,215,0,0.15)",
    border: "rgba(255,215,0,0.2)",
  },
  {
    key: "Social",
    label: "Social Tasks",
    icon: <Users className="w-6 h-6" style={{ color: "#00F0FF" }} />,
    desc: "Follow, like, comment on social channels",
    glow: "rgba(0,240,255,0.12)",
    border: "rgba(0,240,255,0.2)",
  },
  {
    key: "Video",
    label: "Video Tasks",
    icon: <Video className="w-6 h-6" style={{ color: "#A855F7" }} />,
    desc: "Watch vlogs, ads, and video content",
    glow: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.2)",
  },
  {
    key: "Trading",
    label: "Trading Tasks",
    icon: <TrendingUp className="w-6 h-6" style={{ color: "#00FF88" }} />,
    desc: "Trade signals, buy/sell crypto tasks",
    glow: "rgba(0,255,136,0.1)",
    border: "rgba(0,255,136,0.2)",
  },
  {
    key: "Referral",
    label: "Referral Tasks",
    icon: <Heart className="w-6 h-6" style={{ color: "#FF3366" }} />,
    desc: "Invite friends and earn $1 per referral",
    glow: "rgba(255,51,102,0.1)",
    border: "rgba(255,51,102,0.2)",
  },
  {
    key: "Bonus",
    label: "Bonus Tasks",
    icon: <Gift className="w-6 h-6" style={{ color: "#FFD700" }} />,
    desc: "Special bonus and promo rewards",
    glow: "rgba(255,215,0,0.1)",
    border: "rgba(255,215,0,0.15)",
  },
  {
    key: "General",
    label: "General Tasks",
    icon: <Zap className="w-6 h-6" style={{ color: "#FFD700" }} />,
    desc: "Other tasks added by admin",
    glow: "rgba(255,215,0,0.08)",
    border: "rgba(255,215,0,0.12)",
  },
];

function CategorySection({
  cat,
  tasks,
}: { cat: (typeof EARN_CATEGORIES)[0]; tasks: AdminTask[] }) {
  const catTasks = tasks.filter((t) => (t.category || "General") === cat.key);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      data-ocid={`home.earn.${cat.key.toLowerCase()}.section`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${cat.border}`,
      }}
    >
      <div
        className="p-5 border-b"
        style={{ borderColor: cat.border, background: `${cat.glow}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {cat.icon}
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">
                {cat.label}
              </h3>
              <p className="text-xs text-white/40">{cat.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {catTasks.length > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,215,0,0.15)",
                  color: "#FFD700",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                {catTasks.length}
              </span>
            )}
            <Link to="/earn">
              <button
                type="button"
                data-ocid="home.earn.link"
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.2)",
                  color: "#FFD700",
                }}
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4">
        {catTasks.length === 0 ? (
          <div
            data-ocid={`home.earn.${cat.key.toLowerCase()}.empty_state`}
            className="text-center py-6 text-white/30"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {cat.icon}
            </div>
            <p className="text-xs font-medium">No tasks yet in this category</p>
            <p className="text-[10px] mt-0.5 text-white/20">
              Admin will add tasks soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catTasks.slice(0, 4).map((task, i) => (
              <div
                key={task.id}
                data-ocid={`home.earn.${cat.key.toLowerCase()}.item.${i + 1}`}
                className="rounded-xl p-3 transition-all hover:border-[#FFD700]/30"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {task.imageUrl && (
                  <img
                    src={task.imageUrl}
                    alt={task.title}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                {task.videoUrl && !task.imageUrl && (
                  <div
                    className="w-full h-24 flex items-center justify-center rounded-lg mb-2"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <Play className="w-8 h-8 text-white/20" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-white text-xs leading-tight">
                    {task.title}
                  </span>
                  <span
                    className="text-xs font-bold shrink-0"
                    style={{ color: "#00FF88" }}
                  >
                    ${task.reward.toFixed(2)}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-white/40 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                {task.adUrl && (
                  <a
                    href={task.adUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 mb-2"
                    style={{ color: "#FFD700" }}
                  >
                    <ExternalLink className="w-3 h-3" /> Open Link
                  </a>
                )}
                <Link to="/earn">
                  <button
                    type="button"
                    data-ocid="home.earn.task.primary_button"
                    className="text-xs font-bold w-full h-7 rounded-lg flex items-center justify-center gap-1 transition-all"
                    style={{
                      background: "rgba(255,215,0,0.1)",
                      border: "1px solid rgba(255,215,0,0.2)",
                      color: "#FFD700",
                    }}
                  >
                    Do Task <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TradingHub() {
  const [tradeCount] = useState(() => {
    try {
      return Number.parseInt(
        localStorage.getItem("skce_trade_volume") || "0",
        10,
      );
    } catch {
      return 0;
    }
  });
  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [activePair, setActivePair] = useState<
    "BTC/USDT" | "ETH/USDT" | "SOL/USDT"
  >("BTC/USDT");
  const [selectedLev, setSelectedLev] = useState(20);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const [b, e, s] = await Promise.all([
          fetch(
            "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
          ).then((r) => r.json()),
          fetch(
            "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT",
          ).then((r) => r.json()),
          fetch(
            "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
          ).then((r) => r.json()),
        ]);
        setBtcPrice(Number.parseFloat(b.price));
        setEthPrice(Number.parseFloat(e.price));
        setSolPrice(Number.parseFloat(s.price));
      } catch {}
    }
    fetchPrices();
    const iv = setInterval(fetchPrices, 10000);
    return () => clearInterval(iv);
  }, []);

  const tiers = [
    { label: "BEGINNER", leverage: "20x", min: 0, max: 10, color: "#FF8C00" },
    { label: "PRO", leverage: "50x", min: 10, max: 50, color: "#FF3300" },
    {
      label: "BEAST MODE 🔥",
      leverage: "100x",
      min: 50,
      max: 999,
      color: "#FFD700",
    },
  ];
  const currentTierIdx = tradeCount >= 50 ? 2 : tradeCount >= 10 ? 1 : 0;
  const currentTier = tiers[currentTierIdx];
  const nextTier = tiers[currentTierIdx + 1];
  const progress = nextTier
    ? ((tradeCount - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;
  const tradesNeeded = nextTier ? nextTier.min - tradeCount : 0;

  return (
    <section className="pt-28 pb-0 px-3 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0D0F14 0%, #130800 100%)",
            border: "1px solid rgba(255,100,0,0.35)",
            boxShadow:
              "0 0 60px rgba(255,80,0,0.18), 0 0 120px rgba(255,80,0,0.08), inset 0 0 80px rgba(255,60,0,0.04)",
          }}
        >
          {/* Fire radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,80,0,0.2) 0%, transparent 65%)",
            }}
          />

          {/* Animated top glow line */}
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, transparent 0%, #FF6B00 40%, #FFD700 60%, transparent 100%)",
              opacity: 0.7,
            }}
          />

          <div className="p-4 relative z-10">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(255,107,0,0.2)",
                    border: "1px solid rgba(255,107,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap className="w-4 h-4" style={{ color: "#FF6B00" }} />
                </div>
                <div>
                  <div className="font-black text-white text-sm tracking-widest uppercase">
                    ⚡ BEAST TRADING HUB
                  </div>
                  <div
                    style={{
                      color: "rgba(255,107,0,0.8)",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    REAL MONEY · REAL TRADING
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                  style={{
                    background: "rgba(14,203,129,0.15)",
                    border: "1px solid rgba(14,203,129,0.4)",
                    color: "#0ECB81",
                  }}
                >
                  ● LIVE
                </span>
              </div>
            </div>

            {/* Live Prices Row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                {
                  label: "BTC/USDT",
                  price: btcPrice,
                  pair: "BTC/USDT" as const,
                },
                {
                  label: "ETH/USDT",
                  price: ethPrice,
                  pair: "ETH/USDT" as const,
                },
                {
                  label: "SOL/USDT",
                  price: solPrice,
                  pair: "SOL/USDT" as const,
                },
              ].map((item) => (
                <button
                  key={item.pair}
                  type="button"
                  onClick={() => setActivePair(item.pair)}
                  className="flex flex-col items-center py-2 px-1 rounded-xl transition-all"
                  style={{
                    background:
                      activePair === item.pair
                        ? "rgba(255,107,0,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      activePair === item.pair
                        ? "1px solid rgba(255,107,0,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                    boxShadow:
                      activePair === item.pair
                        ? "0 0 12px rgba(255,107,0,0.2)"
                        : "none",
                  }}
                >
                  <span
                    style={{ color: "#8A8F98", fontSize: 9, fontWeight: 600 }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      color: activePair === item.pair ? "#FFD700" : "#F5F6F8",
                      fontSize: 14,
                      fontWeight: 800,
                      fontFamily: "monospace",
                    }}
                  >
                    {item.price > 0
                      ? item.price > 999
                        ? `$${(item.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        : `$${item.price.toFixed(2)}`
                      : "---"}
                  </span>
                </button>
              ))}
            </div>

            {/* Leverage Tier */}
            <div
              className="flex items-center gap-3 mb-3 p-3 rounded-xl"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <div
                  className="font-black text-3xl tracking-tight"
                  style={{
                    color: currentTier.color,
                    textShadow: `0 0 20px ${currentTier.color}80`,
                  }}
                >
                  {currentTier.leverage}
                </div>
                <div
                  className="text-xs font-bold"
                  style={{ color: currentTier.color }}
                >
                  {currentTier.label}
                </div>
                <div className="text-white/40 text-xs">YOUR LEVERAGE</div>
              </div>
              <div className="flex-1">
                {nextTier && (
                  <>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{tradeCount} trades</span>
                      <span style={{ color: nextTier.color }}>
                        {tradesNeeded} → {nextTier.leverage}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                          boxShadow: `0 0 8px ${nextTier.color}60`,
                        }}
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2 mt-2">
                  {tiers.map((tier, i) => (
                    <div
                      key={tier.label}
                      className="flex-1 text-center py-1 rounded-lg"
                      style={{
                        background:
                          i <= currentTierIdx
                            ? "rgba(255,107,0,0.15)"
                            : "rgba(255,255,255,0.04)",
                        border: `1px solid ${i <= currentTierIdx ? "rgba(255,107,0,0.4)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div
                        style={{
                          color: i <= currentTierIdx ? tier.color : "#6A6E78",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {tier.leverage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Leverage selector */}
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: "#8A8F98", fontSize: 11 }}>
                Quick Leverage:
              </span>
              <div className="flex gap-1 flex-1">
                {[10, 20, 50, 75, 100].map((lv) => (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setSelectedLev(lv)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background:
                        selectedLev === lv
                          ? "rgba(255,107,0,0.25)"
                          : "rgba(255,255,255,0.06)",
                      border:
                        selectedLev === lv
                          ? "1px solid rgba(255,107,0,0.6)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color: selectedLev === lv ? "#FF6B00" : "#8A8F98",
                      boxShadow:
                        selectedLev === lv
                          ? "0 0 8px rgba(255,107,0,0.3)"
                          : "none",
                    }}
                  >
                    {lv}x
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Link to="/futures">
              <motion.button
                type="button"
                data-ocid="home.trade_now.primary_button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-xl font-black text-base tracking-wider flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF3300)",
                  boxShadow:
                    "0 0 30px rgba(255,80,0,0.5), 0 4px 20px rgba(255,50,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                  color: "#fff",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                    animation: "shimmer 2s infinite",
                  }}
                />
                <Zap className="w-5 h-5" />
                TRADE NOW · {selectedLev}x LEVERAGE · LIVE {activePair}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Home() {
  const { user, isLoggedIn } = useAuth();
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [vlogs, setVlogs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    setAdminTasks(loadLS<AdminTask[]>("sce_admin_tasks", []));
    setAds(loadLS<any[]>("sce_admin_ads", []));
    setVlogs(loadLS<any[]>("sce_admin_vlogs", []));
    setAnnouncements(loadLS<any[]>("sce_admin_announcements", []));
  }, []);

  const announcementText =
    announcements.length > 0
      ? announcements.map((a: any) => a.title).join("  •  ")
      : "Earn up to 500 USDT daily  •  Daily Spin Rewards  •  500+ Earning Methods  •  Referral bonus: $1 per invite  •  P2P Exchange Now Live";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Animated grid background */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Radial glows */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 15% 20%, rgba(255,215,0,0.05) 0%, transparent 50%), radial-gradient(ellipse at 85% 80%, rgba(0,240,255,0.04) 0%, transparent 50%)",
        }}
      />

      {/* Announcement ticker */}
      <div
        className="fixed top-16 left-0 right-0 z-40 py-2 overflow-hidden"
        style={{
          background: "rgba(255,215,0,0.06)",
          borderBottom: "1px solid rgba(255,215,0,0.15)",
        }}
      >
        <div
          className="animate-marquee text-xs font-medium"
          style={{ color: "#FFD700" }}
        >
          {[announcementText, announcementText].map((t, i) => (
            <span key={t + String(i)} className="px-8 whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Beast Trading Hub */}
      <TradingHub />

      {/* Ads */}
      {ads.length > 0 && (
        <section className="pt-4 pb-6 px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display text-xl font-bold text-white">
                Promotions &amp; <span className="gold-gradient">Offers</span>
              </h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,215,0,0.15)",
                  color: "#FFD700",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                SPONSORED
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ads.map((ad: any, i: number) => (
                <motion.a
                  key={ad.id}
                  href={ad.linkUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl overflow-hidden block transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,215,0,0.15)",
                  }}
                >
                  {ad.imageUrl && (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  {ad.videoUrl && !ad.imageUrl && (
                    <div
                      className="w-full h-36 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <Play className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(255,215,0,0.15)",
                          color: "#FFD700",
                        }}
                      >
                        AD
                      </span>
                      <h3 className="font-bold text-white text-sm">
                        {ad.title}
                      </h3>
                    </div>
                    <p className="text-xs text-white/40">{ad.description}</p>
                    {ad.linkUrl && (
                      <div
                        className="flex items-center gap-1 mt-2 text-xs"
                        style={{ color: "#FFD700" }}
                      >
                        <ExternalLink className="w-3 h-3" /> Visit
                      </div>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      <section
        className="pt-6 pb-20 px-4 relative z-10 overflow-hidden"
        aria-label="Hero section"
      >
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="relative">
              <img
                src="/assets/uploads/IMG_20260303_214406-1.jpg"
                alt="Sandeep Karna - Founder of SKCE"
                className="w-24 h-24 rounded-full object-cover border-4"
                style={{
                  borderColor: "#FFD700",
                  boxShadow: "0 0 30px rgba(255,215,0,0.4)",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                }}
              >
                <Crown className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
            <div
              className="mt-2 text-sm font-bold"
              style={{ color: "#FFD700" }}
            >
              Sandeep Karna
            </div>
            <div className="text-xs text-white/30">Crypto Empire Founder</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span
              className="inline-block mb-6 text-sm px-4 py-1.5 rounded-full font-bold"
              style={{
                background: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.3)",
                color: "#FFD700",
              }}
            >
              🏆 #1 Crypto Earning Platform - SKCE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}
          >
            Earn Daily <span className="gold-gradient">10-100 USD</span>
            <br />
            <span className="text-white">with SKCE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join Sandeep Karn Crypto Empire — the trusted platform for daily
            crypto earnings through tasks, trading, and referrals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {isLoggedIn ? (
              <Link to="/earn">
                <button
                  type="button"
                  data-ocid="home.primary_button"
                  className="glow-btn-yellow px-8 py-3 rounded-xl font-bold text-base flex items-center gap-2"
                >
                  Start Earning <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <button
                    type="button"
                    data-ocid="home.primary_button"
                    className="glow-btn-yellow px-8 py-3 rounded-xl font-bold text-base flex items-center gap-2"
                  >
                    Join Now <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link to="/earn">
                  <button
                    type="button"
                    data-ocid="home.secondary_button"
                    className="px-8 py-3 rounded-xl font-bold text-base flex items-center gap-2 transition-all"
                    style={{
                      background: "rgba(0,240,255,0.08)",
                      border: "1px solid rgba(0,240,255,0.3)",
                      color: "#00F0FF",
                    }}
                  >
                    Explore Market
                  </button>
                </Link>
              </>
            )}
          </motion.div>

          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(0,255,136,0.08)",
                border: "1px solid rgba(0,255,136,0.2)",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
              <span
                className="text-sm font-medium"
                style={{ color: "#00FF88" }}
              >
                Balance: ${(user?.balance || 0).toFixed(2)} USDT
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section
        className="py-16 px-4 relative z-10"
        aria-labelledby="about-heading"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span
              className="inline-block mb-4 text-xs px-3 py-1 rounded-full font-bold tracking-widest uppercase"
              style={{
                background: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.2)",
                color: "#FFD700",
              }}
            >
              About SKCE
            </span>
            <h2
              id="about-heading"
              className="font-display text-3xl md:text-4xl font-bold text-white mb-4"
            >
              What is{" "}
              <span className="gold-gradient">Sandeep Karn Crypto Empire</span>?
            </h2>
            <p className="text-white/40 text-lg max-w-3xl mx-auto leading-relaxed">
              SKCE is a trusted online crypto earning platform founded by
              Sandeep Karna. Our platform lets you earn 10-100 USD daily through
              crypto tasks, trading, watching vlogs, and referring friends — all
              with real, withdrawable USDT earnings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                label: "Trusted & Scam-Free",
                desc: "SKCE is a real, verified platform. All earnings are legitimate and withdrawable to your crypto wallet.",
                color: "#FFD700",
              },
              {
                icon: Coins,
                label: "Daily Crypto Earnings",
                desc: "Earn 10-100 USD every day by completing tasks, trading crypto, and engaging with our content.",
                color: "#00FF88",
              },
              {
                icon: Users,
                label: "Growing Community",
                desc: "Join thousands of members already earning daily with Sandeep Karn Crypto Empire.",
                color: "#00F0FF",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-6 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${item.color}20`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">
                    {item.label}
                  </h3>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="py-16 px-4 relative z-10"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2
              id="how-it-works-heading"
              className="font-display text-3xl md:text-4xl font-bold text-white mb-4"
            >
              How It <span className="gold-gradient">Works</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Start earning with SKCE in 3 simple steps.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Rocket,
                label: "Register Free",
                desc: "Create your free SKCE account in seconds. No investment required to get started.",
                color: "#FFD700",
              },
              {
                step: "02",
                icon: CheckCircle,
                label: "Complete Tasks",
                desc: "Watch videos, follow social channels, trade crypto, and complete daily tasks to earn USDT.",
                color: "#00FF88",
              },
              {
                step: "03",
                icon: Wallet,
                label: "Withdraw Earnings",
                desc: "Withdraw your USDT earnings directly to your crypto wallet (USDT, BTC, ETH, SOL).",
                color: "#00F0FF",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-2xl p-6 relative"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${item.color}20`,
                  }}
                >
                  <div
                    className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                    }}
                  >
                    {item.step}
                  </div>
                  <div className="flex justify-center mb-4 pt-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}12` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 text-center">
                    {item.label}
                  </h3>
                  <p className="text-sm text-white/40 text-center">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link to="/signup">
              <button
                type="button"
                data-ocid="home.howitworks.primary_button"
                className="glow-btn-yellow px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
              >
                Join Now — It&apos;s Free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="py-16 px-4 relative z-10"
        aria-labelledby="earning-proof-heading"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2
              id="earning-proof-heading"
              className="font-display text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Earning <span className="gold-gradient">Proof</span> &amp; Stats
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                val: "2,400+",
                label: "Active Members",
                icon: Users,
                color: "#FFD700",
              },
              {
                val: "$10-100",
                label: "Daily Earnings",
                icon: Coins,
                color: "#00FF88",
              },
              {
                val: "500+",
                label: "Earning Methods",
                icon: Zap,
                color: "#00F0FF",
              },
              {
                val: "$500",
                label: "Max Daily Limit",
                icon: Award,
                color: "#A855F7",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${stat.color}20`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${stat.color}12` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="font-display text-2xl font-bold gold-gradient mb-1">
                    {stat.val}
                  </div>
                  <div className="text-xs text-white/30">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Spin */}
      <section className="py-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
            data-ocid="home.spin.section"
            style={{
              background: "rgba(255,215,0,0.04)",
              border: "1px solid rgba(255,215,0,0.2)",
              boxShadow: "0 0 30px rgba(255,215,0,0.06)",
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
              style={{
                border: "3px solid rgba(255,215,0,0.4)",
                background: "rgba(255,215,0,0.08)",
                animation: "pulse-yellow 2s ease-in-out infinite",
              }}
            >
              <RefreshCw className="w-10 h-10" style={{ color: "#FFD700" }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h3 className="font-display font-bold text-xl text-white">
                  Daily Spin
                </h3>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,215,0,0.1)",
                    border: "1px solid rgba(255,215,0,0.25)",
                    color: "#FFD700",
                  }}
                >
                  Once per day
                </span>
              </div>
              <p className="text-sm text-white/40 mb-3">
                Spin the wheel every day to win $0.10 – $1.00 USDT instantly!
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Coins className="w-4 h-4" style={{ color: "#00FF88" }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#00FF88" }}
                >
                  $0.10 – $1.00 USDT per spin
                </span>
              </div>
            </div>
            <Link to="/earn">
              <button
                type="button"
                data-ocid="home.spin.primary_button"
                className="glow-btn-yellow px-6 py-3 rounded-xl font-bold shrink-0"
              >
                🎰 Spin Now <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Latest Vlogs */}
      <section
        className="py-10 px-4 relative z-10"
        aria-labelledby="vlogs-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2
              id="vlogs-heading"
              className="font-display text-2xl font-bold text-white"
            >
              Latest <span className="gold-gradient">Vlogs</span>
            </h2>
            <Link to="/vlog">
              <button
                type="button"
                data-ocid="home.vlog.link"
                className="flex items-center gap-1 text-sm font-medium transition-all"
                style={{ color: "#FFD700" }}
              >
                All Vlogs <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          {vlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {vlogs.slice(0, 3).map((v: any, i: number) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all"
                  data-ocid={`home.vlogs.item.${i + 1}`}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,215,0,0.1)",
                  }}
                  onClick={() =>
                    v.videoUrl && window.open(v.videoUrl, "_blank")
                  }
                >
                  <div
                    className="aspect-video relative flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    {v.thumbnailUrl ? (
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play
                        className="w-12 h-12"
                        style={{ color: "rgba(255,215,0,0.3)" }}
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2">
                      {v.title}
                    </h3>
                    <p className="text-xs text-white/30 mt-1 line-clamp-2">
                      {v.description}
                    </p>
                    {v.watchReward > 0 && (
                      <div className="mt-2">
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(255,215,0,0.1)",
                            border: "1px solid rgba(255,215,0,0.25)",
                            color: "#FFD700",
                          }}
                        >
                          +{v.watchReward} USDT
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 text-white/30"
              data-ocid="vlog.empty_state"
            >
              <Play
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: "rgba(255,215,0,0.15)" }}
              />
              <p className="text-sm">
                Vlogs coming soon. Admin will add videos.
              </p>
            </div>
          )}
        </div>
      </section>
      {/* Platform Features */}
      <section className="py-8 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-white mb-1">
              All Platform <span className="gold-gradient">Features</span>
            </h2>
            <p className="text-white/40 text-sm">
              Everything you need in one place
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                icon: TrendingUp,
                label: "Futures Trading",
                desc: "Trade with up to 100x leverage",
                link: "/futures",
                color: "#FF6B00",
              },
              {
                icon: BarChart2,
                label: "Spot Trading",
                desc: "Buy & sell crypto instantly",
                link: "/trading",
                color: "#00F0FF",
              },
              {
                icon: ArrowLeftRight,
                label: "P2P Exchange",
                desc: "Trade peer-to-peer with escrow",
                link: "/p2p",
                color: "#00FF88",
              },
              {
                icon: Wallet,
                label: "My Wallet",
                desc: "Deposit, withdraw, manage funds",
                link: "/wallet",
                color: "#FFD700",
              },
              {
                icon: ShieldCheck,
                label: "KYC Verify",
                desc: "Verify identity for full access",
                link: "/kyc",
                color: "#00FF88",
              },
              {
                icon: Zap,
                label: "Earn",
                desc: "500+ earning methods",
                link: "/earn",
                color: "#FFD700",
              },
            ].map((feat, idx) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
              >
                <Link to={feat.link}>
                  <div
                    className="rounded-2xl p-4 h-full cursor-pointer hover:scale-[1.03] transition-transform"
                    style={{
                      background: `${feat.color}08`,
                      border: `1px solid ${feat.color}30`,
                      boxShadow: `0 0 16px ${feat.color}0a`,
                    }}
                    data-ocid={`home.${feat.label.toLowerCase().replace(/\s+/g, "_")}.card`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        background: `${feat.color}15`,
                        boxShadow: `0 0 12px ${feat.color}25`,
                      }}
                    >
                      <feat.icon
                        className="w-5 h-5"
                        style={{ color: feat.color }}
                      />
                    </div>
                    <div className="font-bold text-white text-sm mb-1">
                      {feat.label}
                    </div>
                    <div className="text-xs text-white/40">{feat.desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to Earn */}
      <section
        className="py-10 px-4 relative z-10"
        aria-labelledby="ways-to-earn-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2
              id="ways-to-earn-heading"
              className="font-display text-3xl font-bold text-white mb-2"
            >
              Ways to <span className="gold-gradient">Earn</span>
            </h2>
            <p className="text-white/40">
              Choose from 500+ earning methods across all categories
            </p>
          </div>
          <div className="space-y-6">
            {EARN_CATEGORIES.map((cat) => (
              <CategorySection key={cat.key} cat={cat} tasks={adminTasks} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/earn">
              <button
                type="button"
                data-ocid="home.earn.primary_button"
                className="glow-btn-yellow px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
              >
                Start Earning Now <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Referral quick */}
      <section className="py-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
            data-ocid="home.referral.section"
            style={{
              background: "rgba(255,51,102,0.04)",
              border: "1px solid rgba(255,51,102,0.15)",
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,51,102,0.08)",
                border: "2px solid rgba(255,51,102,0.25)",
              }}
            >
              <Users className="w-10 h-10" style={{ color: "#FF3366" }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display font-bold text-xl text-white mb-1">
                Referral Program
              </h3>
              <p className="text-sm text-white/40 mb-2">
                Invite your friends and earn $1 USDT for every referral who
                joins!
              </p>
              {isLoggedIn && user?.referralCode && (
                <div
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,51,102,0.2)",
                  }}
                >
                  <span className="text-xs text-white/30">Your code:</span>
                  <span
                    className="font-mono font-bold text-sm"
                    style={{ color: "#FF3366" }}
                  >
                    {user.referralCode}
                  </span>
                </div>
              )}
            </div>
            <Link to="/referral">
              <button
                type="button"
                data-ocid="home.referral.primary_button"
                className="px-6 py-3 rounded-xl font-bold text-sm shrink-0 transition-all"
                style={{
                  background: "rgba(255,51,102,0.1)",
                  border: "1px solid rgba(255,51,102,0.3)",
                  color: "#FF3366",
                }}
              >
                Invite Friends <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-4 relative z-10"
        aria-labelledby="join-now-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-10"
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,215,0,0.2)",
              boxShadow: "0 0 60px rgba(255,215,0,0.08)",
            }}
          >
            <h2
              id="join-now-heading"
              className="font-display text-4xl font-bold gold-gradient mb-4"
            >
              Join SKCE — Start Earning Today
            </h2>
            <p className="text-white/40 mb-8 text-lg">
              Join 2,400+ members already earning 10-100 USD daily on SKCE.
              Register free and start now.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup">
                <button
                  type="button"
                  data-ocid="home.cta.primary_button"
                  className="glow-btn-yellow px-8 py-3 rounded-xl font-bold text-base flex items-center gap-2"
                >
                  Join Now — Free <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/earn">
                <button
                  type="button"
                  data-ocid="home.cta.secondary_button"
                  className="px-8 py-3 rounded-xl font-bold text-base flex items-center gap-2 transition-all"
                  style={{
                    background: "rgba(0,240,255,0.06)",
                    border: "1px solid rgba(0,240,255,0.25)",
                    color: "#00F0FF",
                  }}
                >
                  Start Earning
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 text-center relative z-10"
        style={{ borderTop: "1px solid rgba(255,215,0,0.08)" }}
      >
        <p className="text-xs text-white/20">
          © {new Date().getFullYear()} SKCE - Sandeep Karn Crypto Empire.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/40 transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
