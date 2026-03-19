import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

function loadLS<T>(key: string, def: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? def;
  } catch {
    return def;
  }
}

export function Signals() {
  const signals = loadLS<any[]>("sce_admin_signals", []);

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-3">
            Expert Signals
          </Badge>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-2">
            Trading Signals
          </h1>
          <p className="text-muted-foreground">
            Real-time BUY/SELL/HOLD signals from Sandeep Karna
          </p>
        </motion.div>

        {signals.length === 0 ? (
          <div className="text-center py-24" data-ocid="signals.empty_state">
            <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-gold/30" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground/50 mb-2">
              No Signals Yet
            </h3>
            <p className="text-muted-foreground">
              Admin will add trading signals soon. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signals.map((s: any, i: number) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                data-ocid={`signals.item.${i + 1}`}
                className="glass-card glass-card-hover rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {s.type === "BUY" ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-display font-bold text-lg text-foreground">
                      {s.asset}
                    </span>
                  </div>
                  <Badge
                    className={`text-sm font-bold ${
                      s.type === "BUY"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : s.type === "SELL"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {s.type}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    {
                      label: "Entry",
                      value: s.entryPrice ? `$${s.entryPrice}` : "—",
                    },
                    {
                      label: "Target",
                      value: s.targetPrice ? `$${s.targetPrice}` : "—",
                    },
                    {
                      label: "Stop Loss",
                      value: s.stopLoss ? `$${s.stopLoss}` : "—",
                    },
                  ].map((r) => (
                    <div key={r.label} className="text-center">
                      <div className="text-xs text-muted-foreground">
                        {r.label}
                      </div>
                      <div className="font-mono font-bold text-foreground text-sm">
                        {r.value}
                      </div>
                    </div>
                  ))}
                </div>
                {s.description && (
                  <p className="text-sm text-muted-foreground">
                    {s.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {s.date}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
