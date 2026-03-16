import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Play, Tag, Video } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { VlogCategory } from "../backend.d";
import { useVlogPosts } from "../hooks/useQueries";

const SAMPLE_VLOGS = [
  {
    id: 1,
    title: "My Crypto Trading Journey - Week 1 Recap",
    description:
      "Sharing everything from my first week of serious crypto trading. The highs, the lows, and the lessons learned along the way.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: VlogCategory.trading,
    createdAt: BigInt(Date.now() * 1000000),
  },
  {
    id: 2,
    title: "Bitcoin Analysis: Why I'm Bullish Right Now",
    description:
      "Deep dive into Bitcoin's current chart patterns and why I believe we're heading for new all-time highs.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: VlogCategory.vlog,
    createdAt: BigInt((Date.now() - 86400000) * 1000000),
  },
  {
    id: 3,
    title: "🔥 Bybit Promotion - 30% Bonus on First Deposit!",
    description:
      "Exclusive partnership deal! Use my link to get a 30% bonus on your first deposit. Limited time offer for my subscribers.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: VlogCategory.promo,
    createdAt: BigInt((Date.now() - 172800000) * 1000000),
  },
  {
    id: 4,
    title: "Day in the Life - Trading From Home",
    description:
      "Follow me through my entire trading day, from morning research to executing trades and reviewing results in the evening.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: VlogCategory.vlog,
    createdAt: BigInt((Date.now() - 259200000) * 1000000),
  },
  {
    id: 5,
    title: "Top 3 Altcoins for Q2 2026",
    description:
      "My research-backed picks for the best altcoin opportunities in the next quarter. Complete with entry points and targets.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: VlogCategory.trading,
    createdAt: BigInt((Date.now() - 345600000) * 1000000),
  },
  {
    id: 6,
    title: "Binance Exclusive: Get $100 Free + 20% Fee Discount",
    description:
      "My exclusive Binance referral gives you $100 in trading credits AND 20% off all trading fees. Don't miss this!",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1646953281231-1f2f5b70bcc4?w=400",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: VlogCategory.promo,
    createdAt: BigInt((Date.now() - 432000000) * 1000000),
  },
];

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  [VlogCategory.vlog]: "Vlog",
  [VlogCategory.trading]: "Trading",
  [VlogCategory.promo]: "Promo",
};

const CATEGORY_COLORS: Record<string, string> = {
  [VlogCategory.vlog]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [VlogCategory.trading]: "bg-gold/10 text-gold border-gold/20",
  [VlogCategory.promo]:
    "bg-orange-brand/10 text-orange-brand border-orange-brand/20",
};

export function Vlog() {
  const [activeTab, setActiveTab] = useState("all");
  const { data: posts = [], isLoading } = useVlogPosts();
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const allPosts = posts.length > 0 ? posts : SAMPLE_VLOGS;
  const filtered =
    activeTab === "all"
      ? allPosts
      : allPosts.filter((p) => String(p.category) === activeTab);

  return (
    <div className="min-h-screen bg-mesh pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold mb-2">
            Vlog & <span className="text-orange-brand">Promotions</span>
          </h1>
          <p className="text-foreground/50">
            Daily vlogs, trading sessions, and exclusive deals
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-navy-card border border-gold/15">
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <TabsTrigger
                key={val}
                value={val}
                data-ocid={`vlog.${val}.tab`}
                className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["v1", "v2", "v3", "v4", "v5", "v6"].map((k) => (
              <Skeleton key={k} className="h-64 rounded-xl bg-navy-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => {
              const videoId = getYoutubeId(post.videoUrl);
              const thumbUrl = videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : post.thumbnailUrl;
              const catKey = String(post.category);
              const date = new Date(
                Number(post.createdAt) / 1000000,
              ).toLocaleDateString();
              const isExpanded = expandedVideo === String(post.id);

              return (
                <motion.div
                  key={String(post.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card glass-card-hover rounded-xl overflow-hidden transition-all duration-300 flex flex-col"
                >
                  <button
                    type="button"
                    className="relative aspect-video bg-navy-card cursor-pointer group w-full border-0 p-0"
                    onClick={() =>
                      setExpandedVideo(isExpanded ? null : String(post.id))
                    }
                  >
                    {isExpanded && videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        className="w-full h-full"
                        allowFullScreen
                        title={post.title}
                      />
                    ) : (
                      <>
                        <img
                          src={thumbUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-navy ml-0.5" />
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={`text-xs border ${CATEGORY_COLORS[catKey] || "bg-muted text-foreground/50"}`}
                      >
                        {CATEGORY_LABELS[catKey] || catKey}
                      </Badge>
                      <span className="text-xs text-foreground/30 flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3" /> {date}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground leading-snug mb-1 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-foreground/50 line-clamp-2 flex-1">
                      {post.description}
                    </p>
                    {post.videoUrl && !videoId && (
                      <a
                        href={post.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-gold hover:text-gold/70"
                      >
                        <Video className="w-3 h-3" /> Watch Video
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
            <p className="text-foreground/40">No posts in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
