'use client';

import React, { useState, useEffect } from "react";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Restaurant } from "@/types/database";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  Plus,
  Users,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  X,
  ExternalLink,
  Lock,
  KeyRound,
  Loader2,
  LogOut,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [securityKey, setSecurityKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState("");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRestName, setNewRestName] = useState("");
  const [newRestSlug, setNewRestSlug] = useState("");
  const [newRestCurrency, setNewRestCurrency] = useState("৳");

  // Check super-admin session on mount
  useEffect(() => {
    fetch("/api/auth/super-admin")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const loadData = () => {
    setRestaurants(SnapBiteStore.getAllRestaurants());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      window.addEventListener("snapbite_store_updated", loadData);
      return () => window.removeEventListener("snapbite_store_updated", loadData);
    }
  }, [isAuthenticated]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: securityKey }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setSecurityKey("");
      } else {
        setAuthError(data.error || "Access Denied: Invalid Security Key.");
      }
    } catch (e: any) {
      setAuthError("Authentication request failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/super-admin", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName.trim() || !newRestSlug.trim()) return;

    SnapBiteStore.createRestaurant({
      name: newRestName.trim(),
      slug: newRestSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      logo_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&h=200&q=80",
      cover_image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=500&q=80",
      description: "Fine dining & fresh gourmet specialties.",
      address: "Dhaka, Bangladesh",
      phone: "+880 1700 000000",
      currency: newRestCurrency,
      tax_percentage: 5.0,
      service_charge_percentage: 0.0,
      opening_time: "10:00 AM",
      closing_time: "11:00 PM",
      is_active: true,
      bkash_enabled: true,
      bkash_number: "01712345678",
      cash_enabled: true,
      order_tracking_enabled: true,
    });

    setNewRestName("");
    setNewRestSlug("");
    setIsAddOpen(false);
    loadData();
  };

  const handleToggleStatus = (rest: Restaurant) => {
    SnapBiteStore.updateRestaurant({
      id: rest.id,
      is_active: !rest.is_active,
    });
    loadData();
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // 1. LOCKED / PROTECTED GATE VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-orange-500 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/30 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-red-600/20">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight pt-2">
              SaaS Master Console
            </h1>
            <p className="text-xs text-slate-400">
              Restricted Area • Authorized Platform Administrators Only
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 font-semibold animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Master Security Key
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showKey ? "text" : "password"}
                    required
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    placeholder="Enter SaaS master key..."
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Configure via <code>SUPER_ADMIN_KEY</code> in environment variables.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Master Access...</span>
                  </span>
                ) : (
                  <>
                    <span>Unlock Master Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Return to Main Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED SUPER ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  SnapBite SaaS Super Admin
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                  ROOT VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-tenant restaurant provisioning, global analytics & subscription monitoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Provision New Restaurant</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-400 font-bold text-xs rounded-xl border border-slate-800 hover:border-red-800/60 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Global SaaS Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Tenants</span>
            <div className="text-2xl font-black text-white mt-1">{restaurants.length}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">100% cloud uptime</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Subscriptions</span>
            <div className="text-2xl font-black text-white mt-1">
              {restaurants.filter((r) => r.is_active).length}
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Pro & Enterprise tiers</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Tables</span>
            <div className="text-2xl font-black text-white mt-1">
              {restaurants.reduce((acc, r) => acc + SnapBiteStore.getTables(r.id).length, 0)}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">Active QR dining spots</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <div className="text-2xl font-black text-white mt-1">
              {restaurants.reduce((acc, r) => acc + SnapBiteStore.getOrders(r.id).length, 0)}
            </div>
            <div className="text-[11px] text-orange-400 font-semibold mt-1">Processed across tenants</div>
          </div>
        </div>

        {/* Restaurants Management Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Provisioned Restaurant Tenants</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage isolation, tenant statuses, and direct access links.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {restaurants.length} Active Organizations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Restaurant</th>
                  <th className="py-3.5 px-4 font-bold">Slug / Token</th>
                  <th className="py-3.5 px-4 font-bold">Tables</th>
                  <th className="py-3.5 px-4 font-bold">Menu Items</th>
                  <th className="py-3.5 px-4 font-bold">Currency</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {restaurants.map((rest) => {
                  const tablesCount = SnapBiteStore.getTables(rest.id).length;
                  const menuCount = SnapBiteStore.getMenuItems(rest.id).length;

                  return (
                    <tr key={rest.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {rest.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{rest.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {rest.phone || "No phone"}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">{rest.slug}</td>

                      <td className="py-3.5 px-4 font-bold text-slate-200">{tablesCount} Tables</td>

                      <td className="py-3.5 px-4 text-slate-300">{menuCount} Items</td>

                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                        {rest.currency}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            rest.is_active
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {rest.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/r/${rest.slug}/t/tbl_tok_01_snap`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Menu</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(rest)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            rest.is_active
                              ? "bg-red-950/40 text-red-400 hover:bg-red-900/60"
                              : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                          }`}
                        >
                          {rest.is_active ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Provision Restaurant Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-white text-base">Provision New Restaurant Tenant</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={newRestName}
                  onChange={(e) => {
                    setNewRestName(e.target.value);
                    if (!newRestSlug) {
                      setNewRestSlug(
                        e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
                      );
                    }
                  }}
                  placeholder="e.g. Sultan's Dine"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-orange-500/40"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Unique URL Slug</label>
                <input
                  type="text"
                  required
                  value={newRestSlug}
                  onChange={(e) => setNewRestSlug(e.target.value)}
                  placeholder="e.g. sultans-dine"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-orange-500/40 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={newRestCurrency}
                  onChange={(e) => setNewRestCurrency(e.target.value)}
                  placeholder="৳"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-orange-500/40 font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl shadow-md"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
