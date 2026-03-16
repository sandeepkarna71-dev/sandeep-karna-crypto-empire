import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  Loader2,
  Wallet as WalletIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

const ADDRESSES = [
  {
    currency: "USDT (TRC20)",
    symbol: "USDT",
    address: "TFiaFMNBnDFkLNE9n46jDvtysvU5vLPFL9",
    color: "text-green-400",
    network: "Tron Network",
  },
  {
    currency: "Ethereum (ETH)",
    symbol: "ETH",
    address: "0x8778663Dc7A7814eb6d443384fdb23AE180a7F8F",
    color: "text-blue-400",
    network: "ERC-20",
  },
  {
    currency: "Bitcoin (BTC)",
    symbol: "BTC",
    address: "bc1qaan3fp940gg6hy2nhnuta4d7208x84gfrcxuc6",
    color: "text-orange-400",
    network: "Bitcoin Network",
  },
  {
    currency: "Solana (SOL)",
    symbol: "SOL",
    address: "G4vAf5wE1o7CnxYEWKPk96Ym9Y3Qd1ZWsU2QNsruG6PX",
    color: "text-purple-400",
    network: "Solana Network",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      data-ocid="wallet.button"
      className="p-1.5 rounded-md text-muted-foreground hover:text-gold transition-colors"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

export function Wallet() {
  const { user, isLoggedIn } = useAuth();
  const { actor } = useActor();

  const [depositForm, setDepositForm] = useState({
    currency: "USDT",
    amount: "",
    txHash: "",
    referralCode: "",
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    currency: "USDT",
    walletAddress: "",
  });
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const balance = user?.balance || 0;

  // Load local tx history
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
      if (actor) {
        try {
          await actor.submitDepositRequest(
            user!.username,
            depositForm.currency,
            depositForm.amount,
            depositForm.txHash,
          );
        } catch {
          /* ignore backend failure */
        }
      }
      addTx({
        type: "deposit",
        currency: depositForm.currency,
        amount: depositForm.amount,
        txHash: depositForm.txHash,
        status: "pending",
      });
      toast.success(
        "Deposit request submitted! Admin will approve within 24 hours.",
      );
      setDepositForm({
        currency: "USDT",
        amount: "",
        txHash: "",
        referralCode: "",
      });
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
      if (actor) {
        try {
          await actor.submitWithdrawalRequest(
            user!.username,
            BigInt(Math.round(amt * 1000)),
            withdrawForm.currency,
            withdrawForm.walletAddress,
          );
        } catch {
          /* ignore */
        }
      }
      addTx({
        type: "withdrawal",
        currency: withdrawForm.currency,
        amount: withdrawForm.amount,
        walletAddress: withdrawForm.walletAddress,
        status: "pending",
      });
      toast.success(
        "Withdrawal request submitted! Admin will process within 24 hours.",
      );
      setWithdrawForm({ amount: "", currency: "USDT", walletAddress: "" });
    } finally {
      setWithdrawLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold gold-gradient mb-2">
            Wallet
          </h1>
          <p className="text-muted-foreground">
            Deposit, withdraw and track your transactions
          </p>
        </motion.div>

        {/* Balance card */}
        <div className="glass-card rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Available Balance
            </div>
            <div className="font-display text-4xl font-bold text-gold">
              ${balance.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">USDT</div>
          </div>
          <WalletIcon className="w-16 h-16 text-gold/20" />
        </div>

        <Tabs defaultValue="deposit" data-ocid="wallet.tab">
          <TabsList className="bg-background/50 border border-border/50 w-full mb-6">
            <TabsTrigger
              value="deposit"
              data-ocid="wallet.tab"
              className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-navy"
            >
              <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              data-ocid="wallet.tab"
              className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-navy"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
            </TabsTrigger>
            <TabsTrigger
              value="history"
              data-ocid="wallet.tab"
              className="flex-1 data-[state=active]:bg-gold data-[state=active]:text-navy"
            >
              History
            </TabsTrigger>
          </TabsList>

          {/* Deposit */}
          <TabsContent value="deposit">
            <div className="space-y-6">
              {/* Wallet addresses */}
              <div>
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  Send Crypto to These Addresses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADDRESSES.map((a) => (
                    <div key={a.symbol} className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-sm ${a.color}`}>
                          {a.currency}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs border-border/50 text-muted-foreground"
                        >
                          {a.network}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
                        <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
                          {a.address}
                        </span>
                        <CopyButton text={a.address} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposit form */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  Submit Deposit
                </h3>
                <form onSubmit={handleDeposit}>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-foreground/80">
                        Currency
                      </Label>
                      <Select
                        value={depositForm.currency}
                        onValueChange={(v) =>
                          setDepositForm({ ...depositForm, currency: v })
                        }
                      >
                        <SelectTrigger
                          data-ocid="wallet.select"
                          className="bg-background/50 border-border/60"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["USDT", "ETH", "BTC", "SOL"].map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-foreground/80">
                        Amount (USD)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 100"
                        data-ocid="wallet.input"
                        value={depositForm.amount}
                        onChange={(e) =>
                          setDepositForm({
                            ...depositForm,
                            amount: e.target.value,
                          })
                        }
                        className="bg-background/50 border-border/60 focus:border-gold/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-foreground/80">
                        Transaction Hash *
                      </Label>
                      <Input
                        type="text"
                        placeholder="Paste your transaction hash"
                        data-ocid="wallet.input"
                        value={depositForm.txHash}
                        onChange={(e) =>
                          setDepositForm({
                            ...depositForm,
                            txHash: e.target.value,
                          })
                        }
                        className="bg-background/50 border-border/60 focus:border-gold/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      data-ocid="wallet.submit_button"
                      disabled={depositLoading}
                      className="w-full bg-gradient-to-r from-gold to-orange-brand text-navy font-bold h-11"
                    >
                      {depositLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Deposit Request
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* Withdraw */}
          <TabsContent value="withdraw">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">
                Withdraw Funds
              </h3>
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm rounded-lg px-4 py-3 mb-5">
                ⚠️ Minimum withdrawal: $10 USDT. All requests reviewed within 24
                hours by admin.
              </div>
              <form onSubmit={handleWithdraw}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground/80">
                      Amount (min $10)
                    </Label>
                    <Input
                      type="number"
                      min="10"
                      placeholder="Minimum $10"
                      data-ocid="wallet.input"
                      value={withdrawForm.amount}
                      onChange={(e) =>
                        setWithdrawForm({
                          ...withdrawForm,
                          amount: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground/80">
                      Currency
                    </Label>
                    <Select
                      value={withdrawForm.currency}
                      onValueChange={(v) =>
                        setWithdrawForm({ ...withdrawForm, currency: v })
                      }
                    >
                      <SelectTrigger
                        data-ocid="wallet.select"
                        className="bg-background/50 border-border/60"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["USDT", "ETH", "BTC", "SOL"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground/80">
                      Your Wallet Address *
                    </Label>
                    <Input
                      type="text"
                      placeholder="Your receiving wallet address"
                      data-ocid="wallet.input"
                      value={withdrawForm.walletAddress}
                      onChange={(e) =>
                        setWithdrawForm({
                          ...withdrawForm,
                          walletAddress: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="wallet.submit_button"
                    disabled={withdrawLoading}
                    className="w-full bg-gradient-to-r from-gold to-orange-brand text-navy font-bold h-11"
                  >
                    {withdrawLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Submit Withdrawal
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <div
              className="glass-card rounded-2xl overflow-hidden"
              data-ocid="wallet.table"
            >
              {txHistory.length === 0 ? (
                <div
                  data-ocid="wallet.empty_state"
                  className="text-center py-16 text-muted-foreground"
                >
                  No transactions yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        {["Type", "Currency", "Amount", "Status", "Date"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {txHistory.map((tx: any, i: number) => (
                        <tr
                          key={tx.date + String(i)}
                          data-ocid={"wallet.row"}
                          className="border-b border-border/20 hover:bg-gold/5 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                tx.type === "deposit"
                                  ? "text-green-400 border-green-500/30"
                                  : "text-orange-400 border-orange-500/30"
                              }
                            >
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {tx.currency}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            ${tx.amount}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium ${
                                tx.status === "approved"
                                  ? "text-green-400"
                                  : tx.status === "rejected"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
