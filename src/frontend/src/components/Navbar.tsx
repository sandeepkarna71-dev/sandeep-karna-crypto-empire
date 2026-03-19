import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Coins, Menu, TrendingUp, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NotificationPanel } from "./NotificationPanel";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/trading", label: "Trade" },
  { to: "/earn", label: "Earn" },
  { to: "/p2p", label: "P2P" },
  { to: "/wallet", label: "Wallet" },
  { to: "/signals", label: "Signals" },
  { to: "/vlog", label: "Vlog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const balance = (user?.balance || 0).toFixed(2);

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,215,0,0.12)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  boxShadow: "0 0 15px rgba(255,215,0,0.4)",
                }}
              >
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <div className="hidden sm:block">
                <span
                  className="font-display font-bold text-sm block gold-gradient"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  SKCE
                </span>
                <span className="text-[10px] text-white/40 font-medium tracking-widest uppercase">
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
                  data-ocid="nav.link"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 relative group ${
                    isActive(link.to)
                      ? "text-[#FFD700]"
                      : "text-white/50 hover:text-white/90"
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{
                        background: "#FFD700",
                        boxShadow: "0 0 8px rgba(255,215,0,0.8)",
                      }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-2">
              {isLoggedIn && user ? (
                <>
                  {/* Notification bell */}
                  <button
                    type="button"
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg text-white/50 hover:text-white transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span
                      className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3366]"
                      style={{ boxShadow: "0 0 6px rgba(255,51,102,0.8)" }}
                    />
                  </button>

                  {/* Balance chip */}
                  <Link to="/wallet">
                    <div
                      data-ocid="nav.link"
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer transition-all"
                      style={{
                        background: "rgba(255,215,0,0.1)",
                        border: "1px solid rgba(255,215,0,0.3)",
                        color: "#FFD700",
                      }}
                    >
                      <Coins className="w-3 h-3" />${balance}
                    </div>
                  </Link>

                  {/* Avatar */}
                  <Link to="/profile">
                    <div
                      data-ocid="nav.link"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #FFD700, #FFA500)",
                        boxShadow: "0 0 10px rgba(255,215,0,0.3)",
                      }}
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
                      className="text-white/60 hover:text-white text-xs"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      data-ocid="nav.button"
                      size="sm"
                      className="text-xs font-bold glow-btn-yellow px-4 h-8"
                    >
                      <Zap className="w-3 h-3 mr-1" /> Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex items-center gap-2">
              {isLoggedIn && user && (
                <>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-1.5 text-white/50"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#FF3366]" />
                  </button>
                  <Link
                    to="/wallet"
                    data-ocid="nav.wallet.button"
                    className="flex items-center gap-1 h-7 px-2 rounded-full text-xs font-bold"
                    style={{
                      background: "linear-gradient(135deg, #FFD700, #FFA500)",
                      color: "#0a0a0a",
                    }}
                  >
                    <Coins className="w-3 h-3" />${balance}
                  </Link>
                </>
              )}
              <button
                type="button"
                className="p-2 text-white/60 hover:text-white transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
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
              className="lg:hidden"
              style={{
                background: "rgba(10,10,10,0.98)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(255,215,0,0.1)",
              }}
            >
              <div className="px-4 py-3 space-y-0.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid="nav.link"
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? "bg-[rgba(255,215,0,0.1)] text-[#FFD700]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/5 space-y-0.5 mt-2">
                  {isLoggedIn && user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-[#FFD700] flex items-center gap-2">
                        <Coins className="w-4 h-4" /> ${balance} USDT
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 text-sm text-white/60 hover:text-white"
                      >
                        Profile ({user.username})
                      </Link>
                      <Link
                        to="/kyc"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 text-sm text-white/60 hover:text-white"
                      >
                        KYC Verification
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-[#FF3366]"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 text-sm text-white/60 hover:text-white"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 text-sm text-[#FFD700] font-bold"
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

      {/* Notification Panel */}
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
