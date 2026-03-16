import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Gift,
  Loader2,
  Play,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

const VIDEOS = [
  {
    id: 1,
    title: "Introduction to Crypto Trading",
    duration: "12:30",
    reward: 0.1,
  },
  {
    id: 2,
    title: "Bitcoin Price Analysis 2026",
    duration: "18:45",
    reward: 0.1,
  },
  { id: 3, title: "Altcoin Season Strategies", duration: "15:20", reward: 0.1 },
  { id: 4, title: "DeFi Yield Farming Guide", duration: "22:10", reward: 0.1 },
  {
    id: 5,
    title: "Risk Management in Trading",
    duration: "10:55",
    reward: 0.1,
  },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function Earn() {
  const { user, isLoggedIn } = useAuth();
  const { actor } = useActor();
  const [articleContent, setArticleContent] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [claimingVideo, setClaimingVideo] = useState<number | null>(null);
  const [claimingLogin, setClaimingLogin] = useState(false);

  const todayKey = getTodayKey();
  const earnData = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(`sce_earn_${user?.username || ""}`) || "{}",
      );
    } catch {
      return {};
    }
  })();

  function saveEarnData(data: object) {
    localStorage.setItem(
      `sce_earn_${user?.username || ""}`,
      JSON.stringify(data),
    );
  }

  const watchedKey = `watched_${todayKey}`;
  const loginKey = `login_${todayKey}`;
  const watchedToday: number[] = earnData[watchedKey] || [];
  const loginClaimedToday: boolean = earnData[loginKey] || false;
  const articlesSubmitted: number = earnData.articles || 0;
  const pendingEarnings: number = earnData.pending || 0;

  async function claimLoginBonus() {
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }
    if (loginClaimedToday) {
      toast.info("Already claimed today!");
      return;
    }
    setClaimingLogin(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const updated: Record<string, unknown> = {
        ...earnData,
        pending: pendingEarnings + 0.1,
      };
      updated[loginKey] = true;
      saveEarnData(updated);
      toast.success("+$0.10 Daily login bonus added to pending earnings!");
    } finally {
      setClaimingLogin(false);
    }
  }

  async function watchVideo(videoId: number) {
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }
    if (watchedToday.includes(videoId)) {
      toast.info("Already watched today!");
      return;
    }
    setClaimingVideo(videoId);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      if (actor) {
        try {
          await actor.claimEarnForVideo(user!.username, BigInt(videoId));
        } catch {
          /* ignore */
        }
      }
      const newWatched = [...watchedToday, videoId];
      const updated: Record<string, unknown> = {
        ...earnData,
        pending: pendingEarnings + 0.1,
      };
      updated[watchedKey] = newWatched;
      saveEarnData(updated);
      toast.success("+$0.10 Watch reward added to pending earnings!");
    } finally {
      setClaimingVideo(null);
    }
  }

  async function submitArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }
    if (!articleTitle.trim()) {
      toast.error("Please enter article title.");
      return;
    }
    if (articleContent.trim().split(/\s+/).length < 100) {
      toast.error("Article must be at least 100 words.");
      return;
    }
    setSubmittingArticle(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      if (actor) {
        try {
          await actor.claimEarnForArticle(user!.username, articleTitle.trim());
        } catch {
          /* ignore */
        }
      }
      saveEarnData({
        ...earnData,
        articles: articlesSubmitted + 1,
        pending: pendingEarnings + 0.5,
      });
      setArticleTitle("");
      setArticleContent("");
      toast.success("+$0.50 Article submitted! Pending admin approval.");
    } finally {
      setSubmittingArticle(false);
    }
  }

  const totalEarned = user?.totalEarned || 0;

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-3">
            Earn & Rewards
          </Badge>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-2">
            Daily Earning Tasks
          </h1>
          <p className="text-muted-foreground">
            Complete tasks to earn USDT. Minimum withdrawal: $10
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Earned",
              value: `$${totalEarned.toFixed(2)}`,
              icon: Star,
            },
            {
              label: "Pending",
              value: `$${pendingEarnings.toFixed(2)}`,
              icon: Clock,
            },
            { label: "Videos Watched", value: watchedToday.length, icon: Play },
            {
              label: "Articles Written",
              value: articlesSubmitted,
              icon: BookOpen,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="glass-card rounded-xl p-4 text-center"
              >
                <Icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <div className="font-display font-bold text-lg text-gold">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Daily Login Bonus */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      Daily Login Bonus
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Claim once every day
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-bold">+$0.10</span>
                  {loginClaimedToday ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" /> Claimed
                    </Badge>
                  ) : (
                    <Button
                      data-ocid="earn.primary_button"
                      size="sm"
                      onClick={claimLoginBonus}
                      disabled={claimingLogin}
                      className="bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 text-xs"
                    >
                      {claimingLogin ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Claim"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Watch Videos */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-gold" />
                <h3 className="font-display font-bold text-foreground">
                  Watch to Earn
                </h3>
                <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                  $0.10/video
                </Badge>
              </div>
              <div className="space-y-3">
                {VIDEOS.map((v) => {
                  const watched = watchedToday.includes(v.id);
                  return (
                    <div
                      key={v.id}
                      data-ocid={`earn.item.${v.id}`}
                      className="flex items-center justify-between py-2 border-b border-border/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {v.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {v.duration}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-sm font-bold">
                          +${v.reward}
                        </span>
                        {watched ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Button
                            data-ocid="earn.primary_button"
                            size="sm"
                            onClick={() => watchVideo(v.id)}
                            disabled={claimingVideo === v.id}
                            className="bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 text-xs h-7"
                          >
                            {claimingVideo === v.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Watch"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write Article */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-gold" />
                <h3 className="font-display font-bold text-foreground">
                  Write to Earn
                </h3>
                <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                  $0.50/article
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Write a 100+ word article about crypto, trading, or markets.
                Admin reviews and approves.
              </p>
              <form onSubmit={submitArticle}>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Article title"
                    data-ocid="earn.input"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    className="w-full bg-background/50 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
                  />
                  <Textarea
                    placeholder="Write your article here (minimum 100 words)..."
                    data-ocid="earn.textarea"
                    value={articleContent}
                    onChange={(e) => setArticleContent(e.target.value)}
                    rows={5}
                    className="bg-background/50 border-border/60 focus:border-gold/50 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {
                        articleContent.trim().split(/\s+/).filter(Boolean)
                          .length
                      }{" "}
                      / 100 words
                    </span>
                    <Button
                      type="submit"
                      data-ocid="earn.submit_button"
                      disabled={submittingArticle}
                      className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold text-sm h-9"
                    >
                      {submittingArticle ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      Submit Article
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-foreground mb-4">
                Earning Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Daily Login", amount: "$0.10" },
                  { label: "Per Video", amount: "$0.10" },
                  { label: "Per Article", amount: "$0.50" },
                  { label: "Per Referral", amount: "$5.00" },
                  { label: "First Deposit", amount: "$2.00" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-green-400 font-medium">
                      {item.amount}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border/30 pt-3 text-xs text-muted-foreground">
                  Min withdrawal: $10 USDT
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-gold" />
                <h3 className="font-display font-bold text-foreground">
                  Refer & Earn
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Earn $5 for every friend you invite who registers.
              </p>
              {user && (
                <div className="bg-background/50 rounded-lg px-3 py-2 font-mono text-lg font-bold text-gold text-center tracking-widest border border-gold/20">
                  {user.referralCode}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
