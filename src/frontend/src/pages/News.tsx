import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useWorldNews } from "../hooks/useQueries";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function News() {
  const {
    data: articles = [],
    isLoading,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useWorldNews();
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "--";

  return (
    <div className="min-h-screen bg-mesh pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">
                World <span className="gold-gradient">News</span>
              </h1>
              <p className="text-foreground/50">
                Auto-updating global news & crypto headlines
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground/50">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {lastUpdated}</span>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-gold hover:text-gold/70 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div data-ocid="news.loading_state" className="space-y-4">
            {["n1", "n2", "n3", "n4", "n5"].map((k) => (
              <Skeleton key={k} className="h-32 rounded-xl bg-navy-card" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, i) => (
              <motion.a
                key={article.url || `news-${i}`}
                data-ocid={`news.item.${i + 1}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card glass-card-hover rounded-xl p-5 flex gap-5 transition-all duration-300 block group"
              >
                {article.image && (
                  <div className="flex-shrink-0 w-28 h-24 rounded-lg overflow-hidden">
                    <img
                      src={article.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement)
                          .parentElement!.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-foreground/30 flex-shrink-0 group-hover:text-gold/50 transition-colors mt-0.5" />
                  </div>
                  {article.description && (
                    <p className="text-sm text-foreground/50 mt-1.5 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <Badge
                      variant="outline"
                      className="text-xs border-gold/20 text-gold/70 bg-gold/5 py-0"
                    >
                      {article.source?.name || "Unknown"}
                    </Badge>
                    <span className="text-xs text-foreground/30">
                      {timeAgo(article.publishedAt)}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
            <p className="text-foreground/40">No news available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
