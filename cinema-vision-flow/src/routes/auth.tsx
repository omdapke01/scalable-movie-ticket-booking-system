import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/glass/AuroraBackground";
import { GlassNavbar } from "@/components/glass/GlassNavbar";
import { NeonButton } from "@/components/glass/NeonButton";
import { loginApi, registerApi, googleSignInApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Access Account — CineGlass" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const user = await loginApi(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate({ to: "/profile" });
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerApi(name, email, password);
      toast.success("Registration successful! Logging you in...");
      // Auto login
      const user = await loginApi(email, password);
      navigate({ to: "/profile" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Simulate retrieving Google credential token
      const mockGoogleIdToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyFlbWFpbCI6Im9tLmRhcGtlQGdtYWlsLmNvbSIsIm5hbWUiOiJPbSBEYXBrZSIsImF2YXRhciI6Imh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMjM0NTY3OCJ9.signature";
      const user = await googleSignInApi(mockGoogleIdToken);
      toast.success(`Google Sign-in success! Welcome, ${user.name}`);
      navigate({ to: "/profile" });
    } catch (err: any) {
      toast.error(err.message || "Google auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#F9FAFB] pb-24">
      <AuroraBackground />
      <GlassNavbar />

      <main className="mx-auto max-w-md px-6 pt-32 space-y-6">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#8B5CF6] font-bold">
            Secure Access
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            CineGlass <span className="text-gradient-neon">Identity</span>
          </h1>
        </div>

        {/* Auth Panel Glass Card */}
        <div className="glass-strong rounded-3xl p-6 border border-white/8 relative overflow-hidden">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 mb-6">
            <button
              onClick={() => setTab("signin")}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === "signin"
                  ? "bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === "signup"
                  ? "bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSignIn}
                className="space-y-4 text-left"
              >
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="glass w-full pl-11 pr-4 py-3 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="glass w-full pl-11 pr-4 py-3 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>

                <NeonButton type="submit" disabled={loading} className="w-full justify-center py-3">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                </NeonButton>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSignUp}
                className="space-y-4 text-left"
              >
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="glass w-full pl-11 pr-4 py-3 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="glass w-full pl-11 pr-4 py-3 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="glass w-full pl-11 pr-4 py-3 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="glass w-full pl-11 pr-4 py-3 rounded-xl text-xs border border-white/5 outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>

                <NeonButton type="submit" disabled={loading} className="w-full justify-center py-3">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign Up <ArrowRight className="h-4 w-4" /></>}
                </NeonButton>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-widest">or continue with</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Google Login Trigger */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="glass flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-white/8 hover:bg-white/5 transition-all text-xs font-semibold hover:border-[#8B5CF6]/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] disabled:opacity-50"
          >
            {/* Google G logo SVG */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground justify-center">
          <ShieldCheck className="h-4 w-4 text-[#8B5CF6]" />
          <span>Integrated with CineGlass single sign-on security node.</span>
        </div>
      </main>
    </div>
  );
}
