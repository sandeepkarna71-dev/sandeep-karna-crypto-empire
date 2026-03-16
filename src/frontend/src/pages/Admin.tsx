import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_USER = "sandeepkarna321";
const ADMIN_PASS = "Sandeep@321";

export function Admin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (form.username === ADMIN_USER && form.password === ADMIN_PASS) {
      localStorage.setItem("sce_admin_logged_in", "true");
      toast.success("Admin login successful!");
      navigate({ to: "/admin/dashboard" });
    } else {
      setError("Invalid admin credentials.");
      toast.error("Invalid credentials.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm">
            Restricted access only
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {error && (
                <div
                  data-ocid="admin.error_state"
                  className="bg-destructive/10 border border-destructive/30 text-red-400 text-sm rounded-lg px-4 py-3"
                >
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-user"
                  className="text-sm text-foreground/80"
                >
                  Username
                </Label>
                <Input
                  id="admin-user"
                  data-ocid="admin.input"
                  type="text"
                  autoComplete="username"
                  placeholder="Admin username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="bg-background/50 border-border/60 focus:border-red-500/50 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-pass"
                  className="text-sm text-foreground/80"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-pass"
                    data-ocid="admin.input"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Admin password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="bg-background/50 border-border/60 focus:border-red-500/50 h-11 pr-10"
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
              </div>

              <Button
                type="submit"
                data-ocid="admin.submit_button"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Admin Login
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
