import { Link } from "@tanstack/react-router";
import { Heart, TrendingUp } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/10 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-orange-brand flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-navy" />
              </div>
              <span className="font-display font-bold text-lg gold-gradient">
                Sandeep Karn Crypto Empire
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              India&apos;s premier crypto trading platform. Earn daily profits
              with expert-guided investment plans.
            </p>
          </div>

          {/* Earn */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-3 text-sm">
              Earn
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/plans", label: "Investment Plans" },
                { to: "/signals", label: "Trading Signals" },
                { to: "/earn", label: "Daily Tasks" },
                { to: "/referral", label: "Referral Program" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-3 text-sm">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/leaderboard", label: "Leaderboard" },
                { to: "/wallet", label: "Wallet" },
                { to: "/news", label: "World News" },
                { to: "/vlog", label: "Vlogs" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-muted-foreground">
            &copy; {year} Sandeep Karn Crypto Empire. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
