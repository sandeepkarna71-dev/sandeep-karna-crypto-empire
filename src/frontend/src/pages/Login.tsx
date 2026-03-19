import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, LogIn, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const FLOAT_ICONS = [
  { icon: "₿", top: "10%", left: "5%", delay: 0, size: "2xl" },
  { icon: "Ξ", top: "20%", right: "8%", delay: 1, size: "xl" },
  { icon: "◎", top: "70%", left: "3%", delay: 2, size: "xl" },
  { icon: "🔐", top: "15%", left: "45%", delay: 0.5, size: "lg" },
  { icon: "💎", bottom: "20%", right: "5%", delay: 1.5, size: "2xl" },
  { icon: "⚡", bottom: "10%", left: "15%", delay: 0.8, size: "xl" },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ credential: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.credential.trim()) e.credential = "Username or email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.credential.trim(), form.password);
      toast.success("Welcome back! Login successful.");
      navigate({ to: "/profile" });
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please try again.");
      setErrors({ general: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Radial glows */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Floating crypto symbols */}
      {FLOAT_ICONS.map((f, i) => (
        <motion.div
          key={String(i)}
          className="absolute text-white/5 font-display font-bold select-none pointer-events-none"
          style={{
            top: f.top,
            left: (f as any).left,
            right: (f as any).right,
            bottom: (f as any).bottom,
            fontSize:
              f.size === "2xl" ? "4rem" : f.size === "xl" ? "2.5rem" : "2rem",
          }}
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 3 + f.delay,
            repeat: Number.POSITIVE_INFINITY,
            delay: f.delay,
            ease: "easeInOut",
          }}
        >
          {f.icon}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              boxShadow: "0 0 30px rgba(255,215,0,0.4)",
            }}
          >
            <TrendingUp className="w-8 h-8 text-black" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Welcome Back
          </h1>
          <p className="text-white/40 text-sm">
            Sign in to your Crypto Empire account
          </p>
        </div>

        {/* Glass Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,215,0,0.2)",
            boxShadow:
              "0 0 40px rgba(255,215,0,0.08), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  data-ocid="login.error_state"
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: "rgba(255,51,102,0.1)",
                    border: "1px solid rgba(255,51,102,0.3)",
                    color: "#FF3366",
                  }}
                >
                  {errors.general}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="credential"
                  className="text-white/70 text-xs font-semibold uppercase tracking-wider"
                >
                  Username or Email
                </Label>
                <Input
                  id="credential"
                  data-ocid="login.input"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter username or email"
                  value={form.credential}
                  onChange={(e) =>
                    setForm({ ...form, credential: e.target.value })
                  }
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 transition-all"
                />
                {errors.credential && (
                  <p
                    data-ocid="login.error_state"
                    className="text-[#FF3366] text-xs"
                  >
                    {errors.credential}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-white/70 text-xs font-semibold uppercase tracking-wider"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    data-ocid="login.input"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    data-ocid="login.error_state"
                    className="text-[#FF3366] text-xs"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium"
                  style={{ color: "#00F0FF" }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                data-ocid="login.submit_button"
                disabled={loading}
                className="w-full h-11 rounded-lg font-bold text-sm glow-btn-yellow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In to SKCE
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              data-ocid="login.link"
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#FFD700" }}
            >
              Create Account
            </Link>
          </div>

          <div className="mt-3 text-center">
            <Link
              to="/admin"
              data-ocid="login.link"
              className="text-xs text-white/20 hover:text-white/50 transition-colors"
            >
              Admin Login →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
