import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Star,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────
type P2PAd = {
  id: string;
  type: "buy" | "sell";
  coin: "USDT" | "BTC" | "ETH";
  price: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  country: string;
  currency: string;
  postedBy: string;
  userId: string;
  rating: number;
  completionRate: number;
  trades: number;
  createdAt: string;
  status: "active" | "suspended";
};

type ChatMessage = { from: string; text: string; time: string };

// ─── Country Data ─────────────────────────────────────────────────────────────
const COUNTRY_DATA: Record<
  string,
  { currency: string; rate: number; methods: string[] }
> = {
  India: {
    currency: "INR",
    rate: 83.2,
    methods: ["UPI", "Bank Transfer", "IMPS", "NEFT"],
  },
  Nepal: {
    currency: "NPR",
    rate: 133.5,
    methods: ["eSewa", "Khalti", "Bank Transfer", "IME Pay"],
  },
  Pakistan: {
    currency: "PKR",
    rate: 278,
    methods: ["JazzCash", "EasyPaisa", "Bank Transfer"],
  },
  USA: {
    currency: "USD",
    rate: 1,
    methods: ["PayPal", "Zelle", "Bank Transfer", "Wire"],
  },
  UK: {
    currency: "GBP",
    rate: 0.79,
    methods: ["Bank Transfer", "PayPal", "Faster Payments"],
  },
  UAE: {
    currency: "AED",
    rate: 3.67,
    methods: ["Bank Transfer", "Crypto", "PayPal"],
  },
  Bangladesh: {
    currency: "BDT",
    rate: 110,
    methods: ["bKash", "Nagad", "Bank Transfer"],
  },
};

const ALL_PAYMENT_METHODS = [
  "Bank Transfer",
  "UPI",
  "eSewa",
  "JazzCash",
  "PayPal",
  "Crypto",
  "IMPS",
  "Khalti",
  "Zelle",
  "bKash",
  "Nagad",
];

const COINS: ("USDT" | "BTC" | "ETH")[] = ["USDT", "BTC", "ETH"];

function loadAds(): P2PAd[] {
  try {
    return JSON.parse(localStorage.getItem("skce_p2p_ads") || "[]");
  } catch {
    return [];
  }
}

function saveAds(ads: P2PAd[]) {
  localStorage.setItem("skce_p2p_ads", JSON.stringify(ads));
}

function loadDisputes() {
  try {
    return JSON.parse(localStorage.getItem("skce_p2p_disputes") || "[]");
  } catch {
    return [];
  }
}

function saveDisputes(d: unknown[]) {
  localStorage.setItem("skce_p2p_disputes", JSON.stringify(d));
}

// ─── PostAdModal ──────────────────────────────────────────────────────────────
function PostAdModal({
  open,
  onClose,
  onPost,
}: { open: boolean; onClose: () => void; onPost: (ad: P2PAd) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: "sell" as "buy" | "sell",
    coin: "USDT" as "USDT" | "BTC" | "ETH",
    price: "",
    minAmount: "",
    maxAmount: "",
    country: "India",
    paymentMethods: [] as string[],
  });

  const countryInfo = COUNTRY_DATA[form.country];

  function toggleMethod(m: string) {
    setForm((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(m)
        ? f.paymentMethods.filter((x) => x !== m)
        : [...f.paymentMethods, m],
    }));
  }

  function submit() {
    if (!form.price || !form.minAmount || !form.maxAmount) {
      toast.error("Fill all required fields");
      return;
    }
    if (!form.paymentMethods.length) {
      toast.error("Select at least one payment method");
      return;
    }
    const ad: P2PAd = {
      id: Date.now().toString(),
      type: form.type,
      coin: form.coin,
      price: Number.parseFloat(form.price),
      minAmount: Number.parseFloat(form.minAmount),
      maxAmount: Number.parseFloat(form.maxAmount),
      paymentMethods: form.paymentMethods,
      country: form.country,
      currency: countryInfo.currency,
      postedBy: user?.username || user?.email?.split("@")[0] || "Anonymous",
      userId: user?.email || "unknown",
      rating: 4.8,
      completionRate: 98,
      trades: 0,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    onPost(ad);
    onClose();
    toast.success("Ad posted successfully!");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "#111318",
          border: "1px solid rgba(255,215,0,0.15)",
        }}
        data-ocid="p2p.post_ad.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#FFD700" }}>Post P2P Ad</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Type */}
          <div>
            <p
              className="text-xs mb-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Ad Type
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["buy", "sell"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className="py-2 rounded-lg font-bold text-sm capitalize transition-all"
                  style={{
                    background:
                      form.type === t
                        ? t === "buy"
                          ? "rgba(0,255,136,0.2)"
                          : "rgba(255,51,102,0.2)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.type === t ? (t === "buy" ? "rgba(0,255,136,0.4)" : "rgba(255,51,102,0.4)") : "rgba(255,255,255,0.06)"}`,
                    color:
                      form.type === t
                        ? t === "buy"
                          ? "#21C57A"
                          : "#E24A4A"
                        : "rgba(255,255,255,0.5)",
                  }}
                >
                  {t === "buy" ? "I want to Buy" : "I want to Sell"}
                </button>
              ))}
            </div>
          </div>
          {/* Coin */}
          <div>
            <p
              className="text-xs mb-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Coin
            </p>
            <div className="flex gap-2">
              {COINS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coin: c }))}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold"
                  style={{
                    background:
                      form.coin === c
                        ? "rgba(255,215,0,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.coin === c ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color:
                      form.coin === c ? "#FFD700" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {/* Price, Min, Max */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Price ($)
              </p>
              <Input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                className="bg-white/5 border-white/10 text-white"
                data-ocid="p2p.price.input"
              />
            </div>
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Min ($)
              </p>
              <Input
                type="number"
                placeholder="10"
                value={form.minAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minAmount: e.target.value }))
                }
                className="bg-white/5 border-white/10 text-white"
                data-ocid="p2p.min.input"
              />
            </div>
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Max ($)
              </p>
              <Input
                type="number"
                placeholder="1000"
                value={form.maxAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxAmount: e.target.value }))
                }
                className="bg-white/5 border-white/10 text-white"
                data-ocid="p2p.max.input"
              />
            </div>
          </div>
          {/* Country */}
          <div>
            <p
              className="text-xs mb-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Country
            </p>
            <select
              value={form.country}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value }))
              }
              data-ocid="p2p.country.select"
              className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {Object.keys(COUNTRY_DATA).map((c) => (
                <option key={c} value={c} style={{ background: "#111318" }}>
                  {c}
                </option>
              ))}
            </select>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              1 USD = {countryInfo.rate} {countryInfo.currency}
            </p>
          </div>
          {/* Payment methods */}
          <div>
            <p
              className="text-xs mb-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Payment Methods
            </p>
            <div className="flex flex-wrap gap-2">
              {(countryInfo.methods.length
                ? countryInfo.methods
                : ALL_PAYMENT_METHODS
              ).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMethod(m)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: form.paymentMethods.includes(m)
                      ? "rgba(0,240,255,0.15)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.paymentMethods.includes(m) ? "rgba(0,240,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                    color: form.paymentMethods.includes(m)
                      ? "#00F0FF"
                      : "rgba(255,255,255,0.5)",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={submit}
            data-ocid="p2p.post_ad.submit_button"
            className="w-full"
            style={{
              background: "linear-gradient(135deg,#FFD700,#FFA500)",
              color: "#000",
              fontWeight: 700,
            }}
          >
            Post Ad
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── TradeModal ───────────────────────────────────────────────────────────────
function TradeModal({ ad, onClose }: { ad: P2PAd; onClose: () => void }) {
  const { user } = useAuth();
  const [tradeAmt, setTradeAmt] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      from: ad.postedBy,
      text: `Hello! I'm ready to ${ad.type === "sell" ? "sell" : "buy"} ${ad.coin}. Please proceed with payment.`,
      time: new Date().toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [paid, setPaid] = useState(false);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function sendMessage() {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      from: user?.username || "You",
      text: chatInput,
      time: new Date().toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          from: ad.postedBy,
          text: "Received. Please wait for confirmation.",
          time: new Date().toLocaleTimeString("en", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1500);
  }

  function handlePaid() {
    setPaid(true);
    setChatMessages((prev) => [
      ...prev,
      {
        from: user?.username || "You",
        text: "I have made the payment. Please confirm.",
        time: new Date().toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    toast.success("Payment marked! Waiting for seller confirmation.");
  }

  function handleDispute() {
    const disputes = loadDisputes();
    const dispute = {
      id: `D${Date.now()}`,
      tradeId: `T${Date.now()}`,
      buyer: user?.username || "Unknown",
      seller: ad.postedBy,
      amount: Number.parseFloat(tradeAmt) || 0,
      coin: ad.coin,
      reason: "Payment dispute",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveDisputes([...disputes, dispute]);
    toast.error("Dispute raised. Admin will review within 24h.");
    onClose();
  }

  function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofFile(reader.result as string);
    reader.readAsDataURL(file);
    toast.success("Payment proof uploaded!");
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const localPrice = ad.price * (COUNTRY_DATA[ad.country]?.rate || 1);
  const localCurrency = COUNTRY_DATA[ad.country]?.currency || "USD";

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "#111318",
          border: "1px solid rgba(255,215,0,0.15)",
        }}
        data-ocid="p2p.trade.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#FFD700" }}>
            Trade with {ad.postedBy}
          </DialogTitle>
        </DialogHeader>
        {/* Timer */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-2"
          style={{
            background:
              timeLeft < 300 ? "rgba(255,51,102,0.1)" : "rgba(255,215,0,0.05)",
            border: `1px solid ${timeLeft < 300 ? "rgba(255,51,102,0.2)" : "rgba(255,215,0,0.1)"}`,
          }}
        >
          <Timer
            className="w-4 h-4"
            style={{ color: timeLeft < 300 ? "#E24A4A" : "#FFD700" }}
          />
          <span
            className="text-sm font-mono font-bold"
            style={{ color: timeLeft < 300 ? "#E24A4A" : "#FFD700" }}
          >
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Payment window
          </span>
        </div>
        {/* Trade info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Price
            </p>
            <p className="font-bold" style={{ color: "#FFD700" }}>
              {localPrice.toFixed(2)} {localCurrency}
            </p>
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Limits
            </p>
            <p className="font-bold text-sm" style={{ color: "#F5F6F8" }}>
              ${ad.minAmount} – ${ad.maxAmount}
            </p>
          </div>
        </div>
        {/* Amount input */}
        <div className="mb-4">
          <p
            className="text-xs mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Amount (USD)
          </p>
          <Input
            type="number"
            placeholder={`${ad.minAmount} – ${ad.maxAmount}`}
            value={tradeAmt}
            onChange={(e) => setTradeAmt(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
            data-ocid="p2p.trade.input"
          />
        </div>
        {/* Payment methods */}
        <div className="mb-4">
          <p
            className="text-xs mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Payment Methods
          </p>
          <div className="flex flex-wrap gap-2">
            {ad.paymentMethods.map((m) => (
              <Badge
                key={m}
                style={{
                  background: "rgba(0,240,255,0.1)",
                  color: "#00F0FF",
                  border: "1px solid rgba(0,240,255,0.2)",
                }}
              >
                {m}
              </Badge>
            ))}
          </div>
        </div>
        {/* Proof upload */}
        <div className="mb-4">
          <p
            className="text-xs mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Upload Payment Proof
          </p>
          <label
            data-ocid="p2p.upload_button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer w-fit text-sm"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <Upload className="w-4 h-4" />
            {proofFile ? "Proof Uploaded ✓" : "Upload Screenshot"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProofUpload}
            />
          </label>
        </div>
        {/* Chat */}
        <div className="mb-4">
          <p
            className="text-xs mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Chat
          </p>
          <div
            className="rounded-xl p-3 h-40 overflow-y-auto space-y-2"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={String(i)}
                className={`flex ${msg.from === (user?.username || "You") ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] px-3 py-1.5 rounded-xl"
                  style={{
                    background:
                      msg.from === (user?.username || "You")
                        ? "rgba(255,215,0,0.15)"
                        : "rgba(255,255,255,0.06)",
                    color: "#F5F6F8",
                  }}
                >
                  <p className="text-xs">{msg.text}</p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              data-ocid="p2p.chat.input"
              className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              data-ocid="p2p.chat.send_button"
              className="p-2 rounded-xl"
              style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          {!paid ? (
            <Button
              onClick={handlePaid}
              data-ocid="p2p.paid.confirm_button"
              className="flex-1"
              style={{
                background: "rgba(0,255,136,0.2)",
                color: "#21C57A",
                border: "1px solid rgba(0,255,136,0.3)",
              }}
            >
              I've Paid
            </Button>
          ) : (
            <Button
              disabled
              className="flex-1 opacity-50"
              style={{ background: "rgba(0,255,136,0.1)", color: "#21C57A" }}
            >
              ✓ Payment Sent
            </Button>
          )}
          <Button
            onClick={handleDispute}
            data-ocid="p2p.dispute.button"
            variant="destructive"
            className="flex-1"
          >
            Raise Dispute
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main P2P Component ───────────────────────────────────────────────────────
export function P2P() {
  const { isLoggedIn, user } = useAuth();
  const [ads, setAds] = useState<P2PAd[]>(loadAds);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [filterCoin, setFilterCoin] = useState<"ALL" | "USDT" | "BTC" | "ETH">(
    "ALL",
  );
  const [filterPayment, setFilterPayment] = useState("ALL");
  const [filterCountry, setFilterCountry] = useState("ALL");
  const [showPostModal, setShowPostModal] = useState(false);
  const [tradeAd, setTradeAd] = useState<P2PAd | null>(null);
  const isKYCVerified = (() => {
    if (!user) return false;
    const kycKey = `sce_kyc_${user.username || user.email?.split("@")[0]}`;
    try {
      const kyc = JSON.parse(localStorage.getItem(kycKey) || "{}");
      return kyc.status === "verified";
    } catch {
      return false;
    }
  })();

  const filteredAds = ads.filter((ad) => {
    if (ad.status !== "active") return false;
    if (ad.type !== activeTab) return false;
    if (filterCoin !== "ALL" && ad.coin !== filterCoin) return false;
    if (filterPayment !== "ALL" && !ad.paymentMethods.includes(filterPayment))
      return false;
    if (filterCountry !== "ALL" && ad.country !== filterCountry) return false;
    return true;
  });

  function handlePostAd(ad: P2PAd) {
    const updated = [ad, ...ads];
    setAds(updated);
    saveAds(updated);
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#F5F6F8" }}>
              P2P Exchange
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Trade directly with other users. KYC required.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isKYCVerified ? (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: "rgba(0,255,136,0.1)", color: "#21C57A" }}
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="text-xs">KYC Verified</span>
              </div>
            ) : null}
            {isLoggedIn ? (
              isKYCVerified ? (
                <Button
                  onClick={() => setShowPostModal(true)}
                  data-ocid="p2p.post_ad.open_modal_button"
                  style={{
                    background: "linear-gradient(135deg,#FFD700,#FFA500)",
                    color: "#000",
                    fontWeight: 700,
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Post Ad
                </Button>
              ) : (
                <a href="/kyc">
                  <Button
                    data-ocid="p2p.kyc.button"
                    style={{
                      background: "rgba(255,51,102,0.15)",
                      color: "#E24A4A",
                      border: "1px solid rgba(255,51,102,0.3)",
                    }}
                  >
                    Complete KYC to Post
                  </Button>
                </a>
              )
            ) : (
              <a href="/login">
                <Button
                  data-ocid="p2p.login.button"
                  style={{
                    background: "rgba(255,215,0,0.15)",
                    color: "#FFD700",
                    border: "1px solid rgba(255,215,0,0.3)",
                  }}
                >
                  Login to Trade
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Buy/Sell Tabs */}
        <div
          className="inline-flex rounded-xl overflow-hidden mb-6"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {(["buy", "sell"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              data-ocid={`p2p.${t}.tab`}
              className="px-8 py-2.5 font-bold capitalize text-sm transition-all"
              style={{
                background:
                  activeTab === t
                    ? t === "buy"
                      ? "rgba(0,255,136,0.15)"
                      : "rgba(255,51,102,0.15)"
                    : "transparent",
                color:
                  activeTab === t
                    ? t === "buy"
                      ? "#21C57A"
                      : "#E24A4A"
                    : "rgba(255,255,255,0.4)",
                borderBottom:
                  activeTab === t
                    ? `2px solid ${t === "buy" ? "#21C57A" : "#E24A4A"}`
                    : "2px solid transparent",
              }}
            >
              {t === "buy" ? "Buy Crypto" : "Sell Crypto"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterCoin}
            onChange={(e) => setFilterCoin(e.target.value as any)}
            data-ocid="p2p.coin.select"
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <option value="ALL" style={{ background: "#0A0A0A" }}>
              All Coins
            </option>
            {COINS.map((c) => (
              <option key={c} value={c} style={{ background: "#0A0A0A" }}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            data-ocid="p2p.payment.select"
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <option value="ALL" style={{ background: "#0A0A0A" }}>
              All Payment Methods
            </option>
            {ALL_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m} style={{ background: "#0A0A0A" }}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            data-ocid="p2p.country_filter.select"
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <option value="ALL" style={{ background: "#0A0A0A" }}>
              All Countries
            </option>
            {Object.keys(COUNTRY_DATA).map((c) => (
              <option key={c} value={c} style={{ background: "#0A0A0A" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Ads table */}
        {filteredAds.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            data-ocid="p2p.empty_state"
          >
            <div className="text-5xl mb-4">🤝</div>
            <p className="text-lg font-bold mb-2" style={{ color: "#F5F6F8" }}>
              No ads available yet
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Be the first to post a {activeTab} ad!
            </p>
            {isLoggedIn && isKYCVerified && (
              <Button
                onClick={() => setShowPostModal(true)}
                className="mt-4"
                data-ocid="p2p.first_post.button"
                style={{
                  background: "linear-gradient(135deg,#FFD700,#FFA500)",
                  color: "#000",
                }}
              >
                Post First Ad
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map((ad, idx) => {
              const countryInfo = COUNTRY_DATA[ad.country];
              const localPrice = ad.price * (countryInfo?.rate || 1);
              return (
                <div
                  key={ad.id}
                  data-ocid={`p2p.item.${idx + 1}`}
                  className="rounded-2xl p-5 flex flex-wrap items-center gap-4"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Advertiser */}
                  <div className="min-w-32">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: "rgba(255,215,0,0.15)",
                          color: "#FFD700",
                        }}
                      >
                        {ad.postedBy[0].toUpperCase()}
                      </div>
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "#F5F6F8" }}
                      >
                        {ad.postedBy}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={String(i)}
                          className="w-3 h-3"
                          style={{
                            color:
                              i < Math.floor(ad.rating)
                                ? "#FFD700"
                                : "rgba(255,255,255,0.15)",
                            fill:
                              i < Math.floor(ad.rating) ? "#FFD700" : "none",
                          }}
                        />
                      ))}
                      <span
                        className="text-[10px] ml-1"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {ad.completionRate}%
                      </span>
                    </div>
                  </div>
                  {/* Price */}
                  <div className="min-w-24">
                    <p
                      className="text-[10px] mb-0.5"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Price
                    </p>
                    <p
                      className="font-bold text-sm"
                      style={{ color: "#FFD700" }}
                    >
                      {localPrice.toFixed(2)} {countryInfo?.currency || "USD"}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      per {ad.coin}
                    </p>
                  </div>
                  {/* Limits */}
                  <div className="min-w-28">
                    <p
                      className="text-[10px] mb-0.5"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Available
                    </p>
                    <p className="text-sm" style={{ color: "#F5F6F8" }}>
                      ${ad.minAmount} – ${ad.maxAmount}
                    </p>
                    <Badge
                      style={{
                        marginTop: 4,
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 10,
                      }}
                    >
                      {ad.coin}
                    </Badge>
                  </div>
                  {/* Payment methods */}
                  <div className="flex-1 min-w-32">
                    <p
                      className="text-[10px] mb-1"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Payment
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {ad.paymentMethods.slice(0, 3).map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-full text-[10px]"
                          style={{
                            background: "rgba(0,240,255,0.08)",
                            color: "#00F0FF",
                            border: "1px solid rgba(0,240,255,0.15)",
                          }}
                        >
                          {m}
                        </span>
                      ))}
                      {ad.paymentMethods.length > 3 && (
                        <span
                          className="text-[10px]"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          +{ad.paymentMethods.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Trade button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast.error("Please login first");
                        return;
                      }
                      if (!isKYCVerified) {
                        toast.error("Complete KYC to trade");
                        return;
                      }
                      setTradeAd(ad);
                    }}
                    data-ocid={`p2p.trade.button.${idx + 1}`}
                    className="px-5 py-2 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background:
                        ad.type === "sell"
                          ? "rgba(0,255,136,0.15)"
                          : "rgba(255,51,102,0.15)",
                      border: `1px solid ${ad.type === "sell" ? "rgba(0,255,136,0.3)" : "rgba(255,51,102,0.3)"}`,
                      color: ad.type === "sell" ? "#21C57A" : "#E24A4A",
                    }}
                  >
                    {ad.type === "sell" ? "Buy" : "Sell"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Ad Modal */}
      <PostAdModal
        open={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPost={handlePostAd}
      />

      {/* Trade Modal */}
      {tradeAd && <TradeModal ad={tradeAd} onClose={() => setTradeAd(null)} />}
    </div>
  );
}
