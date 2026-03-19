import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Crown,
  LogOut,
  Monitor,
  Play,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const PLAN_INFO: Record<
  string,
  { name: string; dailyPct: number; duration: number; color: string }
> = {
  starter: {
    name: "Starter",
    dailyPct: 5,
    duration: 30,
    color: "from-slate-400 to-slate-600",
  },
  basic: {
    name: "Basic",
    dailyPct: 6,
    duration: 30,
    color: "from-blue-400 to-blue-600",
  },
  silver: {
    name: "Silver",
    dailyPct: 7,
    duration: 30,
    color: "from-gray-300 to-gray-500",
  },
  gold: {
    name: "Gold",
    dailyPct: 8,
    duration: 30,
    color: "from-[#FFD700] to-[#FFA500]",
  },
  platinum: {
    name: "Platinum",
    dailyPct: 9,
    duration: 30,
    color: "from-purple-400 to-purple-600",
  },
  diamond: {
    name: "Diamond",
    dailyPct: 10,
    duration: 30,
    color: "from-cyan-400 to-cyan-600",
  },
};

export function Profile() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-mesh pt-20 flex items-center justify-center px-4">
        <div
          className="rounded-2xl p-10 text-center max-w-sm w-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          <Crown className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            Not Logged In
          </h2>
          <p className="text-white/40 mb-6">
            Please login to view your profile.
          </p>
          <Link to="/login">
            <button
              type="button"
              data-ocid="profile.primary_button"
              className="w-full h-11 rounded-lg font-bold text-sm glow-btn-yellow"
            >
              Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  function handleLogout() {
    logout();
    toast.success("Logged out successfully.");
    navigate({ to: "/" });
  }

  const plan = user.activePlan ? PLAN_INFO[user.activePlan] : null;
  const planProgress =
    user.planActivatedAt && plan
      ? Math.min(
          100,
          Math.floor(
            ((Date.now() - new Date(user.planActivatedAt).getTime()) /
              (1000 * 60 * 60 * 24) /
              plan.duration) *
              100,
          ),
        )
      : 0;

  const joinDate = new Date(user.joinDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Security score based on profile completeness
  const securityScore = (() => {
    let score = 20;
    if (user.email) score += 20;
    if (user.fullName) score += 20;
    if (user.referralCode) score += 15;
    if ((user.balance || 0) > 0) score += 15;
    if ((user.totalEarned || 0) > 0) score += 10;
    return Math.min(score, 100);
  })();

  const secLevel =
    securityScore >= 80 ? "Strong" : securityScore >= 50 ? "Good" : "Weak";
  const secColor =
    securityScore >= 80
      ? "#00FF88"
      : securityScore >= 50
        ? "#FFD700"
        : "#FF3366";

  // Last login device (simulated)
  const lastDevice = {
    type: window.innerWidth < 768 ? "mobile" : "desktop",
    name: window.innerWidth < 768 ? "Mobile Device" : "Desktop Browser",
    time: "Just now",
    location: "India",
  };

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Platform owner hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-5"
          style={{
            background: "rgba(255,215,0,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,215,0,0.2)",
            boxShadow: "0 0 30px rgba(255,215,0,0.08)",
          }}
        >
          <div className="relative shrink-0">
            <img
              src="/assets/uploads/IMG_20260303_214406-1.jpg"
              alt="Sandeep Karna"
              className="w-20 h-20 rounded-full object-cover border-4"
              style={{
                borderColor: "#FFD700",
                boxShadow: "0 0 20px rgba(255,215,0,0.35)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
              }}
            >
              <Crown className="w-3.5 h-3.5 text-black" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap mb-1">
              <span className="font-display text-xl font-bold text-white">
                Sandeep Karna
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,215,0,0.15)",
                  color: "#FFD700",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                Platform Owner
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(0,255,136,0.1)",
                  color: "#00FF88",
                  border: "1px solid rgba(0,255,136,0.2)",
                }}
              >
                Verified
              </span>
            </div>
            <p className="text-white/40 text-sm">
              Founder & CEO — Sandeep Karna Crypto Empire
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              Expert crypto trader • 8+ years experience • 2,400+ students
            </p>
          </div>
        </motion.div>

        {/* User profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-black"
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                boxShadow: "0 0 15px rgba(255,215,0,0.3)",
              }}
            >
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                {user.fullName || user.username}
              </h1>
              <p className="text-white/40 text-sm">@{user.username}</p>
              <p className="text-white/25 text-xs mt-0.5">
                Member since {joinDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="profile.button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "rgba(255,51,102,0.1)",
              border: "1px solid rgba(255,51,102,0.2)",
              color: "#FF3366",
            }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Balance",
              value: `$${(user.balance || 0).toFixed(2)}`,
              color: "#FFD700",
            },
            {
              label: "Total Earned",
              value: `$${(user.totalEarned || 0).toFixed(2)}`,
              color: "#00FF88",
            },
            {
              label: "Total Deposited",
              value: `$${(user.totalDeposited || 0).toFixed(2)}`,
              color: "#00F0FF",
            },
            {
              label: "Referral Code",
              value: user.referralCode,
              color: "#A855F7",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${s.color}20`,
              }}
            >
              <div
                className="font-display text-lg font-bold"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-xs text-white/30 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Security Score XP Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,215,0,0.1)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" style={{ color: secColor }} />
              <h3 className="font-display font-bold text-white">
                Security Score
              </h3>
              <span
                className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: `${secColor}15`,
                  color: secColor,
                  border: `1px solid ${secColor}30`,
                }}
              >
                {secLevel}
              </span>
            </div>
            {/* XP-style bar */}
            <div
              className="relative h-4 rounded-full overflow-hidden mb-2"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${securityScore}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full xp-bar"
              />
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold"
                style={{ color: "#0a0a0a" }}
              >
                {securityScore}/100
              </div>
            </div>
            <p className="text-xs text-white/30">
              Complete profile to improve your security score
            </p>
          </motion.div>

          {/* Last Login Device */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(0,240,255,0.1)",
            }}
          >
            <h3 className="font-display font-bold text-white mb-3">
              Last Login Device
            </h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(0,240,255,0.1)",
                  border: "1px solid rgba(0,240,255,0.2)",
                }}
              >
                {lastDevice.type === "mobile" ? (
                  <Smartphone
                    className="w-6 h-6"
                    style={{ color: "#00F0FF" }}
                  />
                ) : (
                  <Monitor className="w-6 h-6" style={{ color: "#00F0FF" }} />
                )}
              </div>
              <div>
                <p className="font-medium text-white text-sm">
                  {lastDevice.name}
                </p>
                <p className="text-xs text-white/40">
                  {lastDevice.location} · {lastDevice.time}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                  <span className="text-[10px]" style={{ color: "#00FF88" }}>
                    Active session
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Plan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">
            Investment Plan
          </h3>
          {plan ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color}`}
                  />
                  <div>
                    <div className="font-bold text-white">{plan.name} Plan</div>
                    <div className="text-sm" style={{ color: "#00FF88" }}>
                      {plan.dailyPct}% daily return
                    </div>
                  </div>
                </div>
                <Badge
                  style={{
                    background: "rgba(0,255,136,0.1)",
                    color: "#00FF88",
                    border: "1px solid rgba(0,255,136,0.2)",
                  }}
                >
                  Active
                </Badge>
              </div>
              <Progress value={planProgress} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-white/30">
                <span>Progress</span>
                <span>{planProgress}% of 30 days</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4" data-ocid="profile.empty_state">
              <TrendingUp className="w-10 h-10 text-white/10 mx-auto mb-2" />
              <p className="text-white/40 text-sm mb-3">
                No active plan. Start investing to earn daily.
              </p>
              <Link to="/plans">
                <button
                  type="button"
                  data-ocid="profile.primary_button"
                  className="px-4 py-2 rounded-lg font-bold text-sm glow-btn-yellow"
                >
                  Browse Plans <ArrowRight className="w-3 h-3 inline ml-1" />
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              to: "/plans",
              icon: TrendingUp,
              label: "Investment Plans",
              desc: "5-10% daily",
              color: "#FFD700",
            },
            {
              to: "/wallet",
              icon: Wallet,
              label: "Wallet",
              desc: "Deposit & Withdraw",
              color: "#00F0FF",
            },
            {
              to: "/earn",
              icon: Play,
              label: "Daily Tasks",
              desc: "Earn USDT",
              color: "#00FF88",
            },
            {
              to: "/referral",
              icon: Users,
              label: "Referrals",
              desc: `Code: ${user.referralCode}`,
              color: "#A855F7",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  data-ocid="profile.card"
                  className="rounded-xl p-4 text-center cursor-pointer h-full transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${item.color}15`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="font-medium text-sm text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {item.desc}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div
          className="mt-6 rounded-xl p-4 flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <BookOpen className="w-5 h-5 shrink-0" style={{ color: "#FFD700" }} />
          <p className="text-sm text-white/40">
            Need help? Check our{" "}
            <Link
              to="/vlog"
              className="hover:opacity-80 transition-opacity"
              style={{ color: "#FFD700" }}
            >
              video guides
            </Link>{" "}
            or{" "}
            <Link
              to="/signals"
              className="hover:opacity-80 transition-opacity"
              style={{ color: "#00F0FF" }}
            >
              trading signals
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
