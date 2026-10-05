'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { generateTableQrDataUrl } from "@/lib/qr/generator";
import {
  QrCode,
  ChefHat,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  Utensils,
  Bell,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const [demoQrUrl, setDemoQrUrl] = useState<string>("");
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin;
      setOrigin(currentOrigin);
      const targetUrl = `${currentOrigin}/r/demo-restaurant/t/tbl_tok_12_snap`;
      generateTableQrDataUrl(targetUrl, { width: 320 }).then(setDemoQrUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-orange-600/30">
              SB
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">SnapBite</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black border border-orange-500/30">
                SaaS v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/kitchen"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors hidden sm:inline-flex"
            >
              Kitchen Display
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95"
            >
              Staff Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Product Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Production-Ready Restaurant QR Ordering & KDS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Tabletop QR Ordering, <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Instantly Sent to Kitchen.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Customers scan the QR code on Table 12 to browse photo menus, customize add-ons, and place orders. Kitchen screens receive orders in real-time with countdown timers and audio bells.
            </p>

            {/* Quick Portals CTA */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href="/r/demo-restaurant/t/tbl_tok_12_snap"
                className="px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-orange-600/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Customer Mobile Menu (Table 12)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/kitchen"
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-800 flex items-center gap-2 transition-all"
              >
                <ChefHat className="w-4 h-4 text-orange-400" />
                <span>Kitchen KDS</span>
              </Link>

              <Link
                href="/admin"
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-800 flex items-center gap-2 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-orange-400" />
                <span>Admin Dashboard</span>
              </Link>
            </div>

            {/* Key feature bullets */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero app download required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time audio chime alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Table token tamper-proof</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Server-side price verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-tenant SaaS support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>bKash / Cash / Card abstraction</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Table Card Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative bg-white text-slate-900 p-8 rounded-3xl shadow-2xl border-4 border-orange-500/30 max-w-sm w-full text-center">
              <div className="w-14 h-14 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
                🍽️
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">SnapBite Gourmet Bistro</h3>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3">
                Digital Menu & Tabletop Ordering
              </p>

              <div className="inline-block bg-orange-100 text-orange-800 border border-orange-300 font-black text-base px-4 py-1 rounded-full mb-4 shadow-sm">
                Table 12
              </div>

              {/* QR Image */}
              <div className="p-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl inline-block mb-4 shadow-inner">
                {demoQrUrl ? (
                  <img
                    src={demoQrUrl}
                    alt="Scan with phone"
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                    Generating Table QR...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center justify-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-orange-600" />
                  <span>Scan with Phone Camera</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Or click below to open Table 12 in your browser right now:
                </p>
              </div>

              <Link
                href="/r/demo-restaurant/t/tbl_tok_12_snap"
                className="mt-4 block w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Open Table 12 Menu Directly →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>© 2026 SnapBite SaaS. Engineered for Next.js, Supabase, and Tailwind CSS.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-slate-300">
              Admin Overview
            </Link>
            <Link href="/kitchen" className="hover:text-slate-300">
              Kitchen Display
            </Link>
            <Link href="/super-admin" className="hover:text-slate-300">
              Super Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
