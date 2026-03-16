import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Crown,
  LogOut,
  Play,
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
    color: "from-gold to-orange-brand",
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
        <div className="glass-card rounded-2xl p-10 text-center max-w-sm w-full">
          <Crown className="w-16 h-16 text-gold mx-auto mb-4 opacity-50" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Not Logged In
          </h2>
          <p className="text-muted-foreground mb-6">
            Please login to view your profile.
          </p>
          <Link to="/login">
            <Button
              data-ocid="profile.primary_button"
              className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold w-full"
            >
              Login
            </Button>
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

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-orange-brand flex items-center justify-center text-2xl font-display font-bold text-navy">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {user.fullName || user.username}
              </h1>
              <div className="text-muted-foreground text-sm">
                @{user.username}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Member since {joinDate}
              </div>
            </div>
          </div>
          <Button
            data-ocid="profile.button"
            onClick={handleLogout}
            variant="ghost"
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Balance",
              value: `$${(user.balance || 0).toFixed(2)}`,
              color: "text-gold",
            },
            {
              label: "Total Earned",
              value: `$${(user.totalEarned || 0).toFixed(2)}`,
              color: "text-green-400",
            },
            {
              label: "Total Deposited",
              value: `$${(user.totalDeposited || 0).toFixed(2)}`,
              color: "text-blue-400",
            },
            {
              label: "Referral Code",
              value: user.referralCode,
              color: "text-purple-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div className={`font-display text-lg font-bold ${s.color}`}>
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Active Plan */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="font-display font-bold text-lg text-foreground mb-4">
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
                    <div className="font-bold text-foreground">
                      {plan.name} Plan
                    </div>
                    <div className="text-sm text-green-400">
                      {plan.dailyPct}% daily return
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                  Active
                </Badge>
              </div>
              <Progress value={planProgress} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{planProgress}% of 30 days</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4" data-ocid="profile.empty_state">
              <TrendingUp className="w-10 h-10 text-gold/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm mb-3">
                No active plan. Start investing to earn daily.
              </p>
              <Link to="/plans">
                <Button
                  data-ocid="profile.primary_button"
                  size="sm"
                  className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold"
                >
                  Browse Plans <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              to: "/plans",
              icon: TrendingUp,
              label: "Investment Plans",
              desc: "5-10% daily",
            },
            {
              to: "/wallet",
              icon: Wallet,
              label: "Wallet",
              desc: "Deposit & Withdraw",
            },
            {
              to: "/earn",
              icon: Play,
              label: "Daily Tasks",
              desc: "Earn USDT",
            },
            {
              to: "/referral",
              icon: Users,
              label: "Referrals",
              desc: `Code: ${user.referralCode}`,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  data-ocid="profile.card"
                  className="glass-card glass-card-hover rounded-xl p-4 text-center cursor-pointer h-full"
                >
                  <Icon className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="font-medium text-sm text-foreground">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Learn More */}
        <div className="mt-6 glass-card rounded-xl p-4 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gold shrink-0" />
          <p className="text-sm text-muted-foreground">
            Need help? Check our{" "}
            <Link to="/vlog" className="text-gold hover:underline">
              video guides
            </Link>{" "}
            or{" "}
            <Link to="/signals" className="text-gold hover:underline">
              trading signals
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
