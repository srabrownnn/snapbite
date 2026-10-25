'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from restaurant name unless edited manually
  useEffect(() => {
    if (!isSlugManuallyEdited) {
      const generated = restaurantName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  }, [restaurantName, isSlugManuallyEdited]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!restaurantName.trim()) {
      setError("Please enter your restaurant name.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setIsSubmitting(true);

    const res = await signup({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      restaurantName: restaurantName.trim(),
      phone: phone.trim(),
      slug: slug.trim(),
    });

    if (res.success) {
      router.push("/admin");
    } else {
      setError(res.error || "Failed to create restaurant account.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-500 selection:text-white">
      {/* Radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-600/30">
              SB
            </div>
            <span className="font-black text-2xl tracking-tight text-white">SnapBite</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-2">
            Register Your Restaurant
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Get your own isolated restaurant account with tabletop QR codes, instant kitchen ordering & bKash gateway.
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Restaurant Profile Section */}
            <div className="space-y-3 pb-3 border-b border-slate-800/80">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Restaurant Information</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Restaurant / Business Name <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. Sultan's Dine, Chillox Burgers"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Custom URL Slug <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setIsSlugManuallyEdited(true);
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, "")
                        );
                      }}
                      placeholder="e.g. sultans-dine"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    URL: /r/{slug || "your-restaurant"}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Hotline / bKash Mobile
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Account Details */}
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Owner Login Credentials</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Full Name <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Asif Rahman"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@restaurant.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={4}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-mono"
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
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Setting up your restaurant...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Register & Launch Restaurant</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-extrabold text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors ml-1"
              >
                Sign In
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
