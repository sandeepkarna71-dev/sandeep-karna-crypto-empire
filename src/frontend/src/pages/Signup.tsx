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
      e.username = "Username can only contain letters, numbers, underscores";
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

  const field = (id: string, label: string, extra: object, errKey: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-foreground/80 text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        {...extra}
        className="bg-background/50 border-border/60 focus:border-gold/50 h-11"
      />
      {errors[errKey] && (
        <p data-ocid="signup.error_state" className="text-red-400 text-xs">
          {errors[errKey]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-orange-brand mb-4">
            <TrendingUp className="w-8 h-8 text-navy" />
          </div>
          <h1 className="font-display text-3xl font-bold gold-gradient mb-1">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Join thousands earning daily on Crypto Empire
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {errors.general && (
                <div
                  data-ocid="signup.error_state"
                  className="bg-destructive/10 border border-destructive/30 text-red-400 text-sm rounded-lg px-4 py-3"
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
                  className="text-foreground/80 text-sm font-medium"
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
                    data-ocid="signup.error_state"
                    className="text-red-400 text-xs"
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
                  placeholder: "Enter referral code for bonus",
                  "data-ocid": "signup.input",
                  value: form.referralCode,
                  onChange: (e: any) =>
                    setForm({ ...form, referralCode: e.target.value }),
                },
                "referralCode",
              )}

              <Button
                type="submit"
                data-ocid="signup.submit_button"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-gold to-orange-brand text-navy font-bold text-sm hover:opacity-90 transition-opacity mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating
                    Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Create Account
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              data-ocid="signup.link"
              className="text-gold hover:text-gold/80 font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
