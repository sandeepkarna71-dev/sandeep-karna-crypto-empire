import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, LogIn, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

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
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-orange-brand mb-4">
            <TrendingUp className="w-8 h-8 text-navy" />
          </div>
          <h1 className="font-display text-3xl font-bold gold-gradient mb-1">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your Crypto Empire account
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {errors.general && (
                <div
                  data-ocid="login.error_state"
                  className="bg-destructive/10 border border-destructive/30 text-red-400 text-sm rounded-lg px-4 py-3"
                >
                  {errors.general}
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="credential"
                  className="text-foreground/80 text-sm font-medium"
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
                  className="bg-background/50 border-border/60 focus:border-gold/50 h-11"
                />
                {errors.credential && (
                  <p
                    data-ocid="login.error_state"
                    className="text-red-400 text-xs mt-1"
                  >
                    {errors.credential}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-foreground/80 text-sm font-medium"
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
                    className="bg-background/50 border-border/60 focus:border-gold/50 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="text-red-400 text-xs mt-1"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                data-ocid="login.submit_button"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-gold to-orange-brand text-navy font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing
                    In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              data-ocid="login.link"
              className="text-gold hover:text-gold/80 font-medium transition-colors"
            >
              Register Now
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/admin"
              data-ocid="login.link"
              className="text-xs text-muted-foreground hover:text-gold/70 transition-colors"
            >
              Admin Login →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
