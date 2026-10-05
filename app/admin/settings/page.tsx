'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Restaurant } from "@/types/database";
import { Building2, Save, CheckCircle2, RotateCcw } from "lucide-react";

export default function AdminSettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant());
  const [isSaved, setIsSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    coverImageUrl: "",
    description: "",
    address: "",
    phone: "",
    currency: "৳",
    taxPercentage: 5,
    serviceChargePercentage: 0,
    openingTime: "11:00 AM",
    closingTime: "11:30 PM",
  });

  useEffect(() => {
    const current = SnapBiteStore.getRestaurant();
    setRestaurant(current);
    setForm({
      name: current.name,
      slug: current.slug,
      logoUrl: current.logo_url || "",
      coverImageUrl: current.cover_image_url || "",
      description: current.description || "",
      address: current.address || "",
      phone: current.phone || "",
      currency: current.currency,
      taxPercentage: current.tax_percentage,
      serviceChargePercentage: current.service_charge_percentage,
      openingTime: current.opening_time,
      closingTime: current.closing_time,
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = SnapBiteStore.updateRestaurant({
      id: restaurant.id,
      name: form.name.trim(),
      slug: form.slug.trim(),
      logo_url: form.logoUrl.trim(),
      cover_image_url: form.coverImageUrl.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      currency: form.currency.trim(),
      tax_percentage: Number(form.taxPercentage),
      service_charge_percentage: Number(form.serviceChargePercentage),
      opening_time: form.openingTime.trim(),
      closing_time: form.closingTime.trim(),
    });

    setRestaurant(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDemo = () => {
    if (confirm("Reset demo data back to factory initial state? All custom orders and changes will be restored to seed data.")) {
      SnapBiteStore.resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Restaurant Settings & Branding
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Customize restaurant branding, currency symbol, taxes, service charges, and hours.
            </p>
          </div>

          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Store</span>
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* Brand Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>Brand Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Restaurant / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  URL Slug (Unique Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Logo Image URL</label>
                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cover Banner URL</label>
                <input
                  type="url"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Tagline / Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing, Currency & Taxes */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <span>Financial & Billing Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  placeholder="e.g. ৳, $, €, £"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tax Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.taxPercentage}
                  onChange={(e) => setForm({ ...form, taxPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Charge (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.serviceChargePercentage}
                  onChange={(e) =>
                    setForm({ ...form, serviceChargePercentage: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location & Operating Hours */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <span>Location & Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Hotline</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Opening Time</label>
                <input
                  type="text"
                  value={form.openingTime}
                  onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                  placeholder="11:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Closing Time</label>
                <input
                  type="text"
                  value={form.closingTime}
                  onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                  placeholder="11:30 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved Successfully!</span>
              </span>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
