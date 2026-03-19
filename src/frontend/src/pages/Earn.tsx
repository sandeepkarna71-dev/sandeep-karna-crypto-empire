import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  BarChart2,
  CheckCircle,
  Coins,
  Crown,
  ExternalLink,
  Flame,
  Gift,
  Loader2,
  Play,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

function getDailyLimit(): number {
  try {
    const s = JSON.parse(localStorage.getItem("sce_admin_settings") || "{}");
    return Number(s.dailyLimit) || 500;
  } catch {
    return 500;
  }
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLS<T>(key: string, def: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? def;
  } catch {
    return def;
  }
}

function saveLS(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
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

export function Earn() {
  const { user, isLoggedIn, updateUser } = useAuth();
  const username = user?.username || "";
  const today = getTodayDate();

  const dailyEarnKey = `sce_daily_earn_${username}_${today}`;
  const [dailyEarned, setDailyEarned] = useState<number>(() =>
    loadLS<number>(dailyEarnKey, 0),
  );

  const completedKey = `sce_completed_${username}_${today}`;
  const [completed, setCompleted] = useState<string[]>(() =>
    loadLS<string[]>(completedKey, []),
  );

  const spinKey = `sce_spin_${username}_${today}`;
  const [spinUsed, setSpinUsed] = useState<boolean>(() =>
    loadLS<boolean>(spinKey, false),
  );
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);

  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);
  const [taskStepsDone, setTaskStepsDone] = useState<Record<string, string[]>>(
    {},
  );
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const tasks = loadLS<AdminTask[]>("sce_admin_tasks", []);
    setAdminTasks(tasks);
  }, []);

  const DAILY_LIMIT = getDailyLimit();
  const dailyPct = Math.min((dailyEarned / DAILY_LIMIT) * 100, 100);
  const limitReached = dailyEarned >= DAILY_LIMIT;

  const addDailyEarning = useCallback(
    (amount: number): boolean => {
      const limit = getDailyLimit();
      const current = loadLS<number>(dailyEarnKey, 0);
      if (current >= limit) {
        toast.error(
          `Daily limit of $${limit} USDT reached! Come back tomorrow.`,
        );
        return false;
      }
      const capped = Math.min(amount, limit - current);
      const newTotal = current + capped;
      saveLS(dailyEarnKey, newTotal);
      setDailyEarned(newTotal);
      if (!user) return false;
      updateUser({
        balance: (user.balance || 0) + capped,
        totalEarned: (user.totalEarned || 0) + capped,
      });
      return true;
    },
    [dailyEarnKey, user, updateUser],
  );

  const markCompleted = useCallback(
    (taskId: string) => {
      setCompleted((prev) => {
        const updated = [...prev, taskId];
        saveLS(completedKey, updated);
        return updated;
      });
    },
    [completedKey],
  );

  async function handleSpin() {
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }
    if (spinUsed) {
      toast.info("Spin already used today!");
      return;
    }
    if (limitReached) {
      toast.error("Daily limit reached!");
      return;
    }
    setSpinning(true);
    setSpinResult(null);
    await new Promise((r) => setTimeout(r, 2000));
    const reward = Math.round((Math.random() * 0.9 + 0.1) * 100) / 100;
    setSpinResult(reward);
    saveLS(spinKey, true);
    setSpinUsed(true);
    setSpinning(false);
    const ok = addDailyEarning(reward);
    if (ok) toast.success(`🎉 Daily Spin: +$${reward.toFixed(2)} USDT added!`);
  }

  const categories = [
    "All",
    ...Array.from(
      new Set(adminTasks.map((t) => t.category || "General").filter(Boolean)),
    ),
  ];
  const filteredTasks =
    activeCategory === "All"
      ? adminTasks
      : adminTasks.filter((t) => (t.category || "General") === activeCategory);

  const streak: number = (() => {
    let s = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `sce_daily_earn_${username}_${d.toISOString().slice(0, 10)}`;
      if (loadLS<number>(key, 0) > 0) s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-3">
            Earn &amp; Rewards
          </Badge>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-1">
            Daily Earn Center
          </h1>
          <p className="text-muted-foreground">
            Complete tasks added by admin to earn USDT rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Daily Progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="earn.daily_progress"
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-foreground">
                  Daily Earnings
                </span>
                <span
                  className={`font-bold text-sm ${limitReached ? "text-red-400" : "text-green-400"}`}
                >
                  ${dailyEarned.toFixed(2)} / ${DAILY_LIMIT}.00 USDT
                </span>
              </div>
              <Progress value={dailyPct} className="h-3 bg-background/50" />
              {limitReached ? (
                <p className="text-xs text-red-400 mt-2 font-medium">
                  🚫 Daily limit reached. Come back tomorrow!
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  ${(DAILY_LIMIT - dailyEarned).toFixed(2)} remaining today
                </p>
              )}
            </motion.div>

            {/* Daily Spin */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="flex items-center gap-2 justify-center mb-4">
                <RefreshCw className="w-5 h-5 text-gold" />
                <h2 className="font-display font-bold text-xl text-foreground">
                  Daily Spin
                </h2>
                <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                  Once per day
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Spin once daily for a random reward of $0.10 – $1.00 USDT
              </p>
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: spinning ? 1440 : 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="relative w-32 h-32"
                >
                  <div className="w-full h-full rounded-full border-4 border-gold/40 bg-gradient-to-br from-gold/20 to-orange-brand/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,182,0,0.2)]">
                    <AnimatePresence mode="wait">
                      {spinResult !== null && !spinning ? (
                        <motion.div
                          key="result"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center"
                        >
                          <div className="text-gold font-display font-bold text-xl">
                            +${spinResult.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            USDT
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="icon">
                          <Gift className="w-12 h-12 text-gold/60" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <div
                      key={deg}
                      style={{
                        transform: `rotate(${deg}deg) translateY(-60px)`,
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold/50"
                    />
                  ))}
                </motion.div>
              </div>
              {spinUsed ? (
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Spin used today. Come back
                  tomorrow!
                </div>
              ) : (
                <Button
                  data-ocid="earn.spin_button"
                  onClick={handleSpin}
                  disabled={spinning || limitReached || !isLoggedIn}
                  size="lg"
                  className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold h-12 px-8 hover:opacity-90"
                >
                  {spinning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                      Spinning...
                    </>
                  ) : (
                    "🎰 Spin Now!"
                  )}
                </Button>
              )}
            </motion.div>

            {/* Admin Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-gold" />
                <h2 className="font-display font-bold text-xl text-foreground">
                  Tasks
                </h2>
                <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                  Complete all steps to claim
                </Badge>
              </div>

              {/* Category filter */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      data-ocid="earn.tab"
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        activeCategory === cat
                          ? "bg-gold/20 border-gold/50 text-gold"
                          : "border-border/40 text-muted-foreground hover:border-gold/30 hover:text-gold/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredTasks.length === 0 ? (
                <div
                  data-ocid="earn.empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  <Play className="w-12 h-12 mx-auto mb-3 text-gold/20" />
                  <p className="text-sm font-medium">No tasks available yet.</p>
                  <p className="text-xs mt-1">
                    Admin will add tasks soon. Check back daily!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task, idx) => {
                    const taskClaimKey = `admintask_claimed_${task.id}_${today}`;
                    const alreadyClaimed = completed.includes(taskClaimKey);
                    const doneSteps = taskStepsDone[task.id] || [];
                    const allStepsDone =
                      task.steps.length === 0 ||
                      doneSteps.length >= task.steps.length;
                    const isClaimLoading = claimingTask === taskClaimKey;
                    return (
                      <div
                        key={task.id}
                        data-ocid={
                          idx < 5 ? `earn.task.item.${idx + 1}` : undefined
                        }
                        className="border border-border/30 rounded-xl p-4 bg-background/20"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            {task.category && (
                              <span className="text-xs text-gold/70 font-medium uppercase tracking-wide mb-1 block">
                                {task.category}
                              </span>
                            )}
                            <span className="font-semibold text-foreground text-sm">
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <Badge className="bg-gold/10 text-gold border-gold/20 text-xs shrink-0">
                            ${task.reward.toFixed(2)} USDT
                          </Badge>
                        </div>

                        {/* Media preview */}
                        {task.imageUrl && (
                          <img
                            src={task.imageUrl}
                            alt={task.title}
                            className="w-full max-h-40 object-cover rounded-lg mb-3"
                          />
                        )}
                        {task.videoUrl && (
                          // biome-ignore lint/a11y/useMediaCaption: user-uploaded content
                          <video
                            src={task.videoUrl}
                            controls
                            className="w-full max-h-40 rounded-lg mb-3"
                          />
                        )}
                        {(task as AdminTask & { audioUrl?: string })
                          .audioUrl && (
                          // biome-ignore lint/a11y/useMediaCaption: user-uploaded content
                          <audio
                            src={
                              (task as AdminTask & { audioUrl?: string })
                                .audioUrl
                            }
                            controls
                            className="w-full mb-3"
                          />
                        )}

                        {task.adUrl && (
                          <a
                            href={task.adUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gold hover:underline mb-3 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Open Link /
                            Content
                          </a>
                        )}

                        {task.steps.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                            {task.steps.map((step, si) => {
                              const stepDone = doneSteps.includes(step);
                              return (
                                <button
                                  key={step}
                                  type="button"
                                  disabled={
                                    stepDone || alreadyClaimed || limitReached
                                  }
                                  onClick={() => {
                                    if (!isLoggedIn) {
                                      toast.error("Please login first.");
                                      return;
                                    }
                                    setTaskStepsDone((prev) => ({
                                      ...prev,
                                      [task.id]: [
                                        ...(prev[task.id] || []),
                                        step,
                                      ],
                                    }));
                                    toast.success(
                                      `✅ Step "${step}" marked complete!`,
                                    );
                                  }}
                                  data-ocid={
                                    si === 0 ? "earn.task.toggle" : undefined
                                  }
                                  className={`rounded-lg p-2.5 text-center border text-xs font-semibold transition-all ${
                                    stepDone
                                      ? "border-green-500/40 bg-green-500/10 text-green-400"
                                      : "border-border/40 bg-background/30 text-foreground hover:border-gold/40 hover:bg-gold/5"
                                  }`}
                                >
                                  {stepDone ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" />{" "}
                                      {step}
                                    </span>
                                  ) : (
                                    step
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {alreadyClaimed ? (
                          <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                            <CheckCircle className="w-4 h-4" /> ✓ Reward Claimed
                          </div>
                        ) : allStepsDone ? (
                          <Button
                            size="sm"
                            disabled={
                              isClaimLoading || limitReached || !isLoggedIn
                            }
                            onClick={async () => {
                              if (!isLoggedIn) {
                                toast.error("Please login first.");
                                return;
                              }
                              setClaimingTask(taskClaimKey);
                              await new Promise((r) => setTimeout(r, 600));
                              const ok = addDailyEarning(task.reward);
                              if (ok) {
                                markCompleted(taskClaimKey);
                                toast.success(
                                  `🎉 +$${task.reward.toFixed(2)} USDT credited to your balance!`,
                                );
                              }
                              setClaimingTask(null);
                            }}
                            data-ocid={
                              idx < 5 ? "earn.task.primary_button" : undefined
                            }
                            className="text-xs font-bold w-full bg-gradient-to-r from-gold to-orange-brand text-navy hover:opacity-90 shadow-[0_0_12px_rgba(255,182,0,0.3)]"
                          >
                            {isClaimLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />{" "}
                                Claiming...
                              </>
                            ) : (
                              "🎁 Claim Reward"
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.info(
                                "Complete all steps above to unlock the reward!",
                              );
                            }}
                            data-ocid={
                              idx < 5 ? "earn.task.secondary_button" : undefined
                            }
                            className="text-xs font-semibold w-full border-border/40 text-muted-foreground hover:border-gold/40 hover:text-gold/80"
                          >
                            Complete Task
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-5"
            >
              <h3 className="font-display font-bold text-foreground mb-4">
                Your Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Today
                  </span>
                  <span className="font-bold text-green-400">
                    ${dailyEarned.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" /> Total Earned
                  </span>
                  <span className="font-bold text-gold">
                    ${(user?.totalEarned || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Tasks Done
                  </span>
                  <span className="font-bold text-foreground">
                    {completed.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-brand" /> Streak
                  </span>
                  <span className="font-bold text-orange-brand">
                    {streak} days 🔥
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> Balance
                  </span>
                  <span className="font-bold text-gold">
                    ${(user?.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {user && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-gold" />
                  <h3 className="font-display font-bold text-foreground">
                    Your Referral
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Share to earn $1 per referral
                </p>
                <div className="bg-background/50 rounded-lg px-3 py-2 font-mono text-base font-bold text-gold text-center tracking-widest border border-gold/20">
                  {user.referralCode}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-gold" />
                <h3 className="font-display font-bold text-foreground">
                  Rates
                </h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Daily Spin", val: "$0.10–$1.00" },
                  { label: "Task Reward", val: "Set by admin" },
                  { label: "Referral", val: "$1.00" },
                  { label: "Daily Limit", val: "$500 USDT" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-green-400 font-semibold">
                      {r.val}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                <Award className="w-3.5 h-3.5 inline mr-1 text-gold" />
                15% platform commission applies
              </div>
            </motion.div>

            {!isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl p-5 text-center ring-1 ring-gold/20"
              >
                <Crown className="w-8 h-8 text-gold mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-3">
                  Login to start earning
                </p>
                <a href="/login">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold w-full"
                  >
                    Login Now
                  </Button>
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
