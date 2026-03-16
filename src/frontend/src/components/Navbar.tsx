import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Coins, Menu, Moon, Sun, TrendingUp, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/plans", label: "Plans" },
  { to: "/signals", label: "Signals" },
  { to: "/earn", label: "Earn 💰" },
  { to: "/wallet", label: "Wallet" },
  { to: "/leaderboard", label: "Leaders" },
  { to: "/news", label: "News" },
  { to: "/vlog", label: "Vlog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, isLoggedIn, logout } = useAuth();

  const balance = (user?.balance || 0).toFixed(2);

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-gold/20"
      style={{ background: "rgba(8,12,24,0.92)", backdropFilter: "blur(20px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-orange-brand flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-navy" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-display font-bold text-sm gold-gradient">
                Sandeep Karn
              </span>
              <span className="block font-display text-xs text-orange-brand font-semibold">
                Crypto Empire
              </span>
            </div>
            <span className="sm:hidden font-display font-bold text-sm gold-gradient">
              SKCE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={"nav.link"}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "bg-gold/10 text-gold border border-gold/30"
                    : "text-foreground/70 hover:text-gold hover:bg-gold/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              data-ocid="nav.toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-foreground/60 hover:text-gold hover:bg-gold/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {isLoggedIn && user ? (
              <>
                <Link to="/wallet">
                  <div
                    data-ocid="nav.link"
                    className="flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition-colors cursor-pointer"
                  >
                    <Coins className="w-3 h-3" />${balance}
                  </div>
                </Link>
                <Link to="/profile">
                  <div
                    data-ocid="nav.link"
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-orange-brand flex items-center justify-center text-navy font-bold text-sm cursor-pointer"
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    data-ocid="nav.button"
                    variant="ghost"
                    size="sm"
                    className="text-foreground/70 hover:text-gold text-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    data-ocid="nav.button"
                    size="sm"
                    className="bg-gradient-to-r from-gold to-orange-brand text-navy font-bold text-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              data-ocid="nav.toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-foreground/60 hover:text-gold transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              className="p-2 text-foreground/70 hover:text-gold transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gold/20"
            style={{ background: "rgba(8,12,24,0.98)" }}
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid="nav.link"
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "bg-gold/10 text-gold"
                      : "text-foreground/70 hover:text-gold"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-gold/10 space-y-1">
                {isLoggedIn && user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gold flex items-center gap-2">
                      <Coins className="w-4 h-4" /> ${balance} USDT
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 text-sm text-foreground/70 hover:text-gold"
                    >
                      Profile ({user.username})
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-red-400"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 text-sm text-foreground/70 hover:text-gold"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 text-sm text-gold font-medium"
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
