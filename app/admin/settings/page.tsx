'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Restaurant } from "@/types/database";
import { Building2, Save, CheckCircle2, RotateCcw, Wallet, Smartphone, ShieldCheck, Check, Copy, ListOrdered } from "lucide-react";

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
    bkashNumber: "01712345678",
    bkashType: "merchant" as "merchant" | "personal",
    bkashInstructions: "Make Payment or Send Money to our bKash number with your Table Number as reference. Then enter the Transaction ID (TrxID) below.",
    bkashEnabled: true,
    bkashMode: "sandbox" as "sandbox" | "live",
    bkashAppKey: "",
    bkashAppSecret: "",
    bkashUsername: "",
    bkashPassword: "",
    bkashPgwEnabled: true,
    cashEnabled: true,
    orderTrackingEnabled: true,
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
      bkashNumber: current.bkash_number || "01712345678",
      bkashType: (current.bkash_type as "merchant" | "personal") || "merchant",
      bkashInstructions:
        current.bkash_instructions ||
        "Make Payment or Send Money to our bKash number with your Table Number as reference. Then enter the Transaction ID (TrxID) below.",
      bkashEnabled: current.bkash_enabled !== false,
      bkashMode: (current.bkash_mode as "sandbox" | "live") || "sandbox",
      bkashAppKey: current.bkash_app_key || "",
      bkashAppSecret: current.bkash_app_secret || "",
      bkashUsername: current.bkash_username || "",
      bkashPassword: current.bkash_password || "",
      bkashPgwEnabled: current.bkash_pgw_enabled !== false,
      cashEnabled: current.cash_enabled !== false,
      orderTrackingEnabled: current.order_tracking_enabled !== false,
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
      bkash_number: form.bkashNumber.trim(),
      bkash_type: form.bkashType,
      bkash_instructions: form.bkashInstructions.trim(),
      bkash_enabled: form.bkashEnabled,
      bkash_mode: form.bkashMode,
      bkash_app_key: form.bkashAppKey.trim(),
      bkash_app_secret: form.bkashAppSecret.trim(),
      bkash_username: form.bkashUsername.trim(),
      bkash_password: form.bkashPassword.trim(),
      bkash_pgw_enabled: form.bkashPgwEnabled,
      cash_enabled: form.cashEnabled,
      order_tracking_enabled: form.orderTrackingEnabled,
    });

    setRestaurant(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetStore = () => {
    if (confirm("Reset store data back to clean factory state? All orders and active requests will be cleared.")) {
      SnapBiteStore.resetStoreData();
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
            onClick={handleResetStore}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Store Data</span>
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

          {/* Customer Order Tracking & Workflow Simplification */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-orange-600" />
                <span>Customer Order Status Stepper</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                Customer UI Experience
              </span>
            </div>

            {/* Option Control Toggle */}
            <div
              onClick={() => setForm({ ...form, orderTrackingEnabled: !form.orderTrackingEnabled })}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                form.orderTrackingEnabled
                  ? "bg-gradient-to-r from-orange-50/50 via-slate-50 to-amber-50/40 border-orange-300 ring-2 ring-orange-500/10"
                  : "bg-gradient-to-r from-emerald-50/60 via-slate-50 to-teal-50/40 border-emerald-300 ring-2 ring-emerald-500/10 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-black text-slate-900">
                      Customer 5-Step Order Progress (Received, Accepted, Preparing, Ready, Served)
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        form.orderTrackingEnabled
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {form.orderTrackingEnabled ? "5 Stages Active" : "Simplified Confirmation Mode"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {form.orderTrackingEnabled ? (
                      <>
                        Customers view a live multi-step status stepper:{" "}
                        <strong>Order Received ➔ Accepted ➔ Preparing ➔ Ready ➔ Served</strong>. The kitchen operates in fast 1-click fulfillment.
                      </>
                    ) : (
                      <>
                        <strong>Simplified Interface Active:</strong> Removes the 5-stage timeline from the customer screen. Diners receive a clean, instant confirmation with direct access to their printable bill and staff calls.
                      </>
                    )}
                  </p>

                  {/* Visual Workflow Preview */}
                  <div className="pt-1.5">
                    {form.orderTrackingEnabled ? (
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold text-slate-600 bg-white/80 p-2.5 rounded-xl border border-orange-200/80">
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">1. Received</span>
                        <span>➔</span>
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">2. Accepted</span>
                        <span>➔</span>
                        <span className="px-2 py-1 rounded bg-orange-100 text-orange-800">3. Preparing</span>
                        <span>➔</span>
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800">4. Ready</span>
                        <span>➔</span>
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">5. Served</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-900 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                        <span>Frictionless Order Confirmation with Direct Bill Access</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Switch Toggle Button */}
                <div className="shrink-0 pt-1">
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      form.orderTrackingEnabled ? "bg-orange-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        form.orderTrackingEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateways & bKash Setup */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-pink-600" />
                <span>Payment Gateways & bKash Setup</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                Configure In-Person & Online bKash options
              </span>
            </div>

            {/* Payment Method Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash / In-Person Toggle */}
              <div
                onClick={() => setForm({ ...form, cashEnabled: !form.cashEnabled })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  form.cashEnabled
                    ? "bg-slate-50/80 border-slate-300 ring-2 ring-slate-900/5"
                    : "bg-white border-slate-200 opacity-60"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">In-Person Payment (Cash)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      Counter / Waiter
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Allows guests to pay in cash or physical card directly to the server or cashier.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    form.cashEnabled ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {form.cashEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* bKash Payment Toggle */}
              <div
                onClick={() => setForm({ ...form, bkashEnabled: !form.bkashEnabled })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  form.bkashEnabled
                    ? "bg-pink-50/50 border-pink-300 ring-2 ring-pink-500/10"
                    : "bg-white border-slate-200 opacity-60"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-pink-700">bKash Online Payment</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E2136E] text-white">
                      bKash
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Allows diners to pay directly via bKash App or USSD (*247#) and enter TrxID.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    form.bkashEnabled ? "bg-[#E2136E] border-[#E2136E] text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {form.bkashEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* bKash Configuration Settings */}
            {form.bkashEnabled && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/60 via-slate-50 to-orange-50/30 border border-pink-200/80 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#E2136E]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    bKash Account Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      bKash Mobile Number <span className="text-pink-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={form.bkashNumber}
                        onChange={(e) => setForm({ ...form, bkashNumber: e.target.value })}
                        placeholder="e.g. 01712345678"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Customers will copy or send money to this number from their bKash app.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      bKash Account Type <span className="text-pink-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, bkashType: "merchant" })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          form.bkashType === "merchant"
                            ? "bg-[#E2136E] text-white border-[#E2136E] shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Merchant (Payment)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, bkashType: "personal" })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          form.bkashType === "personal"
                            ? "bg-[#E2136E] text-white border-[#E2136E] shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Personal (Send Money)
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {form.bkashType === "merchant"
                        ? "Customers will use the 'Make Payment' menu in bKash."
                        : "Customers will use the 'Send Money' menu in bKash."}
                    </p>
                  </div>

                  {/* bKash Payment Gateway Credentials */}
                  <div className="sm:col-span-2 pt-3 border-t border-pink-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-black uppercase text-slate-800">
                          bKash Payment Gateway (PGW) API Configuration
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Enables instant direct online checkout via official bKash Tokenized Checkout API
                        </p>
                      </div>

                      {/* Mode Switcher */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-pink-200">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, bkashMode: "sandbox" })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            form.bkashMode === "sandbox"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Sandbox (Test)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, bkashMode: "live" })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            form.bkashMode === "live"
                              ? "bg-[#E2136E] text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Live Production
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">bKash App Key</label>
                        <input
                          type="text"
                          value={form.bkashAppKey}
                          onChange={(e) => setForm({ ...form, bkashAppKey: e.target.value })}
                          placeholder="e.g. 4f6xxxxxxxxx"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-pink-500/30"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">bKash App Secret</label>
                        <input
                          type="password"
                          value={form.bkashAppSecret}
                          onChange={(e) => setForm({ ...form, bkashAppSecret: e.target.value })}
                          placeholder="••••••••••••••••••••"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-pink-500/30"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">bKash Merchant Username</label>
                        <input
                          type="text"
                          value={form.bkashUsername}
                          onChange={(e) => setForm({ ...form, bkashUsername: e.target.value })}
                          placeholder="e.g. sandboxTokenizedUser02"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-pink-500/30"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">bKash Merchant Password</label>
                        <input
                          type="password"
                          value={form.bkashPassword}
                          onChange={(e) => setForm({ ...form, bkashPassword: e.target.value })}
                          placeholder="••••••••••••••••••••"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-pink-500/30"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 bg-white/80 p-2 rounded-lg border border-pink-100">
                      💡 <strong>Note:</strong> In Sandbox mode, diners will experience the official bKash checkout simulation without charging a live bank account. In Live mode with valid credentials, transactions route directly to bKash servers.
                    </p>
                  </div>
                </div>

                {/* Live Customer Preview */}
                <div className="pt-2 border-t border-pink-100">
                  <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Customer Checkout Preview:</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-pink-200 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E2136E] text-white flex items-center justify-center font-black text-xs shrink-0">
                        ৳
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>{form.bkashNumber || "01XXXXXXXXX"}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-pink-100 text-[#E2136E]">
                            {form.bkashType === "merchant" ? "Merchant (Payment)" : "Personal (Send Money)"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {form.bkashInstructions || "Enter Table number as reference and paste TrxID"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200 shrink-0">
                      Copy Number
                    </span>
                  </div>
                </div>
              </div>
            )}
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
