import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Position = {
  id: string;
  symbol: string;
  type: "long" | "short";
  entryPrice: number;
  leverage: number;
  margin: number;
  amount: number;
  timestamp: number;
};

function getWalletBalance(): Record<string, number> {
  try {
    const raw = localStorage.getItem("skce_wallet_balance");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { USDT: 0, BTC: 0, ETH: 0, SOL: 0, BNB: 0 };
}

function setWalletBalance(bal: Record<string, number>) {
  localStorage.setItem("skce_wallet_balance", JSON.stringify(bal));
}

function loadPositions(): Position[] {
  try {
    return JSON.parse(localStorage.getItem("skce_positions") || "[]");
  } catch {
    return [];
  }
}

function savePositions(positions: Position[]) {
  localStorage.setItem("skce_positions", JSON.stringify(positions));
}

export function Positions() {
  const [positions, setPositions] = useState<Position[]>(loadPositions);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = useCallback(async (syms: string[]) => {
    if (!syms.length) return;
    setRefreshing(true);
    const results: Record<string, number> = {};
    await Promise.all(
      syms.map(async (sym) => {
        try {
          const res = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${sym}`,
          );
          const d = await res.json();
          results[sym] = Number.parseFloat(d.price);
        } catch {}
      }),
    );
    setPrices((prev) => ({ ...prev, ...results }));
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const symbols = [...new Set(positions.map((p) => p.symbol))];
    fetchPrices(symbols);
    const iv = setInterval(() => fetchPrices(symbols), 5000);
    return () => clearInterval(iv);
  }, [positions, fetchPrices]);

  function calcPNL(pos: Position): number {
    const cur = prices[pos.symbol];
    if (!cur) return 0;
    if (pos.type === "long") {
      return (
        ((cur - pos.entryPrice) / pos.entryPrice) * pos.leverage * pos.margin
      );
    }
    return (
      ((pos.entryPrice - cur) / pos.entryPrice) * pos.leverage * pos.margin
    );
  }

  function calcROI(pos: Position): number {
    if (!pos.margin) return 0;
    return (calcPNL(pos) / pos.margin) * 100;
  }

  function calcLiquidation(pos: Position): number {
    if (pos.type === "long") return pos.entryPrice * (1 - 1 / pos.leverage);
    return pos.entryPrice * (1 + 1 / pos.leverage);
  }

  function closePosition(id: string) {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;
    const pnl = calcPNL(pos);
    const bal = getWalletBalance();
    bal.USDT = (bal.USDT || 0) + pos.margin + pnl;
    setWalletBalance(bal);
    const updated = positions.filter((p) => p.id !== id);
    setPositions(updated);
    savePositions(updated);
    toast[pnl >= 0 ? "success" : "error"](
      `Position closed: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`,
    );
  }

  const totalPNL = positions.reduce((sum, p) => sum + calcPNL(p), 0);

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/futures">
            <button
              type="button"
              data-ocid="positions.back.button"
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border"
              style={{
                borderColor: "rgba(255,215,0,0.2)",
                color: "#FFD700",
                background: "rgba(255,215,0,0.05)",
              }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Futures
            </button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#F5F6F8" }}>
            My Positions
          </h1>
          <button
            type="button"
            onClick={() =>
              fetchPrices([...new Set(positions.map((p) => p.symbol))])
            }
            data-ocid="positions.refresh.button"
            className="ml-auto p-2 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: refreshing ? "#FFD700" : "rgba(255,255,255,0.5)",
            }}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Total PNL Summary */}
        {positions.length > 0 && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background:
                totalPNL >= 0
                  ? "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,200,100,0.05))"
                  : "linear-gradient(135deg, rgba(255,51,102,0.08), rgba(200,0,50,0.05))",
              border: `1px solid ${
                totalPNL >= 0 ? "rgba(0,255,136,0.2)" : "rgba(255,51,102,0.2)"
              }`,
            }}
            data-ocid="positions.summary.card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Total Unrealized PNL
                </p>
                <p
                  className="text-3xl font-bold font-mono mt-1"
                  style={{ color: totalPNL >= 0 ? "#21C57A" : "#E24A4A" }}
                >
                  {totalPNL >= 0 ? "+" : ""}
                  {totalPNL.toFixed(2)} USDT
                </p>
              </div>
              {totalPNL >= 0 ? (
                <TrendingUp
                  className="w-10 h-10"
                  style={{ color: "#21C57A" }}
                />
              ) : (
                <TrendingDown
                  className="w-10 h-10"
                  style={{ color: "#E24A4A" }}
                />
              )}
            </div>
            <p
              className="text-xs mt-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {positions.length} open position
              {positions.length !== 1 ? "s" : ""} • Auto-refreshing every 5s
            </p>
          </div>
        )}

        {/* Positions List */}
        {positions.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            data-ocid="positions.empty_state"
          >
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg font-bold mb-2" style={{ color: "#F5F6F8" }}>
              No Open Positions
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Go trade to open your first position!
            </p>
            <Link to="/futures">
              <Button
                data-ocid="positions.go_trade.button"
                style={{
                  background: "linear-gradient(135deg,#FFD700,#FFA500)",
                  color: "#000",
                }}
              >
                Open Futures Trading
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((pos, idx) => {
              const cur = prices[pos.symbol];
              const pnl = calcPNL(pos);
              const roi = calcROI(pos);
              const liq = calcLiquidation(pos);
              return (
                <div
                  key={pos.id}
                  data-ocid={`positions.item.${idx + 1}`}
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-bold text-lg"
                        style={{ color: "#F5F6F8" }}
                      >
                        {pos.symbol}
                      </span>
                      <Badge
                        style={{
                          background:
                            pos.type === "long"
                              ? "rgba(0,255,136,0.15)"
                              : "rgba(255,51,102,0.15)",
                          color: pos.type === "long" ? "#21C57A" : "#E24A4A",
                          border: `1px solid ${
                            pos.type === "long"
                              ? "rgba(0,255,136,0.3)"
                              : "rgba(255,51,102,0.3)"
                          }`,
                        }}
                      >
                        {pos.type.toUpperCase()}
                      </Badge>
                      <Badge
                        style={{
                          background: "rgba(255,215,0,0.1)",
                          color: "#FFD700",
                          border: "1px solid rgba(255,215,0,0.2)",
                        }}
                      >
                        {pos.leverage}x
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => closePosition(pos.id)}
                      data-ocid={`positions.close_button.${idx + 1}`}
                      className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-80"
                      style={{
                        background: "rgba(255,51,102,0.15)",
                        border: "1px solid rgba(255,51,102,0.3)",
                        color: "#E24A4A",
                      }}
                    >
                      Close Position
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Entry Price",
                        value: `$${pos.entryPrice.toFixed(2)}`,
                        color: "#F5F6F8",
                      },
                      {
                        label: "Current Price",
                        value: cur ? `$${cur.toFixed(2)}` : "Loading...",
                        color: "#FFD700",
                      },
                      {
                        label: "PNL",
                        value: `${pnl >= 0 ? "+" : ""}${pnl.toFixed(4)} USDT`,
                        sub: `ROI: ${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`,
                        color: pnl >= 0 ? "#21C57A" : "#E24A4A",
                      },
                      {
                        label: "Liquidation",
                        value: `$${liq.toFixed(2)}`,
                        color: "#FF6B35",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        <p
                          className="text-[11px] mb-1"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="font-mono font-bold text-sm"
                          style={{ color: item.color }}
                        >
                          {item.value}
                        </p>
                        {item.sub && (
                          <p
                            className="text-[10px] mt-0.5"
                            style={{ color: item.color }}
                          >
                            {item.sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-3 flex items-center gap-4 text-xs"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    <span>Margin: ${pos.margin.toFixed(2)}</span>
                    <span>
                      Amount: {pos.amount} {pos.symbol.replace("USDT", "")}
                    </span>
                    <span>
                      Opened: {new Date(pos.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
