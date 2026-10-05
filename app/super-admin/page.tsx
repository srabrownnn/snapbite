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
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRestName, setNewRestName] = useState("");
  const [newRestSlug, setNewRestSlug] = useState("");
  const [newRestCurrency, setNewRestCurrency] = useState("৳");

  const loadData = () => {
    setRestaurants(SnapBiteStore.getAllRestaurants());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("snapbite_store_updated", loadData);
    return () => window.removeEventListener("snapbite_store_updated", loadData);
  }, []);

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
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black border border-red-500/30">
                  ROOT ACCESS
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

            <Link
              href="/admin"
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-colors"
            >
              Back to Restaurant Admin
            </Link>
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
            <span className="text-xs font-bold text-slate-400 uppercase">SaaS Platform MRR</span>
            <div className="text-2xl font-black text-white mt-1">৳48,500 / mo</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">+22% month-over-month</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase">Total QR Orders</span>
            <div className="text-2xl font-black text-white mt-1">1,248</div>
            <div className="text-[11px] text-orange-400 font-semibold mt-1">Processed without app install</div>
          </div>
        </div>

        {/* Restaurants Directory */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">Registered Restaurants</h3>
            <span className="text-xs text-slate-400">{restaurants.length} total businesses</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {rest.logo_url ? (
                    <img
                      src={rest.logo_url}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black shrink-0">
                      SB
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-base truncate">{rest.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          rest.is_active
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {rest.is_active ? "Active" : "Suspended"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Slug: <code className="text-orange-400">/r/{rest.slug}</code></span>
                      <span>•</span>
                      <span>Currency: {rest.currency}</span>
                      <span>•</span>
                      <span>Tax: {rest.tax_percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href={`/r/${rest.slug}/t/tbl_tok_01_snap`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>View Menu</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(rest)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                      rest.is_active
                        ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {rest.is_active ? "Suspend Tenant" : "Reactivate Tenant"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Provision Restaurant */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white">Provision New Restaurant Tenant</h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={newRestName}
                    onChange={(e) => {
                      setNewRestName(e.target.value);
                      if (!newRestSlug) {
                        setNewRestSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                        );
                      }
                    }}
                    placeholder="e.g. Bella Italia Bistro"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500/40 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">URL Identifier (Slug)</label>
                  <input
                    type="text"
                    required
                    value={newRestSlug}
                    onChange={(e) => setNewRestSlug(e.target.value)}
                    placeholder="e.g. bella-italia"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-orange-400 font-mono focus:ring-2 focus:ring-orange-500/40 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    required
                    value={newRestCurrency}
                    onChange={(e) => setNewRestCurrency(e.target.value)}
                    placeholder="e.g. ৳, $, €"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500/40 outline-none font-bold"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-600/30"
                  >
                    Provision Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
