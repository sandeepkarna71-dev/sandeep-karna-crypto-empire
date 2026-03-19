import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Hash,
  Loader2,
  Network,
  Shield,
  TrendingDown,
  TrendingUp,
  Wallet as WalletIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

const ADDRESSES = [
  {
    currency: "USDT (TRC20)",
    symbol: "USDT",
    address: "THS4eZw4H6Xqdhnkdt3Up52ZSHQTKg6zRH",
    color: "#00FF88",
    network: "Tron Network",
    icon: "🟢",
  },
  {
    currency: "Ethereum (ETH)",
    symbol: "ETH",
    address: "0x95807b190b65c6b6d907527ff9fd4ef657099719",
    color: "#00F0FF",
    network: "Ethereum Network (ERC-20)",
    icon: "🔵",
  },
  {
    currency: "Bitcoin (BTC)",
    symbol: "BTC",
    address: "1EHAG2Ftyae1fUQ9UP5PXp5tjq3Z3MFk9D",
    color: "#FFD700",
    network: "Bitcoin Network",
    icon: "🟠",
  },
  {
    currency: "Solana (SOL)",
    symbol: "SOL",
    address: "87DuKMNo23BNHeH5t1y9gDzmofqAksVpoybqQrZ4QjMz",
    color: "#A855F7",
    network: "Solana Network",
    icon: "🟣",
  },
];

const CURRENCY_NETWORK: Record<string, string> = {
  USDT: "Tron Network (TRC-20)",
  ETH: "Ethereum Network (ERC-20)",
  BTC: "Bitcoin Network",
  SOL: "Solana Network",
};

const COIN_LIST = [
  { symbol: "BTC", name: "Bitcoin", binance: "BTCUSDT", color: "#FFD700" },
  { symbol: "ETH", name: "Ethereum", binance: "ETHUSDT", color: "#00F0FF" },
  { symbol: "USDT", name: "Tether", binance: null, color: "#00FF88" },
  { symbol: "SOL", name: "Solana", binance: "SOLUSDT", color: "#A855F7" },
  { symbol: "BNB", name: "BNB", binance: "BNBUSDT", color: "#FFD700" },
];

function generateOrderId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "ORD-";
  for (let i = 0; i < 8; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function CopyButton({
  text,
  size = "md",
}: { text: string; size?: "sm" | "md" }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      data-ocid="wallet.button"
      className={`flex items-center gap-1 rounded-lg font-medium transition-all ${
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
      } ${
        copied
          ? "text-[#00FF88] border border-[#00FF88]/30"
          : "text-[#FFD700] border border-[#FFD700]/30 hover:bg-[#FFD700]/10"
      }`}
      style={{
        background: copied ? "rgba(0,255,136,0.1)" : "rgba(255,215,0,0.08)",
      }}
    >
      {copied ? (
        <>
          <Check className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} /> Copied!
        </>
      ) : (
        <>
          <Copy className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} /> Copy
        </>
      )}
    </button>
  );
}

function AnimatedBalance({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const end = value;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const duration = 1200;
    const startTime = performance.now();
    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(eased * end);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [value]);
  return (
    <span
      className="font-display font-bold text-5xl tracking-tight"
      style={{ color: "#FFD700" }}
    >
      ${display.toFixed(2)}
    </span>
  );
}

interface DepositConfirmation {
  orderId: string;
  currency: string;
  amount: string;
  walletAddress: string;
  txHash: string;
  network: string;
}

interface WithdrawConfirmation {
  orderId: string;
  currency: string;
  amount: string;
  walletAddress: string;
  network: string;
  remainingBalance: number;
}

// Pending queue helpers
interface PendingDeposit {
  username: string;
  currency: string;
  amount: string;
  txHash: string;
}
interface PendingWithdrawal {
  username: string;
  amount: number;
  currency: string;
  walletAddress: string;
}

function getPendingDeposits(): PendingDeposit[] {
  try {
    return JSON.parse(localStorage.getItem("sce_pending_deposits") || "[]");
  } catch {
    return [];
  }
}
function savePendingDeposits(q: PendingDeposit[]) {
  localStorage.setItem("sce_pending_deposits", JSON.stringify(q));
}
function getPendingWithdrawals(): PendingWithdrawal[] {
  try {
    return JSON.parse(localStorage.getItem("sce_pending_withdrawals") || "[]");
  } catch {
    return [];
  }
}
function savePendingWithdrawals(q: PendingWithdrawal[]) {
  localStorage.setItem("sce_pending_withdrawals", JSON.stringify(q));
}

export function Wallet() {
  const { user, isLoggedIn } = useAuth();
  const { actor } = useActor();
  const actorRef = useRef(actor);
  actorRef.current = actor;

  const [depositForm, setDepositForm] = useState({
    currency: "USDT",
    amount: "",
    txHash: "",
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    currency: "USDT",
    walletAddress: "",
  });
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [depositConfirm, setDepositConfirm] =
    useState<DepositConfirmation | null>(null);
  const [withdrawConfirm, setWithdrawConfirm] =
    useState<WithdrawConfirmation | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [, setPrevPrices] = useState<Record<string, number>>({});
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down">>({});

  const balance = user?.balance || 0;

  // Process pending deposits/withdrawals when actor becomes available
  useEffect(() => {
    if (!actor || !user) return;
    // Process pending deposits
    const pendingDeps = getPendingDeposits();
    const myDeps = pendingDeps.filter((d) => d.username === user.username);
    const otherDeps = pendingDeps.filter((d) => d.username !== user.username);
    if (myDeps.length > 0) {
      (async () => {
        const remaining: PendingDeposit[] = [];
        for (const d of myDeps) {
          try {
            await (actor as any).submitDepositPublic(
              d.username,
              d.currency,
              d.amount,
              d.txHash,
            );
          } catch {
            remaining.push(d);
          }
        }
        savePendingDeposits([...otherDeps, ...remaining]);
      })();
    }
    // Process pending withdrawals
    const pendingWiths = getPendingWithdrawals();
    const myWiths = pendingWiths.filter((w) => w.username === user.username);
    const otherWiths = pendingWiths.filter((w) => w.username !== user.username);
    if (myWiths.length > 0) {
      (async () => {
        const remaining: PendingWithdrawal[] = [];
        for (const w of myWiths) {
          try {
            await (actor as any).submitWithdrawalPublic(
              w.username,
              BigInt(w.amount),
              w.currency,
              w.walletAddress,
            );
          } catch {
            remaining.push(w);
          }
        }
        savePendingWithdrawals([...otherWiths, ...remaining]);
      })();
    }
  }, [actor, user]);

  // Live prices
  useEffect(() => {
    async function fetchPrices() {
      try {
        const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
        const symbolsParam = JSON.stringify(symbols);
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(symbolsParam)}`,
        );
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const newPrices: Record<string, number> = {};
        for (const item of data) {
          const sym = (item.symbol as string).replace("USDT", "");
          newPrices[sym] = Number.parseFloat(item.price);
        }
        newPrices.USDT = 1.0;
        setPrevPrices((prev) => {
          const flashes: Record<string, "up" | "down"> = {};
          for (const k of Object.keys(newPrices)) {
            if (prev[k] && prev[k] !== newPrices[k])
              flashes[k] = newPrices[k] > prev[k] ? "up" : "down";
          }
          if (Object.keys(flashes).length > 0) {
            setFlashMap(flashes);
            setTimeout(() => setFlashMap({}), 600);
          }
          return { ...newPrices };
        });
        setLivePrices(newPrices);
      } catch {
        /* ignore */
      }
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const selectedAddress = ADDRESSES.find(
    (a) => a.symbol === depositForm.currency,
  );

  const txKey = `sce_tx_${user?.username || "guest"}`;
  function getTxHistory() {
    try {
      return JSON.parse(localStorage.getItem(txKey) || "[]");
    } catch {
      return [];
    }
  }
  function addTx(tx: object) {
    const h = getTxHistory();
    h.unshift({ ...tx, date: new Date().toISOString() });
    localStorage.setItem(txKey, JSON.stringify(h.slice(0, 50)));
  }
  const txHistory = getTxHistory();

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }
    if (!depositForm.amount || !depositForm.txHash) {
      toast.error("Please fill all required fields.");
      return;
    }
    setDepositLoading(true);
    try {
      const currentActor = actorRef.current;
      if (currentActor) {
        try {
          await (currentActor as any).submitDepositPublic(
            user!.username,
            depositForm.currency,
            depositForm.amount,
            depositForm.txHash,
          );
        } catch {
          // Canister call failed - add to pending queue
          const q = getPendingDeposits();
          q.push({
            username: user!.username,
            currency: depositForm.currency,
            amount: depositForm.amount,
            txHash: depositForm.txHash,
          });
          savePendingDeposits(q);
        }
      } else {
        // Actor not ready - queue it
        const q = getPendingDeposits();
        q.push({
          username: user!.username,
          currency: depositForm.currency,
          amount: depositForm.amount,
          txHash: depositForm.txHash,
        });
        savePendingDeposits(q);
      }
      const orderId = generateOrderId();
      addTx({
        type: "deposit",
        orderId,
        currency: depositForm.currency,
        amount: depositForm.amount,
        txHash: depositForm.txHash,
        status: "pending",
      });
      setDepositConfirm({
        orderId,
        currency: depositForm.currency,
        amount: depositForm.amount,
        walletAddress: selectedAddress?.address || "",
        txHash: depositForm.txHash,
        network: selectedAddress?.network || "",
      });
      setDepositForm({ currency: "USDT", amount: "", txHash: "" });
    } finally {
      setDepositLoading(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }
    const amt = Number.parseFloat(withdrawForm.amount);
    if (!amt || amt < 10) {
      toast.error("Minimum withdrawal is $10.");
      return;
    }
    if (!withdrawForm.walletAddress) {
      toast.error("Please enter your wallet address.");
      return;
    }
    if (balance < amt) {
      toast.error("Insufficient balance.");
      return;
    }
    setWithdrawLoading(true);
    try {
      const rawAmt = BigInt(Math.round(amt * 1000));
      const currentActor = actorRef.current;
      if (currentActor) {
        try {
          await (currentActor as any).submitWithdrawalPublic(
            user!.username,
            rawAmt,
            withdrawForm.currency,
            withdrawForm.walletAddress,
          );
        } catch {
          // Queue it
          const q = getPendingWithdrawals();
          q.push({
            username: user!.username,
            amount: Number(rawAmt),
            currency: withdrawForm.currency,
            walletAddress: withdrawForm.walletAddress,
          });
          savePendingWithdrawals(q);
        }
      } else {
        const q = getPendingWithdrawals();
        q.push({
          username: user!.username,
          amount: Number(rawAmt),
          currency: withdrawForm.currency,
          walletAddress: withdrawForm.walletAddress,
        });
        savePendingWithdrawals(q);
      }
      const orderId = generateOrderId();
      addTx({
        type: "withdrawal",
        orderId,
        currency: withdrawForm.currency,
        amount: withdrawForm.amount,
        walletAddress: withdrawForm.walletAddress,
        status: "pending",
      });
      setWithdrawConfirm({
        orderId,
        currency: withdrawForm.currency,
        amount: withdrawForm.amount,
        walletAddress: withdrawForm.walletAddress,
        network: CURRENCY_NETWORK[withdrawForm.currency] || "",
        remainingBalance: balance - amt,
      });
      setWithdrawForm({ amount: "", currency: "USDT", walletAddress: "" });
    } finally {
      setWithdrawLoading(false);
    }
  }

  const withdrawAmt = Number.parseFloat(withdrawForm.amount) || 0;
  const showWithdrawSummary =
    withdrawForm.amount &&
    withdrawForm.walletAddress &&
    withdrawAmt >= 10 &&
    withdrawAmt <= balance;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-mesh pt-20 flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 text-center max-w-sm w-full">
          <WalletIcon className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            Wallet Access
          </h2>
          <p className="text-white/40 mb-6">
            Please login to access your wallet.
          </p>
          <a href="/login">
            <button
              type="button"
              className="w-full h-11 rounded-lg font-bold text-sm glow-btn-yellow"
            >
              Login to Continue
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Big Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 mb-6 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,215,0,0.25)",
            boxShadow:
              "0 0 40px rgba(255,215,0,0.1), 0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <WalletIcon className="w-4 h-4 text-white/40" />
              <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                Total Balance
              </span>
            </div>
            <AnimatedBalance value={balance} />
            <span className="text-white/40 text-sm ml-1">USDT</span>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={() => document.getElementById("deposit-tab")?.click()}
                data-ocid="wallet.deposit.primary_button"
                className="btn-3d-yellow flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              >
                <ArrowDownLeft className="w-4 h-4" /> Deposit
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("withdraw-tab")?.click()}
                data-ocid="wallet.withdraw.primary_button"
                className="btn-3d-blue flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        {/* Coin list with live prices */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl mb-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <h3 className="font-display font-bold text-white text-sm">
              Market Prices
            </h3>
          </div>
          {COIN_LIST.map((coin) => {
            const price = livePrices[coin.symbol];
            const flash = flashMap[coin.symbol];
            return (
              <div
                key={coin.symbol}
                className={`flex items-center justify-between px-5 py-3 border-b last:border-0 transition-all rounded-sm ${
                  flash === "up"
                    ? "price-flash-green"
                    : flash === "down"
                      ? "price-flash-red"
                      : ""
                }`}
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${coin.color}15`, color: coin.color }}
                  >
                    {coin.symbol[0]}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">
                      {coin.symbol}
                    </span>
                    <span className="text-xs text-white/30 ml-2">
                      {coin.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {price ? (
                    <>
                      <div className="font-mono text-sm font-bold text-white">
                        $
                        {price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-[10px] text-white/30 flex items-center justify-end gap-0.5">
                        {flash === "up" ? (
                          <TrendingUp
                            className="w-3 h-3"
                            style={{ color: "#00FF88" }}
                          />
                        ) : flash === "down" ? (
                          <TrendingDown
                            className="w-3 h-3"
                            style={{ color: "#FF3366" }}
                          />
                        ) : null}
                        Live
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-white/20">Loading...</div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Deposit / Withdraw Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,215,0,0.1)",
          }}
        >
          <Tabs defaultValue="deposit">
            <TabsList
              className="w-full rounded-none bg-transparent border-b"
              style={{ borderColor: "rgba(255,215,0,0.1)" }}
            >
              <TabsTrigger
                id="deposit-tab"
                value="deposit"
                data-ocid="wallet.deposit.tab"
                className="flex-1 h-12 font-bold data-[state=active]:text-[#FFD700] data-[state=active]:border-b-2 data-[state=active]:border-[#FFD700] rounded-none bg-transparent"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit
              </TabsTrigger>
              <TabsTrigger
                id="withdraw-tab"
                value="withdraw"
                data-ocid="wallet.withdraw.tab"
                className="flex-1 h-12 font-bold data-[state=active]:text-[#00F0FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00F0FF] rounded-none bg-transparent"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
              </TabsTrigger>
            </TabsList>

            {/* DEPOSIT */}
            <TabsContent value="deposit" className="p-6">
              <form onSubmit={handleDeposit}>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">
                      Select Currency
                    </Label>
                    <Select
                      value={depositForm.currency}
                      onValueChange={(v) =>
                        setDepositForm({ ...depositForm, currency: v })
                      }
                    >
                      <SelectTrigger
                        data-ocid="wallet.deposit.select"
                        className="bg-white/5 border-white/10 text-white h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESSES.map((a) => (
                          <SelectItem key={a.symbol} value={a.symbol}>
                            {a.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAddress && (
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: `${selectedAddress.color}0A`,
                        border: `1px solid ${selectedAddress.color}25`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">
                          Send {selectedAddress.symbol} to this address:
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: selectedAddress.color }}
                        >
                          {selectedAddress.network}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-white/80 break-all flex-1">
                          {selectedAddress.address}
                        </code>
                        <CopyButton text={selectedAddress.address} size="sm" />
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-white/30">
                        <AlertTriangle className="w-3 h-3 text-[#FFD700]" />
                        Only send {selectedAddress.symbol} on{" "}
                        {selectedAddress.network}
                      </div>
                    </div>
                  )}

                  <div
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{
                      background: "rgba(255,215,0,0.04)",
                      border: "1px solid rgba(255,215,0,0.12)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">Bybit Pay</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Scan QR with Bybit App
                      </p>
                    </div>
                    <img
                      src="/assets/uploads/1773727379409-1.jpg"
                      alt="Bybit Pay QR"
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        Binance Pay
                      </p>
                      <p className="text-xs text-white/40">
                        Direct Binance payment
                      </p>
                    </div>
                    <Badge
                      className="text-xs"
                      style={{
                        background: "rgba(255,215,0,0.1)",
                        color: "#FFD700",
                        border: "1px solid rgba(255,215,0,0.2)",
                      }}
                    >
                      Coming Soon
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs uppercase tracking-wider">
                      Amount (USDT)
                    </Label>
                    <Input
                      data-ocid="wallet.deposit.input"
                      type="number"
                      placeholder="Enter deposit amount"
                      value={depositForm.amount}
                      onChange={(e) =>
                        setDepositForm({
                          ...depositForm,
                          amount: e.target.value,
                        })
                      }
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#FFD700]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs uppercase tracking-wider">
                      <Hash className="w-3 h-3 inline mr-1" />
                      Transaction Hash
                    </Label>
                    <Input
                      data-ocid="wallet.deposit.input"
                      type="text"
                      placeholder="Paste your transaction hash"
                      value={depositForm.txHash}
                      onChange={(e) =>
                        setDepositForm({
                          ...depositForm,
                          txHash: e.target.value,
                        })
                      }
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#FFD700]/40 font-mono text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    data-ocid="wallet.deposit.submit_button"
                    disabled={depositLoading}
                    className="w-full h-11 rounded-lg font-bold text-sm glow-btn-yellow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {depositLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-4 h-4" /> Submit Deposit
                        Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </TabsContent>

            {/* WITHDRAW */}
            <TabsContent value="withdraw" className="p-6">
              <form onSubmit={handleWithdraw}>
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      background: "rgba(255,215,0,0.06)",
                      border: "1px solid rgba(255,215,0,0.15)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4" style={{ color: "#FFD700" }} />
                      <span className="text-sm text-white/60">
                        Available Balance
                      </span>
                    </div>
                    <span
                      className="font-mono font-bold"
                      style={{ color: "#FFD700" }}
                    >
                      ${balance.toFixed(2)} USDT
                    </span>
                  </div>

                  <div>
                    <Label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">
                      Currency
                    </Label>
                    <Select
                      value={withdrawForm.currency}
                      onValueChange={(v) =>
                        setWithdrawForm({ ...withdrawForm, currency: v })
                      }
                    >
                      <SelectTrigger
                        data-ocid="wallet.withdraw.select"
                        className="bg-white/5 border-white/10 text-white h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADDRESSES.map((a) => (
                          <SelectItem key={a.symbol} value={a.symbol}>
                            {a.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs uppercase tracking-wider">
                      Amount (min $10)
                    </Label>
                    <Input
                      data-ocid="wallet.withdraw.input"
                      type="number"
                      placeholder="Enter withdrawal amount"
                      value={withdrawForm.amount}
                      onChange={(e) =>
                        setWithdrawForm({
                          ...withdrawForm,
                          amount: e.target.value,
                        })
                      }
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#00F0FF]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs uppercase tracking-wider">
                      <Network className="w-3 h-3 inline mr-1" />
                      Your Wallet Address
                    </Label>
                    <Input
                      data-ocid="wallet.withdraw.input"
                      type="text"
                      placeholder="Enter your receiving wallet address"
                      value={withdrawForm.walletAddress}
                      onChange={(e) =>
                        setWithdrawForm({
                          ...withdrawForm,
                          walletAddress: e.target.value,
                        })
                      }
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#00F0FF]/40 font-mono text-xs"
                    />
                  </div>

                  {showWithdrawSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-4 space-y-2"
                      style={{
                        background: "rgba(0,240,255,0.05)",
                        border: "1px solid rgba(0,240,255,0.2)",
                      }}
                    >
                      <p
                        className="text-xs font-bold"
                        style={{ color: "#00F0FF" }}
                      >
                        Withdrawal Summary
                      </p>
                      {[
                        {
                          l: "Amount",
                          v: `$${withdrawForm.amount} ${withdrawForm.currency}`,
                        },
                        {
                          l: "Network",
                          v: CURRENCY_NETWORK[withdrawForm.currency] || "—",
                        },
                        {
                          l: "To Address",
                          v: `${withdrawForm.walletAddress.slice(0, 12)}...${withdrawForm.walletAddress.slice(-6)}`,
                        },
                        {
                          l: "Remaining Balance",
                          v: `$${(balance - withdrawAmt).toFixed(2)}`,
                        },
                      ].map((item) => (
                        <div
                          key={item.l}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-white/40">{item.l}</span>
                          <span className="font-medium text-white">
                            {item.v}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    data-ocid="wallet.withdraw.submit_button"
                    disabled={withdrawLoading}
                    className="w-full h-11 rounded-lg font-bold text-sm glow-btn-blue disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {withdrawLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" /> Submit Withdrawal
                        Request
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Shield className="w-3 h-3 shrink-0" />
                    <span>
                      Withdrawals are processed by admin. Min: $10, processing
                      time 1-24h.
                    </span>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Transaction History */}
        {txHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <h3 className="font-display font-bold text-white text-sm">
                Transaction History
              </h3>
            </div>
            {txHistory.slice(0, 10).map((tx: any, i: number) => (
              <div
                key={String(i)}
                data-ocid={i < 5 ? `wallet.tx.item.${i + 1}` : undefined}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-0"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      tx.type === "deposit"
                        ? "rgba(0,255,136,0.1)"
                        : "rgba(0,240,255,0.1)",
                  }}
                >
                  {tx.type === "deposit" ? (
                    <ArrowDownLeft
                      className="w-4 h-4"
                      style={{ color: "#00FF88" }}
                    />
                  ) : (
                    <ArrowUpRight
                      className="w-4 h-4"
                      style={{ color: "#00F0FF" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white capitalize">
                    {tx.type}
                  </p>
                  <p className="text-xs text-white/30 truncate">{tx.orderId}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="font-mono text-sm font-bold"
                    style={{
                      color: tx.type === "deposit" ? "#00FF88" : "#00F0FF",
                    }}
                  >
                    {tx.type === "deposit" ? "+" : "-"}${tx.amount}{" "}
                    {tx.currency}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] text-white/20">
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Deposit Confirmation Modal */}
      <Dialog
        open={!!depositConfirm}
        onOpenChange={() => setDepositConfirm(null)}
      >
        <DialogContent
          style={{
            background: "#0f0f0f",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: "#00FF88" }} />
              Deposit Request Submitted
            </DialogTitle>
          </DialogHeader>
          {depositConfirm && (
            <div className="space-y-3 text-sm">
              {[
                { l: "Order ID", v: depositConfirm.orderId },
                { l: "Currency", v: depositConfirm.currency },
                { l: "Amount", v: `$${depositConfirm.amount}` },
                { l: "Network", v: depositConfirm.network },
                { l: "TX Hash", v: `${depositConfirm.txHash.slice(0, 20)}...` },
              ].map((item) => (
                <div key={item.l} className="flex justify-between">
                  <span className="text-white/40">{item.l}</span>
                  <span className="text-white font-medium">{item.v}</span>
                </div>
              ))}
              <div className="pt-3 text-xs text-white/30">
                Admin will verify and credit your balance within 1-24 hours.
              </div>
              <button
                type="button"
                onClick={() => setDepositConfirm(null)}
                data-ocid="wallet.deposit.close_button"
                className="w-full h-10 rounded-lg font-bold text-sm glow-btn-yellow mt-2"
              >
                Done
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Modal */}
      <Dialog
        open={!!withdrawConfirm}
        onOpenChange={() => setWithdrawConfirm(null)}
      >
        <DialogContent
          style={{
            background: "#0f0f0f",
            border: "1px solid rgba(0,240,255,0.2)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: "#00F0FF" }} />
              Withdrawal Request Submitted
            </DialogTitle>
          </DialogHeader>
          {withdrawConfirm && (
            <div className="space-y-3 text-sm">
              {[
                { l: "Order ID", v: withdrawConfirm.orderId },
                { l: "Currency", v: withdrawConfirm.currency },
                { l: "Amount", v: `$${withdrawConfirm.amount}` },
                { l: "Network", v: withdrawConfirm.network },
                {
                  l: "Remaining Balance",
                  v: `$${withdrawConfirm.remainingBalance.toFixed(2)}`,
                },
              ].map((item) => (
                <div key={item.l} className="flex justify-between">
                  <span className="text-white/40">{item.l}</span>
                  <span className="text-white font-medium">{item.v}</span>
                </div>
              ))}
              <div className="pt-3 text-xs text-white/30">
                Your wallet address:{" "}
                <span className="font-mono text-white/50 break-all">
                  {withdrawConfirm.walletAddress}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawConfirm(null)}
                data-ocid="wallet.withdraw.close_button"
                className="w-full h-10 rounded-lg font-bold text-sm glow-btn-blue mt-2"
              >
                Done
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
