import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Loader2,
  LogOut,
  Megaphone,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
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

function getPendingTx() {
  const users = getSCEUsers();
  let deposits: any[] = [];
  let withdrawals: any[] = [];
  for (const u of users) {
    const txs = JSON.parse(
      localStorage.getItem(`sce_tx_${u.username}`) || "[]",
    );
    for (const tx of txs) {
      if (tx.type === "deposit" && tx.status === "pending")
        deposits.push({ ...tx, username: u.username });
      if (tx.type === "withdrawal" && tx.status === "pending")
        withdrawals.push({ ...tx, username: u.username });
    }
  }
  return { deposits, withdrawals };
}

export function AdminDashboard() {
  useAdminCheck();
  const navigate = useNavigate();
  const { actor } = useActor();

  const [vlogs, setVlogs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [signals, setSignals] = useState<Signal[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sce_admin_signals") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  const users = getSCEUsers();
  const { deposits, withdrawals } = getPendingTx();

  // Forms
  const [vlogForm, setVlogForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  });
  const [adForm, setAdForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
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

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getVlogPosts().catch(() => []),
      actor.getAnnouncements().catch(() => []),
      actor.getActiveAds().catch(() => []),
    ]).then(([v, a, ads]) => {
      setVlogs(v);
      setAnnouncements(a);
      setAds(ads);
    });
  }, [actor]);

  function logout() {
    localStorage.removeItem("sce_admin_logged_in");
    navigate({ to: "/" });
    toast.success("Admin logged out.");
  }

  async function createVlog(e: React.FormEvent) {
    e.preventDefault();
    if (!vlogForm.title) {
      toast.error("Title required");
      return;
    }
    setLoading(true);
    try {
      if (actor) {
        try {
          await actor.createVlogPost(
            vlogForm.title,
            vlogForm.description,
            vlogForm.videoUrl,
            vlogForm.thumbnailUrl,
            "vlog" as any,
          );
          const fresh = await actor.getVlogPosts();
          setVlogs(fresh);
        } catch {
          /* ignore */
        }
      }
      toast.success("Vlog created!");
      setVlogForm({
        title: "",
        description: "",
        videoUrl: "",
        thumbnailUrl: "",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteVlog(id: bigint) {
    if (!actor) return;
    setLoading(true);
    try {
      await actor.deleteVlogPost(id).catch(() => {});
      setVlogs((prev) => prev.filter((v) => v.id !== id));
      toast.success("Deleted");
    } finally {
      setLoading(false);
    }
  }

  async function createAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!announcementForm.title) {
      toast.error("Title required");
      return;
    }
    setLoading(true);
    try {
      if (actor) {
        try {
          await actor.createAnnouncement(
            announcementForm.title,
            announcementForm.content,
          );
          const fresh = await actor.getAnnouncements();
          setAnnouncements(fresh);
        } catch {
          /* ignore */
        }
      }
      toast.success("Announcement created!");
      setAnnouncementForm({ title: "", content: "" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteAnnouncement(id: bigint) {
    if (!actor) return;
    try {
      await actor.deleteAnnouncement(id).catch(() => {});
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Deleted");
    } catch {
      /* ignore */
    }
  }

  async function createAd(e: React.FormEvent) {
    e.preventDefault();
    if (!adForm.title) {
      toast.error("Title required");
      return;
    }
    setLoading(true);
    try {
      if (actor) {
        try {
          await actor.createAd(
            adForm.title,
            adForm.description,
            adForm.imageUrl,
            adForm.linkUrl,
          );
          const fresh = await actor.getActiveAds();
          setAds(fresh);
        } catch {
          /* ignore */
        }
      }
      toast.success("Ad created!");
      setAdForm({ title: "", description: "", imageUrl: "", linkUrl: "" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteAd(id: bigint) {
    if (!actor) return;
    try {
      await actor.deleteAd(id).catch(() => {});
      setAds((prev) => prev.filter((a) => a.id !== id));
      toast.success("Deleted");
    } catch {
      /* ignore */
    }
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
    localStorage.setItem("sce_admin_signals", JSON.stringify(updated));
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
    localStorage.setItem("sce_admin_signals", JSON.stringify(updated));
    toast.success("Signal removed.");
  }

  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
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
        {/* Header */}
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

        {/* Stats */}
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
              ["deposits", `Deposits (${deposits.length})`],
              ["withdrawals", `Withdrawals (${withdrawals.length})`],
              ["users", "Users"],
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
                        <span className="text-muted-foreground">{u.email}</span>
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
                    { label: "Total Users", value: users.length },
                    { label: "Total Vlogs", value: vlogs.length },
                    { label: "Total Ads", value: ads.length },
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
                  {formInput(
                    "Video URL",
                    vlogForm.videoUrl,
                    (v) => setVlogForm({ ...vlogForm, videoUrl: v }),
                    "YouTube URL",
                  )}
                  {formInput(
                    "Thumbnail URL",
                    vlogForm.thumbnailUrl,
                    (v) => setVlogForm({ ...vlogForm, thumbnailUrl: v }),
                    "Image URL",
                  )}
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
                    )}
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
                    vlogs.map((v: any, i: number) => (
                      <div
                        key={String(v.id)}
                        data-ocid={`admin.item.${i + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border/20"
                      >
                        <span className="text-sm text-foreground truncate flex-1 mr-2">
                          {v.title}
                        </span>
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
                    disabled={loading}
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
                    announcements.map((a: any, i: number) => (
                      <div
                        key={String(a.id)}
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
                  {formInput(
                    "Image URL",
                    adForm.imageUrl,
                    (v) => setAdForm({ ...adForm, imageUrl: v }),
                    "https://...",
                  )}
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
                    <Plus className="w-3 h-3 mr-1" /> Add Ad
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
                    ads.map((a: any, i: number) => (
                      <div
                        key={String(a.id)}
                        data-ocid={`admin.item.${i + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border/20"
                      >
                        <span className="text-sm text-foreground truncate flex-1 mr-2">
                          {a.title}
                        </span>
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
                          >
                            Approve
                          </Button>
                          <Button
                            data-ocid="admin.delete_button"
                            size="sm"
                            variant="ghost"
                            className="text-red-400 border border-red-500/30 hover:bg-red-500/10 h-8 text-xs"
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
                          >
                            Approve
                          </Button>
                          <Button
                            data-ocid="admin.delete_button"
                            size="sm"
                            variant="ghost"
                            className="text-red-400 border border-red-500/30 hover:bg-red-500/10 h-8 text-xs"
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
              <div className="p-5 border-b border-border/30">
                <h3 className="font-display font-bold text-foreground">
                  All Users ({users.length})
                </h3>
              </div>
              {users.length === 0 ? (
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
                        {["Username", "Email", "Balance", "Plan", "Joined"].map(
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
                      {users.map((u: any, i: number) => (
                        <motion.tr
                          key={u.username + String(i)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          data-ocid={"admin.row"}
                          className="border-b border-border/20 hover:bg-gold/5 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {u.username}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {u.email}
                          </td>
                          <td className="px-4 py-3 font-mono text-green-400">
                            ${(u.balance || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="text-xs border-gold/30 text-gold"
                            >
                              {u.activePlan || "None"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(u.joinDate).toLocaleDateString()}
                          </td>
                        </motion.tr>
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
