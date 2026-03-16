import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Play, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { VlogCategory } from "../backend.d";
import { useVlogPostsByCategory } from "../hooks/useQueries";

const SAMPLE_TRADING = [
  {
    id: 1,
    title: "Starting My Crypto Trading Journey - Day 1",
    description:
      "Today I'm sharing my very first steps into the world of crypto trading. Starting with $1000, learning market fundamentals, and setting up my trading platform.",
    date: "Mar 1, 2026",
    tag: "Beginners",
  },
  {
    id: 2,
    title: "Bitcoin Breakout Analysis - Riding the Wave",
    description:
      "BTC just broke through the $65K resistance level. Here's my full technical analysis on where it's heading next and how I'm positioning my portfolio.",
    date: "Mar 4, 2026",
    tag: "Analysis",
  },
  {
    id: 3,
    title: "My First Profitable Trade - $340 in One Day",
    description:
      "After weeks of practice, I finally hit my first significant profit. Breaking down exactly what I did right and what I learned from this trade.",
    date: "Mar 7, 2026",
    tag: "Win",
  },
  {
    id: 4,
    title: "Altcoin Season Strategy - Which Coins I'm Watching",
    description:
      "With Bitcoin dominance dropping, it's time to look at altcoins. Here are the 5 projects I'm most bullish on for the coming months.",
    date: "Mar 10, 2026",
    tag: "Strategy",
  },
  {
    id: 5,
    title: "The Trade That Lost Me $500 - Painful Lessons",
    description:
      "Not every trade is a winner. This video covers a painful loss and the critical risk management mistakes I made. Learning from losses is how you grow.",
    date: "Mar 12, 2026",
    tag: "Lesson",
  },
];

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function Trading() {
  const { data: posts = [], isLoading } = useVlogPostsByCategory(
    VlogCategory.trading,
  );

  const displayPosts = posts.length > 0 ? posts : null;

  return (
    <div className="min-h-screen bg-mesh pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-4xl font-bold mb-3">
            Trading <span className="gold-gradient">Journey</span>
          </h1>
          <p className="text-foreground/50">
            Follow my day-to-day trading experiences, analysis, and lessons
            learned
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {[
            { label: "Total Trades", value: "147" },
            { label: "Win Rate", value: "68%" },
            { label: "Best Month", value: "+$2,400" },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl p-4 text-center"
            >
              <div className="font-display text-2xl font-bold gold-gradient">
                {s.value}
              </div>
              <div className="text-xs text-foreground/40 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />
          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center py-10 text-foreground/40">
                Loading trading posts...
              </div>
            ) : (
              (displayPosts || SAMPLE_TRADING).map((post, i) => {
                const isBackend = "videoUrl" in post;
                const videoId = isBackend
                  ? getYoutubeId((post as any).videoUrl)
                  : null;
                const date = isBackend
                  ? new Date(
                      Number((post as any).createdAt) / 1000000,
                    ).toLocaleDateString()
                  : (post as any).date;
                const title = post.title;
                const description = post.description;
                const tag = isBackend ? "Trading" : (post as any).tag;

                return (
                  <motion.div
                    key={String(post.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative pl-16"
                  >
                    <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-gradient-to-br from-gold to-orange-brand border-2 border-navy flex items-center justify-center">
                      <TrendingUp className="w-2 h-2 text-navy" />
                    </div>
                    <div className="glass-card glass-card-hover rounded-xl p-5 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gold/10 text-gold border border-gold/20 text-xs">
                            {tag}
                          </Badge>
                          <span className="text-xs text-foreground/40 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {date}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground mb-2">
                        {title}
                      </h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        {description}
                      </p>
                      {videoId && (
                        <div className="mt-4 rounded-lg overflow-hidden aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            className="w-full h-full"
                            allowFullScreen
                            title={title}
                          />
                        </div>
                      )}
                      {!videoId && isBackend && (post as any).videoUrl && (
                        <a
                          href={(post as any).videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 text-sm text-gold hover:text-gold/70 transition-colors"
                        >
                          <Play className="w-4 h-4" /> Watch Video
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 glass-card rounded-2xl p-10"
        >
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gold/50" />
          <h3 className="font-display text-2xl font-bold mb-3">
            Join the Trading Journey
          </h3>
          <p className="text-foreground/50 mb-6">
            Watch daily vlogs and live trading sessions
          </p>
          <Link to="/vlog">
            <Button className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold">
              Watch Vlogs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
