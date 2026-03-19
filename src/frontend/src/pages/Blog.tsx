import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calendar, Clock, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  imageUrl?: string;
};

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "How to Earn 10-100 USD Daily with SKCE Crypto Tasks",
    slug: "how-to-earn-crypto-daily-skce",
    excerpt:
      "Learn how to maximize your daily earnings on SKCE (Sandeep Karn Crypto Empire) by completing crypto tasks, referrals, and daily spins.",
    content: "",
    category: "Earning Guide",
    tags: ["SKCE", "earn crypto", "crypto tasks", "passive income"],
    date: "2026-03-17",
    readTime: "5 min",
  },
  {
    id: "2",
    title: "What is SKCE? - Sandeep Karn Crypto Empire Explained",
    slug: "what-is-skce-sandeep-karn-crypto-empire",
    excerpt:
      "SKCE stands for Sandeep Karn Crypto Empire. In this article, we explain what SKCE is, how it works, and why thousands of people trust it for daily crypto earnings.",
    content: "",
    category: "About SKCE",
    tags: ["SKCE", "Sandeep Karn Crypto Empire", "crypto platform"],
    date: "2026-03-16",
    readTime: "4 min",
  },
  {
    id: "3",
    title: "Best Crypto Earning Methods in 2026 - SKCE Guide",
    slug: "best-crypto-earning-methods-2026",
    excerpt:
      "Discover the top 10 ways to earn cryptocurrency in 2026. From task-based earnings to referral programs, SKCE offers 500+ earning methods.",
    content: "",
    category: "Crypto Tips",
    tags: ["crypto earning", "earn money online", "passive income", "2026"],
    date: "2026-03-15",
    readTime: "6 min",
  },
  {
    id: "4",
    title: "How to Withdraw USDT Earnings from SKCE",
    slug: "how-to-withdraw-usdt-from-skce",
    excerpt:
      "Step-by-step guide to withdrawing your USDT earnings from SKCE to your crypto wallet. Supports BTC, ETH, SOL, and USDT TRC20.",
    content: "",
    category: "Guide",
    tags: ["USDT withdrawal", "crypto wallet", "SKCE tutorial"],
    date: "2026-03-14",
    readTime: "3 min",
  },
  {
    id: "5",
    title: "SKCE Referral Program - Earn $1 Per Friend",
    slug: "skce-referral-program-earn-per-friend",
    excerpt:
      "Share your SKCE referral link and earn $1 USDT for every friend who joins. Learn how to maximize your referral earnings on Sandeep Karn Crypto Empire.",
    content: "",
    category: "Referral",
    tags: ["referral", "passive income", "SKCE", "earn money"],
    date: "2026-03-13",
    readTime: "3 min",
  },
  {
    id: "6",
    title: "Live Crypto Prices on SKCE - Real-Time Binance Data",
    slug: "live-crypto-prices-skce-binance",
    excerpt:
      "SKCE shows live crypto prices directly from Binance API. Learn how our real-time price feed helps you make better trading decisions.",
    content: "",
    category: "Trading",
    tags: ["crypto prices", "Binance", "real-time", "trading"],
    date: "2026-03-12",
    readTime: "4 min",
  },
];

function loadLS<T>(key: string, def: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? def;
  } catch {
    return def;
  }
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const adminPosts = loadLS<BlogPost[]>("sce_admin_blog_posts", []);
    setPosts([...adminPosts, ...SAMPLE_POSTS]);
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((p) => p.category))),
  ];
  const filtered =
    selectedCategory === "All"
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-mesh pt-20">
      {/* SEO-friendly page header */}
      <section
        className="py-16 px-4 text-center"
        aria-labelledby="blog-heading"
      >
        <div className="max-w-4xl mx-auto">
          <Badge className="bg-gold/10 text-gold border-gold/30 mb-4">
            SKCE Blog
          </Badge>
          <h1
            id="blog-heading"
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            Crypto Earning <span className="gold-gradient">Articles</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tips, guides, and news about earning crypto daily with SKCE (Sandeep
            Karn Crypto Empire). Learn how to maximize your crypto earnings.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="flex flex-wrap gap-2 justify-center"
            role="tablist"
            aria-label="Blog categories"
          >
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                data-ocid="blog.category.tab"
                className={
                  selectedCategory === cat
                    ? "bg-gold text-navy font-bold"
                    : "border-border/40 text-muted-foreground hover:border-gold/40 hover:text-gold"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-6 px-4 pb-20" aria-label="Blog posts">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16" data-ocid="blog.empty_state">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gold/20" />
              <p className="text-muted-foreground">
                No articles yet in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col"
                  data-ocid={`blog.item.${i + 1}`}
                  itemScope
                  itemType="https://schema.org/BlogPosting"
                >
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={`${post.title} - SKCE blog`}
                      className="w-full h-40 object-cover"
                      itemProp="image"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-gold/10 to-orange-brand/5 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gold/30" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                        {post.category}
                      </Badge>
                    </div>
                    <h2
                      className="font-bold text-foreground text-base leading-tight mb-2 line-clamp-2"
                      itemProp="headline"
                    >
                      {post.title}
                    </h2>
                    <p
                      className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1"
                      itemProp="description"
                    >
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs border border-border/30 rounded-full px-2 py-0.5 text-muted-foreground flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <time itemProp="datePublished" dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </time>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>
                      <span className="text-gold text-xs font-medium flex items-center gap-1">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA to join */}
      <section className="py-16 px-4 bg-background/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Start <span className="gold-gradient">Earning?</span>
          </h2>
          <p className="text-muted-foreground mb-6">
            Join SKCE (Sandeep Karn Crypto Empire) and earn 10-100 USD daily.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <Button
                data-ocid="blog.cta.primary_button"
                size="lg"
                className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold px-8"
              >
                Join Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/earn">
              <Button
                data-ocid="blog.cta.secondary_button"
                size="lg"
                variant="outline"
                className="border-gold/40 text-gold hover:bg-gold/10 px-8"
              >
                Start Earning
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
