import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  Crown,
  Diamond,
  Gem,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    color: "from-slate-400 to-slate-600",
    badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    minInvestment: 100,
    dailyPct: 5,
    dailyProfit: 5,
    duration: 30,
    totalReturn: 150,
    netEarning: 105,
    highlight: false,
  },
  {
    id: "basic",
    name: "Basic",
    icon: Shield,
    color: "from-blue-400 to-blue-600",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    minInvestment: 500,
    dailyPct: 6,
    dailyProfit: 30,
    duration: 30,
    totalReturn: 900,
    netEarning: 630,
    highlight: false,
  },
  {
    id: "silver",
    name: "Silver",
    icon: Star,
    color: "from-gray-300 to-gray-500",
    badgeClass: "bg-gray-400/20 text-gray-200 border-gray-400/30",
    minInvestment: 1000,
    dailyPct: 7,
    dailyProfit: 70,
    duration: 30,
    totalReturn: 2100,
    netEarning: 1470,
    highlight: false,
  },
  {
    id: "gold",
    name: "Gold",
    icon: Crown,
    color: "from-gold to-orange-brand",
    badgeClass: "bg-gold/20 text-gold border-gold/30",
    minInvestment: 5000,
    dailyPct: 8,
    dailyProfit: 400,
    duration: 30,
    totalReturn: 12000,
    netEarning: 8400,
    highlight: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    icon: Gem,
    color: "from-purple-400 to-purple-600",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    minInvestment: 10000,
    dailyPct: 9,
    dailyProfit: 900,
    duration: 30,
    totalReturn: 27000,
    netEarning: 18900,
    highlight: false,
  },
  {
    id: "diamond",
    name: "Diamond",
    icon: Diamond,
    color: "from-cyan-400 to-cyan-600",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    minInvestment: 50000,
    dailyPct: 10,
    dailyProfit: 5000,
    duration: 30,
    totalReturn: 150000,
    netEarning: 105000,
    highlight: false,
  },
];

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
}

export function Plans() {
  const { user, isLoggedIn, updateUser } = useAuth();

  function activatePlan(planId: string, minInvestment: number) {
    if (!isLoggedIn) {
      toast.error("Please login to activate a plan.");
      return;
    }
    if (!user) return;
    if ((user.balance || 0) < minInvestment) {
      toast.error(
        `Insufficient balance. You need at least $${minInvestment}. Please deposit first.`,
      );
      return;
    }
    updateUser({
      activePlan: planId,
      planActivatedAt: new Date().toISOString(),
      balance: (user.balance || 0) - minInvestment,
    });
    toast.success(
      `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan activated! Your daily earnings will be credited automatically.`,
    );
  }

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-4">
            Investment Plans
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold gold-gradient mb-4">
            Start Earning Today
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your investment plan and earn daily profits. Platform takes
            30% commission — you keep 70% of all profits.
          </p>
        </motion.div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          {[
            { label: "Min Daily Earning", value: "$5/day" },
            { label: "Max Daily Earning", value: "$5,000/day" },
            { label: "Platform Commission", value: "30%" },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div className="font-display text-xl font-bold text-gold">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isActive = user?.activePlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                data-ocid={`plans.item.${i + 1}`}
                className={`glass-card glass-card-hover rounded-2xl p-6 relative flex flex-col transition-all duration-300 ${
                  plan.highlight ? "ring-2 ring-gold/40 shadow-gold" : ""
                } ${isActive ? "ring-2 ring-green-500/50" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold px-3">
                      🏆 Most Popular
                    </Badge>
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      ✓ Active
                    </Badge>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${plan.badgeClass}`}
                    >
                      {plan.dailyPct}% Daily
                    </Badge>
                  </div>
                </div>

                {/* Key metric */}
                <div className="bg-background/40 rounded-xl p-4 mb-4 text-center">
                  <div className="text-3xl font-display font-bold text-gold">
                    ${plan.dailyProfit.toLocaleString()}
                    <span className="text-lg">/day</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on ${plan.minInvestment.toLocaleString()} investment
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 flex-1 mb-6">
                  {[
                    {
                      label: "Min Investment",
                      value: `$${plan.minInvestment.toLocaleString()}`,
                      highlight: true,
                    },
                    { label: "Daily Return", value: `${plan.dailyPct}%` },
                    { label: "Duration", value: `${plan.duration} Days` },
                    {
                      label: "Gross Total Return",
                      value: fmt(plan.totalReturn),
                    },
                    {
                      label: "Platform Fee (30%)",
                      value: `-${fmt(plan.totalReturn - plan.netEarning)}`,
                      red: true,
                    },
                    {
                      label: "Your Net Earning",
                      value: fmt(plan.netEarning),
                      green: true,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span
                        className={`font-medium ${
                          row.green
                            ? "text-green-400"
                            : row.red
                              ? "text-red-400"
                              : row.highlight
                                ? "text-gold"
                                : "text-foreground"
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {["Daily Payout", "Admin Managed", "Secure"].map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 text-xs text-green-400"
                    >
                      <CheckCircle className="w-3 h-3" /> {f}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                {isActive ? (
                  <Button
                    disabled
                    className="w-full h-11 bg-green-500/20 text-green-400 border border-green-500/30"
                  >
                    ✓ Plan Active
                  </Button>
                ) : isLoggedIn ? (
                  <Button
                    data-ocid={`plans.primary_button.${i + 1}`}
                    onClick={() => activatePlan(plan.id, plan.minInvestment)}
                    className={`w-full h-11 font-bold ${
                      plan.highlight
                        ? "bg-gradient-to-r from-gold to-orange-brand text-navy hover:opacity-90"
                        : "bg-background/60 border border-gold/30 text-gold hover:bg-gold/10"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" /> Activate Plan
                  </Button>
                ) : (
                  <Link to="/signup">
                    <Button
                      data-ocid={`plans.primary_button.${i + 1}`}
                      className="w-full h-11 bg-gradient-to-r from-gold to-orange-brand text-navy font-bold hover:opacity-90"
                    >
                      Get Started
                    </Button>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 glass-card rounded-2xl p-6 max-w-3xl mx-auto text-center"
        >
          <h3 className="font-display text-lg font-bold text-gold mb-2">
            How Earnings Work
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Once you activate a plan, daily profits are calculated based on your
            investment. The platform retains 30% as commission. Remaining 70% is
            credited to your wallet daily. Admin approves all withdrawals within
            24 hours. Minimum withdrawal is $10.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
