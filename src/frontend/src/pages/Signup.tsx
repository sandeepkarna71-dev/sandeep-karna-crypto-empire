import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, TrendingUp, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: (search?.ref as string) || "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.username.trim() || form.username.length < 3)
      e.username = "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = "Username: letters, numbers, underscores only";
    if (!form.email.includes("@")) e.email = "Valid email is required";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(
        form.fullName.trim(),
        form.username.trim(),
        form.email.trim().toLowerCase(),
        form.password,
        form.referralCode.trim() || undefined,
      );
      toast.success("Registration successful! Welcome to Crypto Empire!");
      navigate({ to: "/plans" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
      setErrors({ general: err.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  }

  function field(id: string, label: string, extra: object, errKey: string) {
    return (
      <div className="space-y-1.5">
        <Label
          htmlFor={id}
          className="text-white/70 text-xs font-semibold uppercase tracking-wider"
        >
          {label}
        </Label>
        <Input
          id={id}
          {...extra}
          className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 transition-all"
        />
        {errors[errKey] && (
          <p data-ocid="signup.error_state" className="text-[#FF3366] text-xs">
            {errors[errKey]}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
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
            Create Account
          </h1>
          <p className="text-white/40 text-sm">
            Join thousands earning daily on SKCE
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0,240,255,0.15)",
            boxShadow:
              "0 0 40px rgba(0,240,255,0.06), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {errors.general && (
                <div
                  data-ocid="signup.error_state"
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: "rgba(255,51,102,0.1)",
                    border: "1px solid rgba(255,51,102,0.3)",
                    color: "#FF3366",
                  }}
                >
                  {errors.general}
                </div>
              )}

              {field(
                "fullName",
                "Full Name",
                {
                  type: "text",
                  autoComplete: "name",
                  placeholder: "Your full name",
                  "data-ocid": "signup.input",
                  value: form.fullName,
                  onChange: (e: any) =>
                    setForm({ ...form, fullName: e.target.value }),
                },
                "fullName",
              )}

              {field(
                "username",
                "Username",
                {
                  type: "text",
                  autoComplete: "username",
                  placeholder: "Choose a username",
                  "data-ocid": "signup.input",
                  value: form.username,
                  onChange: (e: any) =>
                    setForm({ ...form, username: e.target.value }),
                },
                "username",
              )}

              {field(
                "email",
                "Email Address",
                {
                  type: "email",
                  autoComplete: "email",
                  placeholder: "your@email.com",
                  "data-ocid": "signup.input",
                  value: form.email,
                  onChange: (e: any) =>
                    setForm({ ...form, email: e.target.value }),
                },
                "email",
              )}

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
                    data-ocid="signup.input"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min 6 characters"
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
                    data-ocid="signup.error_state"
                    className="text-[#FF3366] text-xs"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {field(
                "confirmPassword",
                "Confirm Password",
                {
                  type: "password",
                  autoComplete: "new-password",
                  placeholder: "Repeat your password",
                  "data-ocid": "signup.input",
                  value: form.confirmPassword,
                  onChange: (e: any) =>
                    setForm({ ...form, confirmPassword: e.target.value }),
                },
                "confirmPassword",
              )}

              {field(
                "referralCode",
                "Referral Code (Optional)",
                {
                  type: "text",
                  placeholder: "Enter referral code for $1 bonus",
                  "data-ocid": "signup.input",
                  value: form.referralCode,
                  onChange: (e: any) =>
                    setForm({ ...form, referralCode: e.target.value }),
                },
                "referralCode",
              )}

              <button
                type="submit"
                data-ocid="signup.submit_button"
                disabled={loading}
                className="w-full h-11 rounded-lg font-bold text-sm glow-btn-yellow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating
                    Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Join SKCE — Free
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              to="/login"
              data-ocid="signup.link"
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#FFD700" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
