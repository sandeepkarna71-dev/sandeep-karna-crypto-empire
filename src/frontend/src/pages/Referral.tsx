import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Gift, Share2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function Referral() {
  const { user, isLoggedIn } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = user
    ? `${window.location.origin}/signup?ref=${user?.referralCode}`
    : "Login to get your referral link";

  function copyLink() {
    if (!user) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function copyCode() {
    if (!user) return;
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied!");
  }

  // Mock referral history
  const referralHistory = user
    ? [
        {
          username: "user_joined_1",
          date: "2026-03-10",
          bonus: 5,
          status: "credited",
        },
        {
          username: "user_joined_2",
          date: "2026-03-12",
          bonus: 5,
          status: "credited",
        },
        {
          username: "user_joined_3",
          date: "2026-03-14",
          bonus: 5,
          status: "pending",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-4">
            Referral Program
          </Badge>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-3">
            Invite & Earn
          </h1>
          <p className="text-muted-foreground">
            Earn $5 bonus for every friend you refer who joins Crypto Empire!
          </p>
        </motion.div>

        {!isLoggedIn ? (
          <div
            className="glass-card rounded-2xl p-10 text-center"
            data-ocid="referral.empty_state"
          >
            <Gift className="w-16 h-16 text-gold mx-auto mb-4 opacity-50" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Login to Access Referrals
            </h3>
            <p className="text-muted-foreground mb-6">
              Create an account to get your unique referral link and start
              earning.
            </p>
            <Link to="/signup">
              <Button
                data-ocid="referral.primary_button"
                className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold"
              >
                Create Account
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Your Referrals",
                  value: referralHistory.length,
                  icon: Users,
                },
                {
                  label: "Total Earned",
                  value: `$${referralHistory.filter((r) => r.status === "credited").length * 5}`,
                  icon: Gift,
                },
                { label: "Bonus Per Referral", value: "$5", icon: Share2 },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="glass-card rounded-xl p-5 text-center"
                  >
                    <Icon className="w-6 h-6 text-gold mx-auto mb-2" />
                    <div className="font-display text-2xl font-bold text-gold">
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Referral code */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">
                Your Referral Code
              </h3>
              <div className="flex gap-3 items-center">
                <div className="flex-1 bg-background/50 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-gold text-center tracking-widest border border-gold/20">
                  {user?.referralCode}
                </div>
                <Button
                  data-ocid="referral.button"
                  onClick={copyCode}
                  className="bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Referral link */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">
                Your Referral Link
              </h3>
              <div className="flex gap-3">
                <Input
                  readOnly
                  value={referralLink}
                  data-ocid="referral.input"
                  className="bg-background/50 border-border/60 text-sm font-mono text-muted-foreground flex-1"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  data-ocid="referral.button"
                  onClick={copyLink}
                  className={`shrink-0 ${
                    copied
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-gradient-to-r from-gold to-orange-brand text-navy font-bold"
                  }`}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: "1",
                    title: "Share Your Link",
                    desc: "Share your unique referral link with friends",
                  },
                  {
                    step: "2",
                    title: "Friend Registers",
                    desc: "Your friend signs up using your link",
                  },
                  {
                    step: "3",
                    title: "Earn $5 Bonus",
                    desc: "$5 credited to your balance instantly",
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    className="bg-background/30 rounded-xl p-4 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-3 font-display font-bold text-gold">
                      {s.step}
                    </div>
                    <div className="font-medium text-foreground text-sm mb-1">
                      {s.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">
                Referral History
              </h3>
              {referralHistory.length === 0 ? (
                <div
                  data-ocid="referral.empty_state"
                  className="text-center py-6 text-muted-foreground"
                >
                  No referrals yet. Share your link to start earning!
                </div>
              ) : (
                <div className="space-y-3">
                  {referralHistory.map((r, i) => (
                    <div
                      key={r.date + String(i)}
                      data-ocid={`referral.item.${i + 1}`}
                      className="flex items-center justify-between py-2 border-b border-border/20"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {r.username}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-bold">
                          +${r.bonus}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "credited"
                              ? "bg-green-500/10 text-green-400 border-green-500/30"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
