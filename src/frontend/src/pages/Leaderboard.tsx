import { Badge } from "@/components/ui/badge";
import { Crown, Medal, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const LEADERBOARD = [
  {
    rank: 1,
    username: "sandeep****",
    totalEarned: 48200,
    plan: "Diamond",
    joined: "Jan 2026",
  },
  {
    rank: 2,
    username: "raj****",
    totalEarned: 32800,
    plan: "Diamond",
    joined: "Jan 2026",
  },
  {
    rank: 3,
    username: "priya****",
    totalEarned: 28500,
    plan: "Platinum",
    joined: "Feb 2026",
  },
  {
    rank: 4,
    username: "amit****",
    totalEarned: 21000,
    plan: "Platinum",
    joined: "Feb 2026",
  },
  {
    rank: 5,
    username: "deepak****",
    totalEarned: 18700,
    plan: "Gold",
    joined: "Feb 2026",
  },
  {
    rank: 6,
    username: "ravi****",
    totalEarned: 15200,
    plan: "Gold",
    joined: "Feb 2026",
  },
  {
    rank: 7,
    username: "sunita****",
    totalEarned: 12400,
    plan: "Gold",
    joined: "Mar 2026",
  },
  {
    rank: 8,
    username: "rahul****",
    totalEarned: 9800,
    plan: "Silver",
    joined: "Mar 2026",
  },
  {
    rank: 9,
    username: "anita****",
    totalEarned: 8200,
    plan: "Silver",
    joined: "Mar 2026",
  },
  {
    rank: 10,
    username: "vikram****",
    totalEarned: 7500,
    plan: "Silver",
    joined: "Mar 2026",
  },
  {
    rank: 11,
    username: "pooja****",
    totalEarned: 6100,
    plan: "Basic",
    joined: "Mar 2026",
  },
  {
    rank: 12,
    username: "arjun****",
    totalEarned: 5400,
    plan: "Basic",
    joined: "Mar 2026",
  },
  {
    rank: 13,
    username: "kavya****",
    totalEarned: 4800,
    plan: "Basic",
    joined: "Mar 2026",
  },
  {
    rank: 14,
    username: "suresh****",
    totalEarned: 4200,
    plan: "Basic",
    joined: "Mar 2026",
  },
  {
    rank: 15,
    username: "neha****",
    totalEarned: 3600,
    plan: "Starter",
    joined: "Mar 2026",
  },
  {
    rank: 16,
    username: "manish****",
    totalEarned: 2900,
    plan: "Starter",
    joined: "Mar 2026",
  },
  {
    rank: 17,
    username: "divya****",
    totalEarned: 2100,
    plan: "Starter",
    joined: "Mar 2026",
  },
  {
    rank: 18,
    username: "arun****",
    totalEarned: 1800,
    plan: "Starter",
    joined: "Mar 2026",
  },
  {
    rank: 19,
    username: "meenal****",
    totalEarned: 1400,
    plan: "Starter",
    joined: "Mar 2026",
  },
  {
    rank: 20,
    username: "rajesh****",
    totalEarned: 1100,
    plan: "Starter",
    joined: "Mar 2026",
  },
];

const planColors: Record<string, string> = {
  Diamond: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Platinum: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Gold: "bg-gold/20 text-gold border-gold/30",
  Silver: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  Basic: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Starter: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return (
    <span className="text-sm font-mono font-bold text-muted-foreground">
      #{rank}
    </span>
  );
}

export function Leaderboard() {
  const totalEarned = LEADERBOARD.reduce((a, u) => a + u.totalEarned, 0);

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-4">
            Top Earners
          </Badge>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-3">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top 20 earners this month. Join them and start earning today!
          </p>
        </motion.div>

        {/* Community stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: "2,400+" },
            {
              label: "Community Earned",
              value: `$${(totalEarned / 1000).toFixed(0)}K+`,
            },
            { label: "Active Plans", value: "1,800+" },
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

        {/* Top 3 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {LEADERBOARD.slice(0, 3).map((u, i) => (
            <motion.div
              key={u.rank}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              data-ocid={`leaderboard.item.${u.rank}`}
              className={`glass-card rounded-2xl p-5 text-center ${
                u.rank === 1 ? "ring-2 ring-gold/40 shadow-gold" : ""
              }`}
            >
              <div className="text-3xl mb-2">
                {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : "🥉"}
              </div>
              <div className="font-display font-bold text-foreground">
                {u.username}
              </div>
              <div className="text-gold font-bold text-lg mt-1">
                ${u.totalEarned.toLocaleString()}
              </div>
              <Badge
                variant="outline"
                className={`text-xs mt-2 ${planColors[u.plan]}`}
              >
                {u.plan}
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* Full table */}
        <div
          className="glass-card rounded-2xl overflow-hidden"
          data-ocid="leaderboard.table"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {["Rank", "Username", "Total Earned", "Plan", "Joined"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((u, i) => (
                  <motion.tr
                    key={u.rank}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    data-ocid={"leaderboard.row"}
                    className="border-b border-border/20 hover:bg-gold/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-8">
                        <RankBadge rank={u.rank} />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-green-400">
                      ${u.totalEarned.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${planColors[u.plan]}`}
                      >
                        {u.plan}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {u.joined}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span>
              Leaderboard updates every 24 hours. Invest more to climb higher!
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
