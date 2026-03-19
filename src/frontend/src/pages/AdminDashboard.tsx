import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Layers,
  Loader2,
  LogOut,
  Megaphone,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

type Signal = {
  id: number;
  asset: string;
  type: "BUY" | "SELL" | "HOLD";
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  description: string;
  date: string;
};

type Vlog = {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  watchReward: number;
  date: string;
};
type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
};
type Ad = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  date: string;
};

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

type FutureContent = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  reward: number;
  date: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function useAdminCheck() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("sce_admin_logged_in") !== "true") {
      navigate({ to: "/admin" });
    }
  }, [navigate]);
}

function getSCEUsers() {
  try {
    return JSON.parse(localStorage.getItem("sce_users") || "[]");
  } catch {
    return [];
  }
}

function loadLS<T>(key: string, def: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? def;
  } catch {
    return def;
  }
}
function saveLS(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

function P2PDashboard() {
  const [p2pAds, setP2pAds] = React.useState<any[]>(() =>
    loadLS("skce_p2p_ads", []),
  );
  const [disputes, setDisputes] = React.useState<any[]>(() =>
    loadLS("skce_p2p_disputes", []),
  );

  React.useEffect(() => {
    const iv = setInterval(() => {
      setP2pAds(loadLS("skce_p2p_ads", []));
      setDisputes(loadLS("skce_p2p_disputes", []));
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  function suspendAd(id: string) {
    const updated = p2pAds.map((a: any) =>
      a.id === id ? { ...a, status: "suspended" } : a,
    );
    saveLS("skce_p2p_ads", updated);
    setP2pAds(updated);
    toast.success("Ad suspended");
  }

  function activateAd(id: string) {
    const updated = p2pAds.map((a: any) =>
      a.id === id ? { ...a, status: "active" } : a,
    );
    saveLS("skce_p2p_ads", updated);
    setP2pAds(updated);
    toast.success("Ad activated");
  }

  function resolveDispute(id: string, resolution: "buyer" | "seller") {
    const updated = disputes.map((d: any) =>
      d.id === id ? { ...d, status: "resolved", resolution } : d,
    );
    saveLS("skce_p2p_disputes", updated);
    setDisputes(updated);
    toast.success(`Dispute resolved in favor of ${resolution}`);
  }

  function rejectDispute(id: string) {
    const updated = disputes.map((d: any) =>
      d.id === id ? { ...d, status: "rejected" } : d,
    );
    saveLS("skce_p2p_disputes", updated);
    setDisputes(updated);
    toast.error("Dispute rejected");
  }

  // Fraud detection: users with >3 disputes or suspicious activity
  const disputeCounts: Record<string, number> = {};
  for (const d of disputes) {
    disputeCounts[d.buyer] = (disputeCounts[d.buyer] || 0) + 1;
    disputeCounts[d.seller] = (disputeCounts[d.seller] || 0) + 1;
  }
  const flaggedUsers = Object.entries(disputeCounts)
    .filter(([, count]) => count >= 2)
    .map(([user, count]) => ({ user, count }));

  const activeAds = p2pAds.filter((a: any) => a.status === "active");
  const pendingDisputes = disputes.filter((d: any) => d.status === "pending");

  return (
    <div className="space-y-6" data-ocid="admin.p2p.panel">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Ads", value: p2pAds.length, color: "#FFD700" },
          { label: "Active Ads", value: activeAds.length, color: "#21C57A" },
          {
            label: "Pending Disputes",
            value: pendingDisputes.length,
            color: "#FF9500",
          },
          {
            label: "Fraud Flags",
            value: flaggedUsers.length,
            color: "#E24A4A",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-4"
            data-ocid="admin.p2p.card"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p
              className="text-3xl font-bold mt-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Active Ads Table */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-foreground mb-4">
          Active P2P Ads
        </h3>
        {p2pAds.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="admin.p2p.ads.empty_state"
          >
            No ads posted yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="admin.p2p.ads.table">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left pb-3">Ad ID</th>
                  <th className="text-left pb-3">User</th>
                  <th className="text-left pb-3">Type</th>
                  <th className="text-left pb-3">Coin</th>
                  <th className="text-right pb-3">Price</th>
                  <th className="text-left pb-3">Limits</th>
                  <th className="text-left pb-3">Country</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-left pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {p2pAds.map((ad: any, idx: number) => (
                  <tr
                    key={ad.id}
                    data-ocid={`admin.p2p.ad.row.${idx + 1}`}
                    className="border-t border-border/30"
                  >
                    <td className="py-2 text-xs text-muted-foreground font-mono">
                      {ad.id.slice(-6)}
                    </td>
                    <td className="py-2 font-semibold text-foreground">
                      {ad.postedBy}
                    </td>
                    <td className="py-2">
                      <Badge
                        style={{
                          background:
                            ad.type === "buy"
                              ? "rgba(0,255,136,0.15)"
                              : "rgba(255,51,102,0.15)",
                          color: ad.type === "buy" ? "#21C57A" : "#E24A4A",
                        }}
                      >
                        {ad.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2 font-bold" style={{ color: "#FFD700" }}>
                      {ad.coin}
                    </td>
                    <td className="py-2 text-right font-mono text-foreground">
                      ${ad.price}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      ${ad.minAmount}–${ad.maxAmount}
                    </td>
                    <td className="py-2 text-muted-foreground">{ad.country}</td>
                    <td className="py-2">
                      <Badge
                        style={{
                          background:
                            ad.status === "active"
                              ? "rgba(0,255,136,0.1)"
                              : "rgba(255,51,102,0.1)",
                          color: ad.status === "active" ? "#21C57A" : "#E24A4A",
                        }}
                      >
                        {ad.status}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        {ad.status === "active" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 text-xs"
                            onClick={() => suspendAd(ad.id)}
                            data-ocid={`admin.p2p.suspend.button.${idx + 1}`}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-6 text-xs bg-green-700"
                            onClick={() => activateAd(ad.id)}
                            data-ocid={`admin.p2p.activate.button.${idx + 1}`}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disputes */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-foreground mb-4">
          Disputes
        </h3>
        {disputes.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="admin.p2p.disputes.empty_state"
          >
            No disputes raised.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              data-ocid="admin.p2p.disputes.table"
            >
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left pb-3">Dispute ID</th>
                  <th className="text-left pb-3">Buyer</th>
                  <th className="text-left pb-3">Seller</th>
                  <th className="text-right pb-3">Amount</th>
                  <th className="text-left pb-3">Reason</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-left pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d: any, idx: number) => (
                  <tr
                    key={d.id}
                    data-ocid={`admin.p2p.dispute.row.${idx + 1}`}
                    className="border-t border-border/30"
                  >
                    <td className="py-2 font-mono text-xs text-muted-foreground">
                      {d.id}
                    </td>
                    <td className="py-2 text-foreground">{d.buyer}</td>
                    <td className="py-2 text-foreground">{d.seller}</td>
                    <td className="py-2 text-right font-mono text-foreground">
                      ${d.amount}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {d.reason}
                    </td>
                    <td className="py-2">
                      <Badge
                        style={{
                          background:
                            d.status === "pending"
                              ? "rgba(255,149,0,0.1)"
                              : d.status === "resolved"
                                ? "rgba(0,255,136,0.1)"
                                : "rgba(255,51,102,0.1)",
                          color:
                            d.status === "pending"
                              ? "#FF9500"
                              : d.status === "resolved"
                                ? "#21C57A"
                                : "#E24A4A",
                        }}
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {d.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-6 text-xs bg-blue-700"
                            onClick={() => resolveDispute(d.id, "buyer")}
                            data-ocid={`admin.p2p.resolve_buyer.button.${idx + 1}`}
                          >
                            → Buyer
                          </Button>
                          <Button
                            size="sm"
                            className="h-6 text-xs bg-purple-700"
                            onClick={() => resolveDispute(d.id, "seller")}
                            data-ocid={`admin.p2p.resolve_seller.button.${idx + 1}`}
                          >
                            → Seller
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 text-xs"
                            onClick={() => rejectDispute(d.id)}
                            data-ocid={`admin.p2p.reject.button.${idx + 1}`}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fraud Detection */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-bold text-foreground mb-4">
          Fraud Detection
        </h3>
        {flaggedUsers.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="admin.p2p.fraud.empty_state"
          >
            No suspicious users detected.
          </p>
        ) : (
          <div className="space-y-3">
            {flaggedUsers.map((fu, idx) => (
              <div
                key={fu.user}
                data-ocid={`admin.p2p.fraud.item.${idx + 1}`}
                className="flex items-center justify-between p-3 rounded-xl border border-border/30"
              >
                <div>
                  <p className="font-bold text-foreground">{fu.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {fu.count} disputes raised — potential fraud risk
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    data-ocid={`admin.p2p.warn.button.${idx + 1}`}
                    onClick={() => toast.warning(`Warning sent to ${fu.user}`)}
                  >
                    Warn
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    data-ocid={`admin.p2p.suspend_user.button.${idx + 1}`}
                    onClick={() => toast.error(`${fu.user} account suspended`)}
                  >
                    Suspend
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSettings() {
  const [settings, setSettings] = React.useState<{ dailyLimit: number }>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("sce_admin_settings") || "{}") || {
          dailyLimit: 500,
        }
      );
    } catch {
      return { dailyLimit: 500 };
    }
  });
  const [saved, setSaved] = React.useState(false);

  function save() {
    localStorage.setItem("sce_admin_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("Settings saved!");
  }

  return (
    <div
      className="glass-card rounded-2xl p-6 max-w-lg"
      data-ocid="admin.settings.panel"
    >
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Site Settings
      </h2>
      <div className="space-y-5">
        <div>
          <Label
            htmlFor="daily-limit"
            className="text-sm font-semibold text-foreground mb-1.5 block"
          >
            Daily Earning Limit (USDT)
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Maximum USDT a user can earn per day. Change this to control daily
            payouts.
          </p>
          <Input
            id="daily-limit"
            type="number"
            min={1}
            value={settings.dailyLimit}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                dailyLimit: Number(e.target.value) || 500,
              }))
            }
            data-ocid="admin.settings.input"
            className="max-w-xs"
            placeholder="500"
          />
        </div>
        <Button
          onClick={save}
          data-ocid="admin.settings.save_button"
          className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold"
        >
          {saved ? "✓ Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  useAdminCheck();
  const navigate = useNavigate();
  const { actor } = useActor();

  const [vlogs, setVlogs] = useState<Vlog[]>(() =>
    loadLS("sce_admin_vlogs", []),
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadLS("sce_admin_announcements", []),
  );
  const [ads, setAds] = useState<Ad[]>(() => loadLS("sce_admin_ads", []));
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sce_admin_tasks") || "[]");
    } catch {
      return [];
    }
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "Daily",
    adUrl: "",
    imageUrl: "",
    videoUrl: "",
    audioUrl: "",
    steps: "",
    reward: "0.5",
  });
  const [signals, setSignals] = useState<Signal[]>(() =>
    loadLS("sce_admin_signals", []),
  );
  const [loading, setLoading] = useState(false);
  const [futures, setFutures] = useState<FutureContent[]>(() =>
    loadLS("sce_admin_futures", []),
  );
  const [futureForm, setFutureForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    linkUrl: "",
    reward: "0",
  });

  const [users, setUsers] = useState<any[]>(() => getSCEUsers());
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const [canisterUsers, setCanisterUsers] = React.useState<any[]>([]);
  const [kycSubmissions, setKycSubmissions] = React.useState<any[]>([]);
  const [setBalanceForm, setSetBalanceForm] = React.useState<{
    username: string;
    value: string;
  }>({ username: "", value: "" });

  // Merge localStorage + canister users (canister takes priority, dedup by username)
  const allUsers = React.useMemo(() => {
    const localUsers = users.map((u: any) => ({ ...u, _source: "local" }));
    const canisterMapped = canisterUsers.map((u: any) => ({
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      balance: Number(u.balance) / 1_000_000,
      totalEarned: Number(u.totalEarned) / 1_000_000,
      totalDeposited: Number(u.totalDeposited) / 1_000_000,
      referralCode: u.referralCode,
      joinDate: new Date(Number(u.joinDate) / 1_000_000).toISOString(),
      activePlan: null,
      referredBy:
        u.referredBy && u.referredBy.length > 0 ? u.referredBy[0] : null,
      principalId: u.principalId,
      _source: "canister",
    }));
    const merged: any[] = [...canisterMapped];
    for (const lu of localUsers) {
      const exists = merged.find(
        (m) => m.username.toLowerCase() === lu.username.toLowerCase(),
      );
      if (!exists) merged.push(lu);
    }
    return merged;
  }, [users, canisterUsers]);

  // Auto-refresh users, deposits, withdrawals every 3 seconds and on focus
  useEffect(() => {
    function refresh() {
      const allUsrs = getSCEUsers();
      setUsers(allUsrs);
      // Load KYC submissions
      const subs: any[] = [];
      for (const u of allUsrs) {
        const kyc = localStorage.getItem(`sce_kyc_${u.username}`);
        if (kyc) {
          try {
            subs.push(JSON.parse(kyc));
          } catch {}
        }
      }
      setKycSubmissions(subs);
    }
    const interval = setInterval(refresh, 3000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  // Fetch canister users, deposits, withdrawals periodically
  useEffect(() => {
    async function fetchCanisterData() {
      if (!actor) return;
      try {
        const [users, deps, withs] = await Promise.all([
          (actor as any).getAllUsersPublic(),
          (actor as any).getAllDepositsPublic(),
          (actor as any).getAllWithdrawalsPublic(),
        ]);
        if (Array.isArray(users)) setCanisterUsers(users);
        if (Array.isArray(deps)) {
          const pending = deps.filter(
            (d: any) => d.status && "pending" in d.status,
          );
          setDeposits(
            pending.map((d: any) => ({
              id: Number(d.id),
              username: d.username,
              currency: d.currency,
              amount: d.amount,
              txHash: d.txHash,
              createdAt: Number(d.createdAt),
              _source: "canister",
            })),
          );
        }
        if (Array.isArray(withs)) {
          const pending = withs.filter(
            (w: any) => w.status && "pending" in w.status,
          );
          setWithdrawals(
            pending.map((w: any) => ({
              id: Number(w.id),
              username: w.username,
              currency: w.currency,
              amount: (Number(w.amount) / 1_000_000).toFixed(2),
              walletAddress: w.walletAddress,
              createdAt: Number(w.createdAt),
              _source: "canister",
            })),
          );
        }
      } catch {
        // silent fail
      }
    }
    fetchCanisterData();
    const interval = setInterval(fetchCanisterData, 4000);
    return () => clearInterval(interval);
  }, [actor]);

  // Forms
  const [vlogForm, setVlogForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    watchReward: 0.1,
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  });
  const [adForm, setAdForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    linkUrl: "",
  });
  const [signalForm, setSignalForm] = useState<Omit<Signal, "id" | "date">>({
    asset: "BTC/USDT",
    type: "BUY",
    entryPrice: "",
    targetPrice: "",
    stopLoss: "",
    description: "",
  });

  function logout() {
    localStorage.removeItem("sce_admin_logged_in");
    navigate({ to: "/" });
    toast.success("Admin logged out.");
  }

  async function handleVlogFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "videoUrl" | "thumbnailUrl",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setVlogForm((prev) => ({ ...prev, [field]: b64 }));
    toast.success("File uploaded!");
  }

  async function handleAdFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "videoUrl",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setAdForm((prev) => ({ ...prev, [field]: b64 }));
    toast.success("File uploaded!");
  }

  async function handleTaskFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "videoUrl" | "audioUrl",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setTaskForm((prev) => ({ ...prev, [field]: b64 }));
    toast.success("File uploaded!");
  }

  async function handleFutureFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "videoUrl",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setFutureForm((prev) => ({ ...prev, [field]: b64 }));
    toast.success("File uploaded!");
  }

  function createVlog(e: React.FormEvent) {
    e.preventDefault();
    if (!vlogForm.title) {
      toast.error("Title required");
      return;
    }
    setLoading(true);
    const newVlog: Vlog = {
      ...vlogForm,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = [newVlog, ...vlogs];
    setVlogs(updated);
    saveLS("sce_admin_vlogs", updated);
    toast.success("Vlog created!");
    setVlogForm({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      watchReward: 0.1,
    });
    setLoading(false);
  }

  function deleteVlog(id: number) {
    const updated = vlogs.filter((v) => v.id !== id);
    setVlogs(updated);
    saveLS("sce_admin_vlogs", updated);
    toast.success("Vlog deleted.");
  }

  function createAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!announcementForm.title) {
      toast.error("Title required");
      return;
    }
    const newA: Announcement = {
      ...announcementForm,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = [newA, ...announcements];
    setAnnouncements(updated);
    saveLS("sce_admin_announcements", updated);
    toast.success("Announcement created!");
    setAnnouncementForm({ title: "", content: "" });
  }

  function deleteAnnouncement(id: number) {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    saveLS("sce_admin_announcements", updated);
    toast.success("Deleted.");
  }

  function createAd(e: React.FormEvent) {
    e.preventDefault();
    if (!adForm.title) {
      toast.error("Title required");
      return;
    }
    setLoading(true);
    const newAd: Ad = {
      ...adForm,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = [newAd, ...ads];
    setAds(updated);
    saveLS("sce_admin_ads", updated);
    toast.success("Ad created!");
    setAdForm({
      title: "",
      description: "",
      imageUrl: "",
      videoUrl: "",
      linkUrl: "",
    });
    setLoading(false);
  }

  function deleteAd(id: number) {
    const updated = ads.filter((a) => a.id !== id);
    setAds(updated);
    saveLS("sce_admin_ads", updated);
    toast.success("Ad deleted.");
  }

  function addSignal(e: React.FormEvent) {
    e.preventDefault();
    if (!signalForm.asset || !signalForm.entryPrice) {
      toast.error("Fill required fields");
      return;
    }
    const newSig: Signal = {
      ...signalForm,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = [newSig, ...signals];
    setSignals(updated);
    saveLS("sce_admin_signals", updated);
    toast.success("Signal added!");
    setSignalForm({
      asset: "BTC/USDT",
      type: "BUY",
      entryPrice: "",
      targetPrice: "",
      stopLoss: "",
      description: "",
    });
  }

  function deleteSignal(id: number) {
    const updated = signals.filter((s) => s.id !== id);
    setSignals(updated);
    saveLS("sce_admin_signals", updated);
    toast.success("Signal removed.");
  }

  const stats = [
    { label: "Total Users", value: allUsers.length, icon: Users },
    { label: "Pending Deposits", value: deposits.length, icon: BarChart2 },
    {
      label: "Pending Withdrawals",
      value: withdrawals.length,
      icon: TrendingUp,
    },
    { label: "Announcements", value: announcements.length, icon: Megaphone },
  ];

  const formInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder = "",
    type = "text",
  ) => (
    <div className="space-y-1">
      <Label className="text-xs text-foreground/70">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background/50 border-border/60 focus:border-gold/50 h-9 text-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-400" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <Button
            data-ocid="admin.button"
            onClick={logout}
            variant="ghost"
            className="text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="glass-card rounded-xl p-4 text-center"
              >
                <Icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-gold">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        <Tabs defaultValue="overview" data-ocid="admin.tab">
          <TabsList className="bg-background/50 border border-border/50 flex-wrap h-auto gap-1 mb-6">
            {[
              ["overview", "Overview"],
              ["vlogs", "Vlogs"],
              ["announcements", "Announcements"],
              ["ads", "Ads/Promos"],
              ["signals", "Signals"],
              ["tasks", "Tasks"],
              ["deposits", `Deposits (${deposits.length})`],
              ["withdrawals", `Withdrawals (${withdrawals.length})`],
              ["futures", "Futures"],
              ["users", "Users"],
              [
                "kyc",
                `KYC Review (${kycSubmissions.filter((k) => k.status === "pending").length})`,
              ],
              ["p2p", "P2P Dashboard"],
              ["settings", "Settings"],
            ].map(([val, label]) => (
              <TabsTrigger
                key={val}
                value={val}
                data-ocid="admin.tab"
                className="data-[state=active]:bg-gold data-[state=active]:text-navy text-xs"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-3">
                  Registered Users
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.length === 0 ? (
                    <div
                      data-ocid="admin.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No users yet.
                    </div>
                  ) : (
                    users.map((u: any, i: number) => (
                      <div
                        key={u.username + String(i)}
                        className="flex justify-between items-center text-sm py-1 border-b border-border/20"
                      >
                        <span className="text-foreground">{u.username}</span>
                        <span className="text-muted-foreground text-xs">
                          {u.email}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs border-gold/30 text-gold"
                        >
                          ${(u.balance || 0).toFixed(2)}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Users", value: allUsers.length },
                    { label: "Total Vlogs", value: vlogs.length },
                    { label: "Total Ads", value: ads.length },
                    { label: "Active Signals", value: signals.length },
                    { label: "Pending Deposits", value: deposits.length },
                    { label: "Pending Withdrawals", value: withdrawals.length },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-bold text-gold">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Vlogs */}
          <TabsContent value="vlogs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Add Vlog
                </h3>
                <form onSubmit={createVlog} className="space-y-3">
                  {formInput(
                    "Title *",
                    vlogForm.title,
                    (v) => setVlogForm({ ...vlogForm, title: v }),
                    "Vlog title",
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Video (URL or File Upload)
                    </Label>
                    <Input
                      type="text"
                      value={vlogForm.videoUrl}
                      placeholder="Paste YouTube URL or direct video link"
                      onChange={(e) =>
                        setVlogForm({ ...vlogForm, videoUrl: e.target.value })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50 h-9 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      YouTube, Google Drive, or any direct video URL
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      — OR upload video/image file —
                    </p>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      data-ocid="admin.upload_button"
                      onChange={(e) => handleVlogFileUpload(e, "videoUrl")}
                      className="w-full text-xs text-muted-foreground bg-background/50 border border-border/60 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Upload Thumbnail Image
                    </Label>
                    <input
                      type="file"
                      accept="image/*"
                      data-ocid="admin.upload_button"
                      onChange={(e) => handleVlogFileUpload(e, "thumbnailUrl")}
                      className="w-full text-xs text-muted-foreground bg-background/50 border border-border/60 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Or paste thumbnail URL below:
                    </p>
                    <Input
                      type="text"
                      value={vlogForm.thumbnailUrl}
                      placeholder="Image URL for thumbnail"
                      onChange={(e) =>
                        setVlogForm({
                          ...vlogForm,
                          thumbnailUrl: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Description
                    </Label>
                    <Textarea
                      value={vlogForm.description}
                      onChange={(e) =>
                        setVlogForm({
                          ...vlogForm,
                          description: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50 text-sm h-20 resize-none"
                      placeholder="Vlog description"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Watch Reward (USDT)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="0.8"
                      value={vlogForm.watchReward}
                      onChange={(e) =>
                        setVlogForm({
                          ...vlogForm,
                          watchReward: Number.parseFloat(e.target.value) || 0.1,
                        })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50 h-9 text-sm"
                      placeholder="e.g. 0.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Reward users earn for watching this vlog
                    </p>
                  </div>
                  <Button
                    type="submit"
                    data-ocid="admin.submit_button"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gold to-orange-brand text-navy font-bold h-9 text-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="w-3 h-3 mr-1" />
                    )}{" "}
                    Add Vlog
                  </Button>
                </form>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  All Vlogs ({vlogs.length})
                </h3>
                <div
                  className="space-y-3 max-h-80 overflow-y-auto"
                  data-ocid="admin.list"
                >
                  {vlogs.length === 0 ? (
                    <div
                      data-ocid="admin.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No vlogs yet.
                    </div>
                  ) : (
                    vlogs.map((v, i) => (
                      <div
                        key={v.id}
                        data-ocid={`admin.item.${i + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border/20"
                      >
                        <div className="flex-1 mr-2">
                          <div className="text-sm text-foreground font-medium truncate">
                            {v.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {v.date}
                          </div>
                        </div>
                        <Button
                          data-ocid="admin.delete_button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteVlog(v.id)}
                          className="text-red-400 hover:bg-red-500/10 h-7 w-7 p-0 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Add Announcement
                </h3>
                <form onSubmit={createAnnouncement} className="space-y-3">
                  {formInput(
                    "Title *",
                    announcementForm.title,
                    (v) =>
                      setAnnouncementForm({ ...announcementForm, title: v }),
                    "Announcement title",
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Content
                    </Label>
                    <Textarea
                      value={announcementForm.content}
                      onChange={(e) =>
                        setAnnouncementForm({
                          ...announcementForm,
                          content: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50 text-sm h-24 resize-none"
                      placeholder="Announcement details"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="admin.submit_button"
                    className="w-full bg-gradient-to-r from-gold to-orange-brand text-navy font-bold h-9 text-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Announcement
                  </Button>
                </form>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Announcements ({announcements.length})
                </h3>
                <div
                  className="space-y-3 max-h-80 overflow-y-auto"
                  data-ocid="admin.list"
                >
                  {announcements.length === 0 ? (
                    <div
                      data-ocid="admin.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No announcements.
                    </div>
                  ) : (
                    announcements.map((a, i) => (
                      <div
                        key={a.id}
                        data-ocid={`admin.item.${i + 1}`}
                        className="flex items-start justify-between py-2 border-b border-border/20 gap-2"
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {a.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {a.content}
                          </div>
                        </div>
                        <Button
                          data-ocid="admin.delete_button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAnnouncement(a.id)}
                          className="text-red-400 hover:bg-red-500/10 h-7 w-7 p-0 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Ads */}
          <TabsContent value="ads">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Add Ad / Promo
                </h3>
                <form onSubmit={createAd} className="space-y-3">
                  {formInput(
                    "Title *",
                    adForm.title,
                    (v) => setAdForm({ ...adForm, title: v }),
                    "Ad title",
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Upload Image File
                    </Label>
                    <input
                      type="file"
                      accept="image/*"
                      data-ocid="admin.upload_button"
                      onChange={(e) => handleAdFileUpload(e, "imageUrl")}
                      className="w-full text-xs text-muted-foreground bg-background/50 border border-border/60 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                    />
                    {adForm.imageUrl?.startsWith("data:") && (
                      <img
                        src={adForm.imageUrl}
                        alt="preview"
                        className="h-16 rounded object-cover mt-1"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Or paste image URL:
                    </p>
                    <Input
                      type="text"
                      value={
                        adForm.imageUrl.startsWith("data:")
                          ? ""
                          : adForm.imageUrl
                      }
                      placeholder="https://example.com/banner.jpg"
                      onChange={(e) =>
                        setAdForm({ ...adForm, imageUrl: e.target.value })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Upload Video File (optional)
                    </Label>
                    <input
                      type="file"
                      accept="video/*"
                      data-ocid="admin.upload_button"
                      onChange={(e) => handleAdFileUpload(e, "videoUrl")}
                      className="w-full text-xs text-muted-foreground bg-background/50 border border-border/60 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Or paste video URL:
                    </p>
                    <Input
                      type="text"
                      value={
                        adForm.videoUrl?.startsWith("data:")
                          ? ""
                          : adForm.videoUrl || ""
                      }
                      placeholder="https://youtube.com/..."
                      onChange={(e) =>
                        setAdForm({ ...adForm, videoUrl: e.target.value })
                      }
                      className="bg-background/50 border-border/60 focus:border-gold/50 h-9 text-sm"
                    />
                  </div>
                  {formInput(
                    "Link URL",
                    adForm.linkUrl,
                    (v) => setAdForm({ ...adForm, linkUrl: v }),
                    "https://...",
                  )}
                  {formInput(
                    "Description",
                    adForm.description,
                    (v) => setAdForm({ ...adForm, description: v }),
                    "Short description",
                  )}
                  <Button
                    type="submit"
                    data-ocid="admin.submit_button"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gold to-orange-brand text-navy font-bold h-9 text-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="w-3 h-3 mr-1" />
                    )}{" "}
                    Add Ad
                  </Button>
                </form>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Active Ads ({ads.length})
                </h3>
                <div
                  className="space-y-3 max-h-80 overflow-y-auto"
                  data-ocid="admin.list"
                >
                  {ads.length === 0 ? (
                    <div
                      data-ocid="admin.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No ads yet.
                    </div>
                  ) : (
                    ads.map((a, i) => (
                      <div
                        key={a.id}
                        data-ocid={`admin.item.${i + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border/20"
                      >
                        <div className="flex-1 mr-2">
                          <div className="text-sm text-foreground font-medium truncate">
                            {a.title}
                          </div>
                          {a.imageUrl && (
                            <img
                              src={a.imageUrl}
                              alt={a.title}
                              className="h-8 rounded mt-1 object-cover"
                            />
                          )}
                        </div>
                        <Button
                          data-ocid="admin.delete_button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAd(a.id)}
                          className="text-red-400 hover:bg-red-500/10 h-7 w-7 p-0 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Signals */}
          <TabsContent value="signals">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Add Trading Signal
                </h3>
                <form onSubmit={addSignal} className="space-y-3">
                  {formInput(
                    "Asset *",
                    signalForm.asset,
                    (v) => setSignalForm({ ...signalForm, asset: v }),
                    "BTC/USDT",
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs text-foreground/70">
                      Signal Type
                    </Label>
                    <select
                      value={signalForm.type}
                      onChange={(e) =>
                        setSignalForm({
                          ...signalForm,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full bg-background/50 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground"
                      data-ocid="admin.select"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                      <option value="HOLD">HOLD</option>
                    </select>
                  </div>
                  {formInput(
                    "Entry Price *",
                    signalForm.entryPrice,
                    (v) => setSignalForm({ ...signalForm, entryPrice: v }),
                    "e.g. 67800",
                  )}
                  {formInput(
                    "Target Price",
                    signalForm.targetPrice,
                    (v) => setSignalForm({ ...signalForm, targetPrice: v }),
                    "e.g. 72000",
                  )}
                  {formInput(
                    "Stop Loss",
                    signalForm.stopLoss,
                    (v) => setSignalForm({ ...signalForm, stopLoss: v }),
                    "e.g. 65000",
                  )}
                  {formInput(
                    "Description",
                    signalForm.description,
                    (v) => setSignalForm({ ...signalForm, description: v }),
                    "Signal analysis",
                  )}
                  <Button
                    type="submit"
                    data-ocid="admin.submit_button"
                    className="w-full bg-gradient-to-r from-gold to-orange-brand text-navy font-bold h-9 text-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Signal
                  </Button>
                </form>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Signals ({signals.length})
                </h3>
                <div
                  className="space-y-3 max-h-80 overflow-y-auto"
                  data-ocid="admin.list"
                >
                  {signals.length === 0 ? (
                    <div
                      data-ocid="admin.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No signals added.
                    </div>
                  ) : (
                    signals.map((s, i) => (
                      <div
                        key={s.id}
                        data-ocid={`admin.item.${i + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border/20"
                      >
                        <div>
                          <span className="text-sm font-bold text-foreground">
                            {s.asset}
                          </span>
                          <Badge
                            variant="outline"
                            className={`ml-2 text-xs ${
                              s.type === "BUY"
                                ? "text-green-400 border-green-500/30"
                                : s.type === "SELL"
                                  ? "text-red-400 border-red-500/30"
                                  : "text-yellow-400 border-yellow-500/30"
                            }`}
                          >
                            {s.type}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {s.date}
                          </div>
                        </div>
                        <Button
                          data-ocid="admin.delete_button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSignal(s.id)}
                          className="text-red-400 hover:bg-red-500/10 h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-gold" /> Task Management
              </h3>

              {/* Add task form */}
              <div className="border border-border/30 rounded-xl p-4 mb-6 bg-background/30">
                <h4 className="font-semibold text-foreground mb-4 text-sm">
                  Add New Task
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Category
                      </Label>
                      <select
                        value={taskForm.category}
                        onChange={(e) =>
                          setTaskForm((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        className="mt-1 w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm text-foreground"
                        data-ocid="admin.tasks.select"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Social">Social</option>
                        <option value="Video">Video</option>
                        <option value="Trading">Trading</option>
                        <option value="Invest">Invest</option>
                        <option value="Bonus">Bonus</option>
                        <option value="Referral">Referral</option>
                        <option value="Skill">Skill</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Reward (USDT)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        placeholder="0.50"
                        value={taskForm.reward}
                        onChange={(e) =>
                          setTaskForm((p) => ({ ...p, reward: e.target.value }))
                        }
                        className="mt-1 bg-background/50 border-border/50"
                        data-ocid="admin.tasks.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Task Title *
                    </Label>
                    <Input
                      placeholder="e.g. Watch our latest crypto ad"
                      value={taskForm.title}
                      onChange={(e) =>
                        setTaskForm((p) => ({ ...p, title: e.target.value }))
                      }
                      className="mt-1 bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <Textarea
                      placeholder="Brief description of the task..."
                      value={taskForm.description}
                      onChange={(e) =>
                        setTaskForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1 bg-background/50 border-border/50 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Steps (comma separated)
                    </Label>
                    <Input
                      placeholder="Watch,Follow,Like,Comment,Buy"
                      value={taskForm.steps}
                      onChange={(e) =>
                        setTaskForm((p) => ({ ...p, steps: e.target.value }))
                      }
                      className="mt-1 bg-background/50 border-border/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      e.g. Watch,Follow,Like,Comment
                    </p>
                  </div>

                  {/* Section: File Upload */}
                  <div className="border border-dashed border-gold/20 rounded-xl p-4 bg-gold/5">
                    <p className="text-xs font-semibold text-gold mb-3 uppercase tracking-wide">
                      Option 1 — Upload File
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Upload Image
                        </Label>
                        <input
                          type="file"
                          accept="image/*"
                          data-ocid="admin.tasks.upload_button"
                          onChange={(e) => handleTaskFileUpload(e, "imageUrl")}
                          className="mt-1 w-full text-xs text-muted-foreground bg-background/50 border border-border/50 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                        />
                        {taskForm.imageUrl && (
                          <img
                            src={taskForm.imageUrl}
                            alt="preview"
                            className="mt-2 h-20 rounded-lg object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Upload Video
                        </Label>
                        <input
                          type="file"
                          accept="video/*"
                          data-ocid="admin.tasks.upload_button"
                          onChange={(e) => handleTaskFileUpload(e, "videoUrl")}
                          className="mt-1 w-full text-xs text-muted-foreground bg-background/50 border border-border/50 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                        />
                        {taskForm.videoUrl && (
                          <p className="mt-1 text-xs text-green-400">
                            ✓ Video uploaded
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Upload Audio / Song
                        </Label>
                        <input
                          type="file"
                          accept="audio/*"
                          data-ocid="admin.tasks.upload_button"
                          onChange={(e) => handleTaskFileUpload(e, "audioUrl")}
                          className="mt-1 w-full text-xs text-muted-foreground bg-background/50 border border-border/50 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                        />
                        {taskForm.audioUrl && (
                          <p className="mt-1 text-xs text-green-400">
                            ✓ Audio uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: URL / Link */}
                  <div className="border border-dashed border-blue-500/20 rounded-xl p-4 bg-blue-500/5">
                    <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                      Option 2 — URL / Link
                    </p>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Website URL / Link
                      </Label>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={taskForm.adUrl}
                        onChange={(e) =>
                          setTaskForm((p) => ({ ...p, adUrl: e.target.value }))
                        }
                        className="mt-1 bg-background/50 border-border/50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        YouTube, Instagram, Telegram, any website link
                      </p>
                    </div>
                  </div>

                  <Button
                    data-ocid="admin.tasks.primary_button"
                    onClick={() => {
                      if (!taskForm.title) {
                        toast.error("Task title is required");
                        return;
                      }
                      const newTask: AdminTask = {
                        id: Date.now().toString(),
                        title: taskForm.title,
                        description: taskForm.description,
                        category: taskForm.category,
                        adUrl: taskForm.adUrl,
                        imageUrl: taskForm.imageUrl,
                        videoUrl: taskForm.videoUrl,
                        audioUrl: taskForm.audioUrl,
                        steps: taskForm.steps
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                        reward: Number.parseFloat(taskForm.reward) || 0.5,
                        date: new Date().toISOString(),
                      };
                      const updated = [...adminTasks, newTask];
                      setAdminTasks(updated);
                      localStorage.setItem(
                        "sce_admin_tasks",
                        JSON.stringify(updated),
                      );
                      setTaskForm({
                        title: "",
                        description: "",
                        category: "Daily",
                        adUrl: "",
                        imageUrl: "",
                        videoUrl: "",
                        audioUrl: "",
                        steps: "",
                        reward: "0.5",
                      });
                      toast.success("Task added successfully!");
                    }}
                    className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Task
                  </Button>
                </div>
              </div>

              {/* Task list */}
              {adminTasks.length === 0 ? (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.tasks.empty_state"
                >
                  <p className="text-sm">
                    No tasks yet. Add your first task above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminTasks.map((task, i) => (
                    <div
                      key={task.id}
                      data-ocid={`admin.tasks.item.${i + 1}`}
                      className="border border-border/30 rounded-xl p-4 bg-background/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                              {task.category || "General"}
                            </Badge>
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                              ${task.reward} USDT
                            </Badge>
                          </div>
                          <p className="font-semibold text-foreground text-sm">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {task.description}
                            </p>
                          )}
                          {task.steps.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.steps.map((s) => (
                                <span
                                  key={s}
                                  className="text-xs bg-background/50 border border-border/30 rounded px-2 py-0.5 text-muted-foreground"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {task.adUrl && (
                            <a
                              href={task.adUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline mt-1 block truncate"
                            >
                              {task.adUrl}
                            </a>
                          )}
                          {task.imageUrl && (
                            <img
                              src={task.imageUrl}
                              alt={task.title}
                              className="mt-2 h-16 rounded-lg object-cover"
                            />
                          )}
                          {task.videoUrl && (
                            <p className="text-xs text-green-400 mt-1">
                              ✓ Video attached
                            </p>
                          )}
                          {(task as AdminTask & { audioUrl?: string })
                            .audioUrl && (
                            <p className="text-xs text-green-400 mt-1">
                              ✓ Audio attached
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`admin.tasks.delete_button.${i + 1}`}
                          onClick={() => {
                            const updated = adminTasks.filter(
                              (t) => t.id !== task.id,
                            );
                            setAdminTasks(updated);
                            localStorage.setItem(
                              "sce_admin_tasks",
                              JSON.stringify(updated),
                            );
                            toast.success("Task deleted");
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="futures">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  Future Trading Content
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Title *
                    </Label>
                    <Input
                      data-ocid="admin.futures.input"
                      placeholder="e.g. BTC Long Position Signal"
                      value={futureForm.title}
                      onChange={(e) =>
                        setFutureForm((p) => ({ ...p, title: e.target.value }))
                      }
                      className="mt-1 bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <Textarea
                      placeholder="Describe the future trading opportunity..."
                      value={futureForm.description}
                      onChange={(e) =>
                        setFutureForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1 bg-background/50 border-border/50 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Upload Image
                    </Label>
                    <input
                      type="file"
                      accept="image/*"
                      data-ocid="admin.futures.upload_button"
                      onChange={(e) => handleFutureFileUpload(e, "imageUrl")}
                      className="mt-1 w-full text-xs text-muted-foreground bg-background/50 border border-border/50 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Or paste URL:
                    </p>
                    <Input
                      type="text"
                      value={
                        futureForm.imageUrl.startsWith("data:")
                          ? ""
                          : futureForm.imageUrl
                      }
                      placeholder="https://..."
                      onChange={(e) =>
                        setFutureForm((p) => ({
                          ...p,
                          imageUrl: e.target.value,
                        }))
                      }
                      className="mt-1 bg-background/50 border-border/50 text-sm h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Upload Video
                    </Label>
                    <input
                      type="file"
                      accept="video/*"
                      data-ocid="admin.futures.upload_button"
                      onChange={(e) => handleFutureFileUpload(e, "videoUrl")}
                      className="mt-1 w-full text-xs text-muted-foreground bg-background/50 border border-border/50 rounded-lg p-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Or paste URL:
                    </p>
                    <Input
                      type="text"
                      value={
                        futureForm.videoUrl?.startsWith("data:")
                          ? ""
                          : futureForm.videoUrl || ""
                      }
                      placeholder="https://youtube.com/..."
                      onChange={(e) =>
                        setFutureForm((p) => ({
                          ...p,
                          videoUrl: e.target.value,
                        }))
                      }
                      className="mt-1 bg-background/50 border-border/50 text-sm h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Link URL
                      </Label>
                      <Input
                        type="text"
                        placeholder="https://..."
                        value={futureForm.linkUrl}
                        onChange={(e) =>
                          setFutureForm((p) => ({
                            ...p,
                            linkUrl: e.target.value,
                          }))
                        }
                        className="mt-1 bg-background/50 border-border/50 text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Reward Amount (USDT)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={futureForm.reward}
                        onChange={(e) =>
                          setFutureForm((p) => ({
                            ...p,
                            reward: e.target.value,
                          }))
                        }
                        className="mt-1 bg-background/50 border-border/50 text-sm h-8"
                      />
                    </div>
                  </div>
                  <Button
                    data-ocid="admin.futures.primary_button"
                    onClick={() => {
                      if (!futureForm.title) {
                        toast.error("Title is required");
                        return;
                      }
                      const newFuture: FutureContent = {
                        id: Date.now().toString(),
                        title: futureForm.title,
                        description: futureForm.description,
                        imageUrl: futureForm.imageUrl,
                        videoUrl: futureForm.videoUrl,
                        linkUrl: futureForm.linkUrl,
                        reward: Number.parseFloat(futureForm.reward) || 0,
                        date: new Date().toISOString().slice(0, 10),
                      };
                      const updated = [newFuture, ...futures];
                      setFutures(updated);
                      saveLS("sce_admin_futures", updated);
                      setFutureForm({
                        title: "",
                        description: "",
                        imageUrl: "",
                        videoUrl: "",
                        linkUrl: "",
                        reward: "0",
                      });
                      toast.success("Future trading content added!");
                    }}
                    className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Future Content
                  </Button>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Future Content ({futures.length})
                </h3>
                <div
                  className="space-y-3 max-h-96 overflow-y-auto"
                  data-ocid="admin.list"
                >
                  {futures.length === 0 ? (
                    <div
                      data-ocid="admin.futures.empty_state"
                      className="text-muted-foreground text-sm text-center py-8"
                    >
                      No future trading content yet.
                    </div>
                  ) : (
                    futures.map((f, i) => (
                      <div
                        key={f.id}
                        data-ocid={`admin.futures.item.${i + 1}`}
                        className="border border-border/30 rounded-xl p-3 bg-background/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {f.title}
                              </span>
                              {f.reward > 0 && (
                                <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                                  ${f.reward} USDT
                                </Badge>
                              )}
                            </div>
                            {f.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {f.description}
                              </p>
                            )}
                            {f.imageUrl && (
                              <img
                                src={f.imageUrl}
                                alt={f.title}
                                className="h-12 rounded mt-1 object-cover"
                              />
                            )}
                          </div>
                          <Button
                            data-ocid={`admin.futures.delete_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const updated = futures.filter(
                                (x) => x.id !== f.id,
                              );
                              setFutures(updated);
                              saveLS("sce_admin_futures", updated);
                              toast.success("Deleted.");
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Deposits */}
          <TabsContent value="deposits">
            <div className="glass-card rounded-2xl p-5" data-ocid="admin.table">
              <h3 className="font-display font-bold text-foreground mb-4">
                Pending Deposits ({deposits.length})
              </h3>
              {deposits.length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="text-center py-8 text-muted-foreground"
                >
                  No pending deposits.
                </div>
              ) : (
                <div className="space-y-3">
                  {deposits.map((d: any, i: number) => (
                    <div
                      key={d.txHash + String(i)}
                      data-ocid={`admin.item.${i + 1}`}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-foreground">
                            {d.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {d.currency} • ${d.amount}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-1 truncate max-w-xs">
                            {d.txHash}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            data-ocid="admin.confirm_button"
                            size="sm"
                            className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 h-8 text-xs"
                            onClick={async () => {
                              try {
                                await (actor as any).approveDepositAdmin(
                                  BigInt(d.id),
                                  "Sandeep@321",
                                );
                                toast.success(
                                  `Deposit approved for ${d.username}`,
                                );
                                setDeposits((prev) =>
                                  prev.filter((x) => x.id !== d.id),
                                );
                              } catch (e: any) {
                                toast.error(
                                  `Approve failed: ${e?.message || e}`,
                                );
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            data-ocid="admin.delete_button"
                            size="sm"
                            variant="ghost"
                            className="text-red-400 border border-red-500/30 hover:bg-red-500/10 h-8 text-xs"
                            onClick={async () => {
                              try {
                                await (actor as any).rejectDepositAdmin(
                                  BigInt(d.id),
                                  "Sandeep@321",
                                );
                                toast.error(
                                  `Deposit rejected for ${d.username}`,
                                );
                                setDeposits((prev) =>
                                  prev.filter((x) => x.id !== d.id),
                                );
                              } catch (e: any) {
                                toast.error(
                                  `Reject failed: ${e?.message || e}`,
                                );
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Withdrawals */}
          <TabsContent value="withdrawals">
            <div className="glass-card rounded-2xl p-5" data-ocid="admin.table">
              <h3 className="font-display font-bold text-foreground mb-4">
                Pending Withdrawals ({withdrawals.length})
              </h3>
              {withdrawals.length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="text-center py-8 text-muted-foreground"
                >
                  No pending withdrawals.
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w: any, i: number) => (
                    <div
                      key={w.walletAddress + String(i)}
                      data-ocid={`admin.item.${i + 1}`}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-foreground">
                            {w.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {w.currency} • ${w.amount}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-1 truncate max-w-xs">
                            {w.walletAddress}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            data-ocid="admin.confirm_button"
                            size="sm"
                            className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 h-8 text-xs"
                            onClick={async () => {
                              try {
                                await (actor as any).approveWithdrawalAdmin(
                                  BigInt(w.id),
                                  "Sandeep@321",
                                );
                                toast.success(
                                  `Withdrawal approved for ${w.username}`,
                                );
                                setWithdrawals((prev) =>
                                  prev.filter((x) => x.id !== w.id),
                                );
                              } catch (e: any) {
                                toast.error(
                                  `Approve failed: ${e?.message || e}`,
                                );
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            data-ocid="admin.delete_button"
                            size="sm"
                            variant="ghost"
                            className="text-red-400 border border-red-500/30 hover:bg-red-500/10 h-8 text-xs"
                            onClick={async () => {
                              try {
                                await (actor as any).rejectWithdrawalAdmin(
                                  BigInt(w.id),
                                  "Sandeep@321",
                                );
                                toast.error(
                                  `Withdrawal rejected for ${w.username}`,
                                );
                                setWithdrawals((prev) =>
                                  prev.filter((x) => x.id !== w.id),
                                );
                              } catch (e: any) {
                                toast.error(
                                  `Reject failed: ${e?.message || e}`,
                                );
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div
              className="glass-card rounded-2xl overflow-hidden"
              data-ocid="admin.table"
            >
              <div className="p-5 border-b border-border/30 flex items-center justify-between gap-3">
                <h3 className="font-display font-bold text-foreground">
                  All Users ({allUsers.length})
                </h3>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    ● Canister: {canisterUsers.length}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    ● Local: {users.length}
                  </span>
                </div>
              </div>
              {allUsers.length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  No users registered yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        {[
                          "Source",
                          "Full Name",
                          "Username",
                          "Email",
                          "Balance",
                          "Total Earned",
                          "Referral",
                          "Joined",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u: any, i: number) => (
                        <motion.tr
                          key={u.username + String(i)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          data-ocid="admin.row"
                          className="border-b border-border/20 hover:bg-gold/5 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-xs ${u._source === "canister" ? "border-green-500/40 text-green-400" : "border-yellow-500/40 text-yellow-400"}`}
                            >
                              {u._source === "canister" ? "Canister" : "Local"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {u.fullName || "-"}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {u.username}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {u.email}
                          </td>
                          <td className="px-4 py-3 font-mono text-green-400">
                            ${(u.balance || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-mono text-blue-400">
                            ${(u.totalEarned || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                            {u.referralCode || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {u.joinDate
                              ? new Date(u.joinDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {u._source === "canister" && u.principalId ? (
                              <div className="flex items-center gap-2">
                                {setBalanceForm.username === u.username ? (
                                  <>
                                    <Input
                                      type="number"
                                      className="w-20 h-7 text-xs"
                                      placeholder="USDT"
                                      value={setBalanceForm.value}
                                      onChange={(e) =>
                                        setSetBalanceForm((f) => ({
                                          ...f,
                                          value: e.target.value,
                                        }))
                                      }
                                      data-ocid="admin.input"
                                    />
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                      data-ocid="admin.save_button"
                                      onClick={async () => {
                                        if (!actor) return;
                                        try {
                                          const balanceUsdt =
                                            Number.parseFloat(
                                              setBalanceForm.value,
                                            ) || 0;
                                          const balanceMicro = BigInt(
                                            Math.round(balanceUsdt * 1_000_000),
                                          );
                                          await (
                                            actor as any
                                          ).adminUpdateUserBalance(
                                            u.principalId,
                                            balanceMicro,
                                          );
                                          toast.success(
                                            `Balance updated for ${u.username}`,
                                          );
                                          setSetBalanceForm({
                                            username: "",
                                            value: "",
                                          });
                                          // Refresh canister users
                                          const result = await (
                                            actor as any
                                          ).getAllUsersPublic();
                                          if (Array.isArray(result))
                                            setCanisterUsers(result);
                                        } catch {
                                          toast.error(
                                            "Failed to update balance",
                                          );
                                        }
                                      }}
                                    >
                                      Set
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() =>
                                        setSetBalanceForm({
                                          username: "",
                                          value: "",
                                        })
                                      }
                                      data-ocid="admin.cancel_button"
                                    >
                                      ✕
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-gold/30 text-gold hover:bg-gold/10"
                                    data-ocid="admin.edit_button"
                                    onClick={() =>
                                      setSetBalanceForm({
                                        username: u.username,
                                        value: String(u.balance || 0),
                                      })
                                    }
                                  >
                                    Set Balance
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* KYC Review */}
          <TabsContent value="kyc">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" /> KYC Submissions
              </h3>
              {kycSubmissions.length === 0 ? (
                <div
                  data-ocid="admin.kyc.empty_state"
                  className="text-muted-foreground text-sm py-8 text-center"
                >
                  No KYC submissions yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 text-xs text-muted-foreground">
                        <th className="text-left py-2 px-3">User</th>
                        <th className="text-left py-2 px-3">Doc Type</th>
                        <th className="text-left py-2 px-3">Submitted</th>
                        <th className="text-left py-2 px-3">Document</th>
                        <th className="text-left py-2 px-3">Selfie</th>
                        <th className="text-left py-2 px-3">Status</th>
                        <th className="text-left py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycSubmissions.map((kyc, i) => (
                        <motion.tr
                          key={kyc.username + String(i)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-border/20"
                          data-ocid={`admin.kyc.row.item.${i + 1}`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-medium text-foreground">
                              {kyc.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {kyc.email}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground capitalize">
                            {(kyc.docType || "").replace("_", " ")}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">
                            {kyc.submittedAt
                              ? new Date(kyc.submittedAt).toLocaleString()
                              : "—"}
                          </td>
                          <td className="py-3 px-3">
                            {kyc.docPreview ? (
                              <img
                                src={kyc.docPreview}
                                alt="document"
                                className="w-14 h-14 object-cover rounded-lg border border-border/30"
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                No file
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {kyc.selfiePreview ? (
                              <img
                                src={kyc.selfiePreview}
                                alt="selfie"
                                className="w-14 h-14 object-cover rounded-lg border border-border/30"
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                No file
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {kyc.status === "pending" && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                Pending
                              </Badge>
                            )}
                            {kyc.status === "verified" && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Verified
                              </Badge>
                            )}
                            {kyc.status === "rejected" && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                Rejected
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {kyc.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                  data-ocid={`admin.kyc.confirm_button.${i + 1}`}
                                  onClick={() => {
                                    const updated = {
                                      ...kyc,
                                      status: "verified",
                                    };
                                    localStorage.setItem(
                                      `sce_kyc_${kyc.username}`,
                                      JSON.stringify(updated),
                                    );
                                    // Update kycStatus in sce_users
                                    const allUsrs = getSCEUsers();
                                    const idx = allUsrs.findIndex(
                                      (u: any) =>
                                        u.username.toLowerCase() ===
                                        kyc.username.toLowerCase(),
                                    );
                                    if (idx !== -1) {
                                      allUsrs[idx].kycStatus = "verified";
                                      localStorage.setItem(
                                        "sce_users",
                                        JSON.stringify(allUsrs),
                                      );
                                    }
                                    setKycSubmissions((prev) =>
                                      prev.map((k) =>
                                        k.username === kyc.username
                                          ? updated
                                          : k,
                                      ),
                                    );
                                    toast.success(
                                      `KYC approved for ${kyc.username}`,
                                    );
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 text-xs"
                                  data-ocid={`admin.kyc.delete_button.${i + 1}`}
                                  onClick={() => {
                                    const updated = {
                                      ...kyc,
                                      status: "rejected",
                                    };
                                    localStorage.setItem(
                                      `sce_kyc_${kyc.username}`,
                                      JSON.stringify(updated),
                                    );
                                    const allUsrs = getSCEUsers();
                                    const idx = allUsrs.findIndex(
                                      (u: any) =>
                                        u.username.toLowerCase() ===
                                        kyc.username.toLowerCase(),
                                    );
                                    if (idx !== -1) {
                                      allUsrs[idx].kycStatus = "rejected";
                                      localStorage.setItem(
                                        "sce_users",
                                        JSON.stringify(allUsrs),
                                      );
                                    }
                                    setKycSubmissions((prev) =>
                                      prev.map((k) =>
                                        k.username === kyc.username
                                          ? updated
                                          : k,
                                      ),
                                    );
                                    toast.error(
                                      `KYC rejected for ${kyc.username}`,
                                    );
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* P2P Dashboard */}
          <TabsContent value="p2p">
            <P2PDashboard />
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
