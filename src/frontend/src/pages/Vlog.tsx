import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, Video } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function loadLS<T>(key: string, def: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? def;
  } catch {
    return def;
  }
}

export function Vlog() {
  const [vlogs, setVlogs] = useState<any[]>([]);
  const [watched, setWatched] = useState<number[]>([]);
  const [claimed, setClaimed] = useState<number[]>([]);

  useEffect(() => {
    setVlogs(loadLS("sce_admin_vlogs", []));
    setWatched(loadLS("sce_watched_vlogs", []));
    setClaimed(loadLS("sce_claimed_vlog_rewards", []));
  }, []);

  function handleWatch(vlog: any) {
    if (vlog.videoUrl) {
      window.open(vlog.videoUrl, "_blank");
    }
    if (!watched.includes(vlog.id)) {
      const updated = [...watched, vlog.id];
      setWatched(updated);
      localStorage.setItem("sce_watched_vlogs", JSON.stringify(updated));
    }
  }

  function handleClaim(vlog: any) {
    if (claimed.includes(vlog.id)) return;
    const reward = vlog.watchReward || 0;
    if (reward <= 0) return;
    const userRaw = localStorage.getItem("sce_current_user");
    if (!userRaw) {
      toast.error("Please login to claim reward");
      return;
    }
    const user = JSON.parse(userRaw);
    user.balance = (user.balance || 0) + reward;
    user.totalEarned = (user.totalEarned || 0) + reward;
    localStorage.setItem("sce_current_user", JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem("sce_users") || "[]");
    const idx = users.findIndex((u: any) => u.username === user.username);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem("sce_users", JSON.stringify(users));
    }
    const updatedClaimed = [...claimed, vlog.id];
    setClaimed(updatedClaimed);
    localStorage.setItem(
      "sce_claimed_vlog_rewards",
      JSON.stringify(updatedClaimed),
    );
    toast.success(`+${reward} USDT credited to your balance!`);
  }

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-3">
            Video Content
          </Badge>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-2">
            Vlogs &amp; Videos
          </h1>
          <p className="text-muted-foreground">
            Watch videos and earn USDT rewards
          </p>
        </motion.div>

        {vlogs.length === 0 ? (
          <div className="text-center py-24" data-ocid="vlog.empty_state">
            <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-gold/30" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground/50 mb-2">
              No Vlogs Yet
            </h3>
            <p className="text-muted-foreground">
              Admin will add vlogs soon. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vlogs.map((v: any, i: number) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`vlog.item.${i + 1}`}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden"
              >
                <div className="aspect-video bg-background/50 relative flex items-center justify-center overflow-hidden">
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold/5 to-orange-brand/5 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gold/30" />
                    </div>
                  )}
                  <button
                    onClick={() => handleWatch(v)}
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                    data-ocid={`vlog.watch_button.${i + 1}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                      <Play className="w-7 h-7 text-gold ml-1" />
                    </div>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground line-clamp-2 mb-1">
                    {v.title}
                  </h3>
                  {v.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {v.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {v.date}
                    </span>
                    {v.watchReward > 0 &&
                      (claimed.includes(v.id) ? (
                        <Badge className="bg-gold/10 text-gold border-gold/30 text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Claimed{" "}
                          {v.watchReward} USDT
                        </Badge>
                      ) : watched.includes(v.id) ? (
                        <Button
                          size="sm"
                          onClick={() => handleClaim(v)}
                          data-ocid={`vlog.claim_button.${i + 1}`}
                          className="bg-gold text-background hover:bg-gold/90 text-xs h-7 px-3"
                        >
                          Claim {v.watchReward} USDT
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWatch(v)}
                          data-ocid={`vlog.watch_button.${i + 1}`}
                          className="border-gold/30 text-gold hover:bg-gold/10 text-xs h-7 px-3"
                        >
                          Watch &amp; Earn
                        </Button>
                      ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
