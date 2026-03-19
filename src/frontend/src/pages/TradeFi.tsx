import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const SAVINGS_PRODUCTS = [
  { coin: "USDT", emoji: "💵", apy: 5.2, symbol: "USDTUSDT", balKey: "usdt" },
  { coin: "BTC", emoji: "₿", apy: 1.8, symbol: "BTCUSDT", balKey: "btc" },
  { coin: "ETH", emoji: "Ξ", apy: 3.5, symbol: "ETHUSDT", balKey: "eth" },
  { coin: "SOL", emoji: "◎", apy: 6.1, symbol: "SOLUSDT", balKey: "sol" },
  { coin: "BNB", emoji: "🔶", apy: 4.2, symbol: "BNBUSDT", balKey: "bnb" },
];

const STAKING_PRODUCTS = [
  { coin: "ETH", emoji: "Ξ", days: 30, apy: 8.5, min: 0.1 },
  { coin: "SOL", emoji: "◎", days: 60, apy: 12.0, min: 1 },
  { coin: "BNB", emoji: "🔶", days: 90, apy: 15.0, min: 0.5 },
];

function cardStyle(): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: 12,
    padding: "16px",
    boxShadow: "0 0 12px rgba(255,215,0,0.07)",
  };
}

export function TradeFi() {
  const { user, isLoggedIn, updateUser } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [subscribeModal, setSubscribeModal] = useState<
    (typeof SAVINGS_PRODUCTS)[0] | null
  >(null);
  const [stakeModal, setStakeModal] = useState<
    (typeof STAKING_PRODUCTS)[0] | null
  >(null);
  const [amount, setAmount] = useState("");
  const [collateral, setCollateral] = useState("0.01");
  const [collateralCoin, setCollateralCoin] = useState("BTC");

  const activeSavings: any[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("skce_tradefi_savings") || "[]");
    } catch {
      return [];
    }
  })();
  const activeStaking: any[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("skce_tradefi_locked") || "[]");
    } catch {
      return [];
    }
  })();

  useEffect(() => {
    async function fetchPrices() {
      try {
        const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbols=[${symbols.map((s) => `%22${s}%22`).join(",")}]`,
        );
        const data = await res.json();
        const map: Record<string, number> = { USDT: 1 };
        for (const item of data) {
          const sym = item.symbol.replace("USDT", "");
          map[sym] = Number.parseFloat(item.price);
        }
        setPrices(map);
      } catch {
        /* ignore */
      }
    }
    fetchPrices();
  }, []);

  function getBalance(coin: string): number {
    if (!user) return 0;
    const b = (user as any).balances || {};
    if (coin === "USDT") return user.balance || 0;
    return b[coin.toLowerCase()] || 0;
  }

  function handleSubscribe() {
    if (!isLoggedIn || !subscribeModal) {
      toast.error("Login required");
      return;
    }
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter valid amount");
      return;
    }
    const bal = getBalance(subscribeModal.coin);
    if (amt > bal) {
      toast.error("Insufficient balance");
      return;
    }

    // Deduct from wallet
    if (subscribeModal.coin === "USDT") {
      updateUser({ balance: (user?.balance || 0) - amt });
    } else {
      const b = (user as any)?.balances || {};
      updateUser({
        balances: {
          ...b,
          [subscribeModal.coin.toLowerCase()]:
            (b[subscribeModal.coin.toLowerCase()] || 0) - amt,
        },
      } as any);
    }

    const savings = [
      ...activeSavings,
      {
        coin: subscribeModal.coin,
        amount: amt,
        apy: subscribeModal.apy,
        date: new Date().toISOString(),
        type: "flexible",
      },
    ];
    localStorage.setItem("skce_tradefi_savings", JSON.stringify(savings));
    toast.success(
      `✅ Subscribed ${amt} ${subscribeModal.coin} at ${subscribeModal.apy}% APY`,
    );
    setSubscribeModal(null);
    setAmount("");
  }

  function handleStake() {
    if (!isLoggedIn || !stakeModal) {
      toast.error("Login required");
      return;
    }
    const amt = Number.parseFloat(amount);
    if (!amt || amt < stakeModal.min) {
      toast.error(`Minimum ${stakeModal.min} ${stakeModal.coin}`);
      return;
    }
    const bal = getBalance(stakeModal.coin);
    if (amt > bal) {
      toast.error("Insufficient balance");
      return;
    }

    const b = (user as any)?.balances || {};
    updateUser({
      balances: {
        ...b,
        [stakeModal.coin.toLowerCase()]:
          (b[stakeModal.coin.toLowerCase()] || 0) - amt,
      },
    } as any);

    const locked = [
      ...activeStaking,
      {
        coin: stakeModal.coin,
        amount: amt,
        apy: stakeModal.apy,
        days: stakeModal.days,
        date: new Date().toISOString(),
        unlockDate: new Date(
          Date.now() + stakeModal.days * 86400000,
        ).toISOString(),
      },
    ];
    localStorage.setItem("skce_tradefi_locked", JSON.stringify(locked));
    toast.success(
      `🔒 Staked ${amt} ${stakeModal.coin} for ${stakeModal.days} days at ${stakeModal.apy}% APY`,
    );
    setStakeModal(null);
    setAmount("");
  }

  const collateralPrice = prices[collateralCoin] || 0;
  const collateralAmt = Number.parseFloat(collateral) || 0;
  const loanAmount = (collateralAmt * collateralPrice * 0.5).toFixed(2);

  function handleLoan() {
    if (!isLoggedIn) {
      toast.error("Login required");
      return;
    }
    if (!collateralAmt || collateralAmt <= 0) {
      toast.error("Enter collateral amount");
      return;
    }
    const bal = getBalance(collateralCoin);
    if (collateralAmt > bal) {
      toast.error("Insufficient balance");
      return;
    }

    const b = (user as any)?.balances || {};
    updateUser({
      balance: (user?.balance || 0) + Number(loanAmount),
      balances: {
        ...b,
        [collateralCoin.toLowerCase()]:
          (b[collateralCoin.toLowerCase()] || 0) - collateralAmt,
      },
    } as any);

    const loans = (() => {
      try {
        return JSON.parse(localStorage.getItem("skce_tradefi_loans") || "[]");
      } catch {
        return [];
      }
    })();
    loans.push({
      collateral: collateralAmt,
      coin: collateralCoin,
      loan: Number(loanAmount),
      date: new Date().toISOString(),
    });
    localStorage.setItem("skce_tradefi_loans", JSON.stringify(loans));
    toast.success(
      `⚡ Loan approved! ${loanAmount} USDT credited to your wallet`,
    );
  }

  return (
    <div
      style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F5F5F5" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold" style={{ color: "#FFD700" }}>
            SKCE TradeFi
          </h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>
            Earn passive income on your crypto
          </p>
        </motion.div>

        <Tabs defaultValue="savings">
          <TabsList
            className="w-full mb-4"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <TabsTrigger value="savings" className="flex-1">
              💰 Flexible Savings
            </TabsTrigger>
            <TabsTrigger value="staking" className="flex-1">
              🔒 Locked Staking
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex-1">
              ⚡ Crypto Loans
            </TabsTrigger>
          </TabsList>

          {/* ── FLEXIBLE SAVINGS ── */}
          <TabsContent value="savings">
            {activeSavings.length > 0 && (
              <div
                className="mb-4 p-3 rounded-xl"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.25)",
                }}
              >
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: "#FFD700" }}
                >
                  📈 Your Active Savings
                </p>
                {activeSavings.map((s: any) => (
                  <div
                    key={`${s.coin}-${s.date}`}
                    className="flex justify-between text-xs py-1"
                  >
                    <span>{s.coin}</span>
                    <span>
                      {s.amount} @ {s.apy}% APY
                    </span>
                    <Badge
                      style={{
                        background: "rgba(0,200,100,0.2)",
                        color: "#00C864",
                        fontSize: 10,
                      }}
                    >
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {SAVINGS_PRODUCTS.map((p) => (
                <motion.div
                  key={p.coin}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={cardStyle()}
                  className="flex items-center justify-between"
                  data-ocid={`tradefi.item.${SAVINGS_PRODUCTS.indexOf(p) + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <div className="font-bold">{p.coin}</div>
                      <div className="text-xs" style={{ color: "#888" }}>
                        {prices[p.coin]
                          ? `$${prices[p.coin].toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                          : "Loading..."}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#00C864" }}
                    >
                      {p.apy}%
                    </div>
                    <div className="text-xs" style={{ color: "#888" }}>
                      APY
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs mb-1" style={{ color: "#888" }}>
                      Balance: {getBalance(p.coin).toFixed(4)}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSubscribeModal(p);
                        setAmount("");
                      }}
                      data-ocid="tradefi.primary_button"
                      style={{
                        background: "linear-gradient(135deg,#FFD700,#FFA500)",
                        color: "#0A0A0A",
                        fontWeight: 700,
                      }}
                    >
                      Subscribe
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── LOCKED STAKING ── */}
          <TabsContent value="staking">
            {activeStaking.length > 0 && (
              <div
                className="mb-4 p-3 rounded-xl"
                style={{
                  background: "rgba(0,200,100,0.06)",
                  border: "1px solid rgba(0,200,100,0.2)",
                }}
              >
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: "#00C864" }}
                >
                  🔒 Active Stakes
                </p>
                {activeStaking.map((s: any) => (
                  <div
                    key={`${s.coin}-${s.date}`}
                    className="flex justify-between text-xs py-1"
                  >
                    <span>{s.coin}</span>
                    <span>
                      {s.amount} × {s.days}d @ {s.apy}%
                    </span>
                    <span style={{ color: "#888" }}>
                      Unlock: {new Date(s.unlockDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {STAKING_PRODUCTS.map((p, idx) => (
                <motion.div
                  key={p.coin}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={cardStyle()}
                  className="flex items-center justify-between"
                  data-ocid={`tradefi.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <div className="font-bold">{p.coin}</div>
                      <div className="text-xs" style={{ color: "#888" }}>
                        {p.days}-day lock
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#00C864" }}
                    >
                      {p.apy}%
                    </div>
                    <div className="text-xs" style={{ color: "#888" }}>
                      APY
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs mb-1" style={{ color: "#888" }}>
                      Min: {p.min} {p.coin}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setStakeModal(p);
                        setAmount("");
                      }}
                      data-ocid="tradefi.secondary_button"
                      style={{
                        background: "rgba(0,200,100,0.15)",
                        color: "#00C864",
                        border: "1px solid #00C864",
                        fontWeight: 700,
                      }}
                    >
                      Stake
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── CRYPTO LOANS ── */}
          <TabsContent value="loans">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ ...cardStyle(), padding: "20px" }}
            >
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: "#FFD700" }}
              >
                ⚡ Instant Crypto Loan
              </h2>
              <p className="text-xs mb-4" style={{ color: "#888" }}>
                Put up BTC or ETH as collateral, get USDT instantly. LTV: 50%
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: "#aaa" }}>
                    Collateral Coin
                  </p>
                  <div className="flex gap-2">
                    {["BTC", "ETH"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCollateralCoin(c)}
                        data-ocid="tradefi.toggle"
                        className="flex-1 py-2 rounded-lg text-sm font-bold"
                        style={{
                          background:
                            collateralCoin === c
                              ? "rgba(255,215,0,0.2)"
                              : "rgba(255,255,255,0.04)",
                          border:
                            collateralCoin === c
                              ? "1px solid #FFD700"
                              : "1px solid rgba(255,255,255,0.1)",
                          color: collateralCoin === c ? "#FFD700" : "#888",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs mb-1 block" style={{ color: "#aaa" }}>
                    Collateral Amount ({collateralCoin})
                  </p>
                  <Input
                    type="number"
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    data-ocid="tradefi.input"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                    placeholder="0.01"
                  />
                  <div className="text-xs mt-1" style={{ color: "#888" }}>
                    Value: ${(collateralAmt * collateralPrice).toFixed(2)} USD
                  </div>
                </div>

                <div
                  className="p-3 rounded-xl flex items-center justify-between"
                  style={{
                    background: "rgba(0,200,100,0.08)",
                    border: "1px solid rgba(0,200,100,0.2)",
                  }}
                >
                  <div>
                    <div className="text-xs" style={{ color: "#888" }}>
                      You will receive
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "#00C864" }}
                    >
                      {loanAmount} USDT
                    </div>
                  </div>
                  <div className="text-xs text-right" style={{ color: "#888" }}>
                    <div>LTV: 50%</div>
                    <div>Collateral locked until repay</div>
                  </div>
                </div>

                <Button
                  className="w-full py-3 font-bold text-base"
                  onClick={handleLoan}
                  data-ocid="tradefi.submit_button"
                  style={{
                    background: "linear-gradient(135deg,#FFD700,#FFA500)",
                    color: "#0A0A0A",
                  }}
                >
                  ⚡ Get Loan Instantly
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Subscribe Modal */}
      <Dialog
        open={!!subscribeModal}
        onOpenChange={(o) => !o && setSubscribeModal(null)}
      >
        <DialogContent
          style={{
            background: "#0F1117",
            border: "1px solid rgba(255,215,0,0.3)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#FFD700" }}>
              Subscribe {subscribeModal?.emoji} {subscribeModal?.coin} Flexible
              Savings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="p-3 rounded-lg"
              style={{ background: "rgba(0,200,100,0.08)" }}
            >
              <div className="text-sm" style={{ color: "#888" }}>
                APY
              </div>
              <div className="text-2xl font-bold" style={{ color: "#00C864" }}>
                {subscribeModal?.apy}%
              </div>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: "#aaa" }}>
                Amount ({subscribeModal?.coin})
              </p>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-ocid="tradefi.input"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
                placeholder={`Available: ${subscribeModal ? getBalance(subscribeModal.coin).toFixed(4) : "0"}`}
              />
            </div>
            <Button
              className="w-full font-bold"
              onClick={handleSubscribe}
              data-ocid="tradefi.confirm_button"
              style={{
                background: "linear-gradient(135deg,#FFD700,#FFA500)",
                color: "#0A0A0A",
              }}
            >
              Confirm Subscribe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stake Modal */}
      <Dialog
        open={!!stakeModal}
        onOpenChange={(o) => !o && setStakeModal(null)}
      >
        <DialogContent
          style={{
            background: "#0F1117",
            border: "1px solid rgba(0,200,100,0.3)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#00C864" }}>
              Stake {stakeModal?.emoji} {stakeModal?.coin} — {stakeModal?.days}{" "}
              days
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="p-3 rounded-lg"
              style={{ background: "rgba(0,200,100,0.08)" }}
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-xs" style={{ color: "#888" }}>
                    APY
                  </div>
                  <div
                    className="text-xl font-bold"
                    style={{ color: "#00C864" }}
                  >
                    {stakeModal?.apy}%
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#888" }}>
                    Duration
                  </div>
                  <div className="text-xl font-bold">
                    {stakeModal?.days} days
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#888" }}>
                    Min amount
                  </div>
                  <div className="text-xl font-bold">
                    {stakeModal?.min} {stakeModal?.coin}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs mb-1 block" style={{ color: "#aaa" }}>
                Amount ({stakeModal?.coin})
              </p>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-ocid="tradefi.input"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
                placeholder={`Min ${stakeModal?.min}`}
              />
            </div>
            <Button
              className="w-full font-bold"
              onClick={handleStake}
              data-ocid="tradefi.confirm_button"
              style={{
                background: "rgba(0,200,100,0.15)",
                color: "#00C864",
                border: "1px solid #00C864",
              }}
            >
              🔒 Confirm Stake
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
