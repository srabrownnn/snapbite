'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  UtensilsCrossed,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Loader2,
} from "lucide-react";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("owner@snapbite.com");
    setPassword("admin");
    setError("");
    setIsSubmitting(true);

    const res = await login("owner@snapbite.com", "admin");
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || "Demo login failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-500 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-600/30">
              SB
            </div>
            <span className="font-black text-2xl tracking-tight text-white">SnapBite</span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight pt-2">
            Restaurant Owner Login
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Access your live kitchen display, digital menu, QR tables, and bKash payments.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@your-restaurant.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Button */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Demo Owner Login</span>
            </button>
          </div>

          {/* Sign Up Redirect Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              New restaurant owner?{" "}
              <Link
                href="/signup"
                className="font-extrabold text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors ml-1"
              >
                Register Your Restaurant
              </Link>
            </p>
          </div>
        </div>

        {/* Home Navigation */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      }
    >
      <LoginInner />
    </React.Suspense>
  );
}
