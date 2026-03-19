import { ArrowDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const COINS = [
  { symbol: "BTC", name: "Bitcoin", binance: "BTCUSDT" },
  { symbol: "ETH", name: "Ethereum", binance: "ETHUSDT" },
  { symbol: "SOL", name: "Solana", binance: "SOLUSDT" },
  { symbol: "BNB", name: "BNB", binance: "BNBUSDT" },
];

function getWallet(): Record<string, number> {
  try {
    const raw = localStorage.getItem("skce_wallet_balance");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { USDT: 0, BTC: 0, ETH: 0, SOL: 0, BNB: 0 };
}

function setWallet(bal: Record<string, number>) {
  localStorage.setItem("skce_wallet_balance", JSON.stringify(bal));
}

export function Convert() {
  const [fromCoin, setFromCoin] = useState(COINS[0]);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [converting, setConverting] = useState(false);
  const [wallet, setWalletState] = useState(getWallet);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${fromCoin.binance}`,
        );
        const d = await res.json();
        setRate(Number.parseFloat(d.price));
        setCountdown(10);
      } catch {}
    }
    fetchRate();
    const iv = setInterval(fetchRate, 10000);
    const ct = setInterval(
      () => setCountdown((c) => (c <= 1 ? 10 : c - 1)),
      1000,
    );
    return () => {
      clearInterval(iv);
      clearInterval(ct);
    };
  }, [fromCoin.binance]);

  const amt = Number.parseFloat(amount) || 0;
  const receive = amt * rate * (1 - 0.001);
  const fee = amt * rate * 0.001;
  const balance = wallet[fromCoin.symbol] || 0;

  async function handleConvert() {
    if (amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!rate) {
      toast.error("Rate not loaded yet");
      return;
    }
    setConverting(true);
    await new Promise((r) => setTimeout(r, 800));
    const bal = getWallet();
    bal[fromCoin.symbol] = (bal[fromCoin.symbol] || 0) - amt;
    bal.USDT = (bal.USDT || 0) + receive;
    setWallet(bal);
    setWalletState(bal);
    toast.success(
      `Converted ${amt} ${fromCoin.symbol} → ${receive.toFixed(4)} USDT`,
    );
    setAmount("");
    setConverting(false);
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#F5F6F8" }}>
          Convert Crypto
        </h1>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          Instantly swap your crypto to USDT
        </p>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* From */}
          <div className="mb-3">
            <p
              className="text-xs mb-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              From
            </p>
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <select
                  value={fromCoin.symbol}
                  onChange={(e) => {
                    const c = COINS.find((c) => c.symbol === e.target.value);
                    if (c) setFromCoin(c);
                  }}
                  data-ocid="convert.select"
                  className="bg-transparent font-bold text-lg outline-none"
                  style={{ color: "#FFD700" }}
                >
                  {COINS.map((c) => (
                    <option
                      key={c.symbol}
                      value={c.symbol}
                      style={{ background: "#0A0A0A" }}
                    >
                      {c.symbol}
                    </option>
                  ))}
                </select>
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Balance: {balance.toFixed(6)} {fromCoin.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-ocid="convert.input"
                  className="flex-1 bg-transparent text-2xl font-mono outline-none"
                  style={{ color: "#F5F6F8" }}
                />
                <button
                  type="button"
                  onClick={() => setAmount(balance.toFixed(8))}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: "rgba(255,215,0,0.1)",
                    color: "#FFD700",
                  }}
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-3">
            <div
              className="p-2 rounded-full"
              style={{ background: "rgba(255,215,0,0.1)" }}
            >
              <ArrowDown className="w-5 h-5" style={{ color: "#FFD700" }} />
            </div>
          </div>

          {/* To */}
          <div className="mb-6">
            <p
              className="text-xs mb-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              To (USDT)
            </p>
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="font-bold text-lg"
                  style={{ color: "#00FF88" }}
                >
                  USDT
                </span>
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Balance: {(wallet.USDT || 0).toFixed(2)} USDT
                </span>
              </div>
              <p
                className="text-2xl font-mono font-bold"
                style={{
                  color: receive > 0 ? "#00FF88" : "rgba(255,255,255,0.2)",
                }}
              >
                {receive > 0 ? receive.toFixed(6) : "0.00"}
              </p>
            </div>
          </div>

          {/* Rate info */}
          <div
            className="rounded-xl p-3 mb-6"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                Exchange Rate
              </span>
              <div
                className="flex items-center gap-1"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refreshes in {countdown}s</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "rgba(255,255,255,0.6)" }}>
                1 {fromCoin.symbol} ={" "}
                {rate > 0 ? `${rate.toFixed(2)} USDT` : "Loading..."}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                Fee: {fee > 0 ? fee.toFixed(6) : "0.00"} USDT (0.1%)
              </span>
            </div>
          </div>

          {/* Convert button */}
          <button
            type="button"
            onClick={handleConvert}
            disabled={converting || amt <= 0 || amt > balance}
            data-ocid="convert.submit_button"
            className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-40"
            style={{
              background: converting
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg,#FFD700,#FFA500)",
              color: "#0A0A0A",
              boxShadow: converting ? "none" : "0 0 24px rgba(255,215,0,0.3)",
            }}
          >
            {converting ? "Converting..." : `Convert ${fromCoin.symbol} → USDT`}
          </button>
        </div>
      </div>
    </div>
  );
}
