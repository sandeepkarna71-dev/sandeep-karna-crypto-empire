import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Crown,
  Play,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useActor } from "../hooks/useActor";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Users,
    title: "Register & Verify",
    desc: "Create your account in minutes. No ID required. Start with any budget.",
  },
  {
    step: "02",
    icon: TrendingUp,
    title: "Choose & Invest",
    desc: "Select an investment plan from $100 to $50,000. Higher investment = higher daily returns.",
  },
  {
    step: "03",
    icon: Crown,
    title: "Earn Daily",
    desc: "Watch your balance grow daily. Withdraw anytime with admin approval.",
  },
];

const PLAN_TEASERS = [
  {
    name: "Starter",
    invest: "$100",
    daily: "$5/day",
    color: "from-slate-400 to-slate-600",
  },
  {
    name: "Gold",
    invest: "$5,000",
    daily: "$400/day",
    color: "from-gold to-orange-brand",
    popular: true,
  },
  {
    name: "Diamond",
    invest: "$50,000",
    daily: "$5,000/day",
    color: "from-cyan-400 to-cyan-600",
  },
];

const SIGNAL_TEASERS = [
  { asset: "BTC/USDT", type: "BUY", target: "$72,000", entry: "$67,800" },
  { asset: "ETH/USDT", type: "BUY", target: "$3,600", entry: "$3,250" },
  { asset: "SOL/USDT", type: "SELL", target: "$165", entry: "$185" },
];

export function Home() {
  const { actor, isFetching } = useActor();

  const { data: ads = [] } = useQuery({
    queryKey: ["activeAds"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getActiveAds();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAnnouncements();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const { data: vlogs = [] } = useQuery({
    queryKey: ["vlogs"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getVlogPosts();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const announcementText =
    announcements.length > 0
      ? announcements.map((a: any) => a.title).join("  •  ")
      : "🚀 Welcome to Sandeep Karn Crypto Empire!  •  Earn $50 to $10,000 daily  •  Join 2,400+ active traders  •  New Gold Plan now available!  •  Referral bonus: $5 per invite";

  return (
    <div className="min-h-screen bg-mesh">
      {/* Announcement ticker */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gold/10 border-b border-gold/20 py-2 overflow-hidden">
        <div className="animate-marquee text-xs text-gold font-medium">
          {[announcementText, announcementText].map((t, i) => (
            <span key={t + String(i)} className="px-8 whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-brand/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-gold/10 text-gold border-gold/30 mb-6 text-sm px-4 py-1.5">
              🏆 #1 Crypto Trading Platform India
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Earn <span className="gold-gradient">$50 – $10,000</span>
            <br />
            Daily with Smart Trading
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join Sandeep Karna&apos;s expert-guided crypto trading empire.
            Invest smart, earn daily, withdraw anytime.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link to="/signup">
              <Button
                data-ocid="home.primary_button"
                size="lg"
                className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold text-lg h-14 px-8 hover:opacity-90"
              >
                Start Earning Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/plans">
              <Button
                data-ocid="home.secondary_button"
                size="lg"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 h-14 px-8 text-lg"
              >
                View Plans <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16"
          >
            {[
              { value: "2,400+", label: "Active Traders" },
              { value: "$2.8M+", label: "Total Paid Out" },
              { value: "98%", label: "Success Rate" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl font-bold text-gold">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              How It <span className="gold-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground">
              Start earning in 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-card rounded-2xl p-6 text-center relative"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-orange-brand flex items-center justify-center text-xs font-bold text-navy">
                    {item.step}
                  </div>
                  <Icon className="w-10 h-10 text-gold mx-auto mt-4 mb-3" />
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans teaser */}
      <section className="py-16 px-4 bg-background/20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Investment <span className="gold-gradient">Plans</span>
              </h2>
              <p className="text-muted-foreground mt-1">
                Choose your earning level
              </p>
            </div>
            <Link to="/plans">
              <Button
                data-ocid="home.link"
                variant="ghost"
                className="text-gold hover:bg-gold/10"
              >
                See All Plans <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLAN_TEASERS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card glass-card-hover rounded-2xl p-6 relative ${
                  p.popular ? "ring-2 ring-gold/40" : ""
                }`}
              >
                {p.popular && (
                  <Badge className="absolute -top-2 right-3 bg-gradient-to-r from-gold to-orange-brand text-navy text-xs font-bold">
                    Popular
                  </Badge>
                )}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} mb-3`}
                />
                <h3 className="font-display font-bold text-lg text-foreground">
                  {p.name}
                </h3>
                <div className="text-gold font-bold text-2xl mt-1">
                  {p.daily}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Min: {p.invest}
                </div>
                <Link to="/plans">
                  <Button
                    data-ocid={"home.secondary_button"}
                    size="sm"
                    variant="ghost"
                    className="mt-3 text-gold hover:bg-gold/10 text-xs w-full"
                  >
                    View Plan Details
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signals teaser */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Live <span className="gold-gradient">Signals</span>
              </h2>
              <p className="text-muted-foreground mt-1">
                Expert trading signals updated daily
              </p>
            </div>
            <Link to="/signals">
              <Button
                data-ocid="home.link"
                variant="ghost"
                className="text-gold hover:bg-gold/10"
              >
                All Signals <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SIGNAL_TEASERS.map((s, i) => (
              <motion.div
                key={s.asset}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-4 flex items-center gap-4"
              >
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    s.type === "BUY"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {s.type}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-foreground text-sm">
                    {s.asset}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Entry: {s.entry}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Target</div>
                  <div className="text-green-400 text-sm font-bold">
                    {s.target}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ads / Promotions */}
      {ads.length > 0 && (
        <section className="py-16 px-4 bg-background/20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              Promotions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(ads as any[]).slice(0, 3).map((ad: any, i: number) => (
                <motion.a
                  key={String(ad.id)}
                  href={ad.linkUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden block"
                >
                  {ad.imageUrl && (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-foreground">{ad.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ad.description}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Vlogs */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Latest <span className="gold-gradient">Vlogs</span>
            </h2>
            <Link to="/vlog">
              <Button
                data-ocid="home.link"
                variant="ghost"
                className="text-gold hover:bg-gold/10"
              >
                All Vlogs <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {vlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(vlogs as any[]).slice(0, 3).map((v: any, i: number) => (
                <motion.div
                  key={String(v.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden"
                >
                  <div className="aspect-video bg-background/50 relative flex items-center justify-center">
                    {v.thumbnailUrl ? (
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-12 h-12 text-gold/50" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground line-clamp-2">
                      {v.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {v.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "Crypto Trading Basics for Beginners",
                  desc: "Learn how to start trading crypto from scratch",
                },
                {
                  title: "My $5,000 to $50,000 Journey",
                  desc: "How I turned a small investment into a fortune",
                },
                {
                  title: "Top 5 Signals That Made Me Rich",
                  desc: "Real signals I used to grow my portfolio",
                },
              ].map((v) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden"
                >
                  <div className="aspect-video bg-gradient-to-br from-gold/10 to-orange-brand/10 flex items-center justify-center">
                    <Play className="w-12 h-12 text-gold/60" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground">{v.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {v.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Earn features */}
      <section className="py-16 px-4 bg-background/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Multiple Ways to <span className="gold-gradient">Earn</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, label: "Trading Plans", desc: "5-10% daily" },
              { icon: Play, label: "Watch Videos", desc: "$0.10/video" },
              {
                icon: BookOpen,
                label: "Write Articles",
                desc: "$0.50/article",
              },
              { icon: Users, label: "Refer Friends", desc: "$5/referral" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-xl p-5 text-center"
                >
                  <Icon className="w-8 h-8 text-gold mx-auto mb-2" />
                  <div className="font-medium text-foreground text-sm">
                    {item.label}
                  </div>
                  <div className="text-xs text-green-400 mt-0.5">
                    {item.desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-10 glow-gold"
          >
            <h2 className="font-display text-4xl font-bold gold-gradient mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join 2,400+ traders already making daily profits. Register free
              and choose your plan.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup">
                <Button
                  data-ocid="home.primary_button"
                  size="lg"
                  className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold text-lg h-14 px-10 hover:opacity-90"
                >
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-muted-foreground">
              {[
                "✓ Free Registration",
                "✓ Daily Payouts",
                "✓ Secure & Trusted",
              ].map((f) => (
                <span key={f} className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />{" "}
                  {f.substring(2)}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
