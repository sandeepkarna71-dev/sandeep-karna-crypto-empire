import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BarChart2, Shield, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export function Plans() {
  return (
    <div className="min-h-screen bg-mesh pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-orange-brand flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-navy" />
          </div>
          <h1 className="font-display text-4xl font-bold gold-gradient mb-4">
            Investment Plans
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Traditional investment plans have been replaced with modern trading
            features. Earn profits through real meme coin trading with
            DexScreener and Phantom Wallet, or practice futures trading with our
            simulated platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link to="/meme-trading">
              <div className="glass-card rounded-2xl p-6 hover:border-gold/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <BarChart2 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">
                  Meme Coin Trading
                </h3>
                <p className="text-sm text-muted-foreground">
                  Trade BONK, WIF, PEPE and more with DexScreener charts &
                  Phantom Wallet
                </p>
              </div>
            </Link>
            <Link to="/futures">
              <div className="glass-card rounded-2xl p-6 hover:border-gold/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">
                  Futures Trading
                </h3>
                <p className="text-sm text-muted-foreground">
                  BTC, ETH, SOL, BNB perpetual contracts with up to 20x leverage
                  (paper trading)
                </p>
              </div>
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 bg-green-500/5 border-green-500/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-400">
                Trusted & Legitimate
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sandeep Karna Crypto Empire is a trusted trading education
              platform. All simulated trading is for learning purposes. Real
              deposits & withdrawals are processed through Binance Pay & Bybit
              Pay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/meme-trading">
              <Button
                data-ocid="plans.primary_button"
                className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold"
              >
                Start Meme Trading →
              </Button>
            </Link>
            <Link to="/futures">
              <Button
                data-ocid="plans.secondary_button"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                Try Futures Trading →
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
