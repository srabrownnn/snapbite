'use client';

import React, { useState, useEffect } from "react";
import { MenuItem, Restaurant, Table, AddOn, Order, PaymentMethod } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Store,
  CreditCard,
  ShieldCheck,
  Check,
  Flame,
  Clock,
  Send,
  Loader2,
} from "lucide-react";

interface DirectOrderModalProps {
  item: MenuItem | null;
  restaurant: Restaurant;
  table: Table;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function DirectOrderModal({
  item,
  restaurant,
  table,
  isOpen,
  onClose,
  onOrderPlaced,
}: DirectOrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    restaurant.bkash_pgw_enabled !== false ? "bkash" : "cash"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddons([]);
      setSpecialInstructions("");
      setErrorMessage("");
      setIsSubmitting(false);

      // Restore saved customer info from localStorage if available
      if (typeof window !== "undefined") {
        const savedName = localStorage.getItem("snapbite_guest_name") || "";
        const savedPhone = localStorage.getItem("snapbite_guest_phone") || "";
        if (savedName) setCustomerName(savedName);
        if (savedPhone) setCustomerPhone(savedPhone);
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const toggleAddon = (addon: AddOn) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) return prev.filter((a) => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.price + addonsTotal;
  const subtotal = unitPrice * quantity;
  const tax = Number(((subtotal * (restaurant.tax_percentage || 0)) / 100).toFixed(2));
  const serviceCharge = Number(
    ((subtotal * (restaurant.service_charge_percentage || 0)) / 100).toFixed(2)
  );
  const total = Number((subtotal + tax + serviceCharge).toFixed(2));

  const handlePlaceDirectOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    // Persist customer info for next orders
    if (typeof window !== "undefined") {
      if (customerName) localStorage.setItem("snapbite_guest_name", customerName);
      if (customerPhone) localStorage.setItem("snapbite_guest_phone", customerPhone);
    }

    const cartItemPayload = [
      {
        cartItemId: `direct_${Date.now()}`,
        menuItem: item,
        quantity,
        selectedAddons,
        specialInstructions,
        unitPrice,
        lineTotal: subtotal,
      },
    ];

    try {
      if (paymentMethod === "bkash") {
        // 1. INITIATE BKASH PAYMENT GATEWAY
        const res = await fetch("/api/bkash/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: restaurant.id,
            tableId: table.id,
            customerName: customerName.trim() || "Table Guest",
            customerPhone: customerPhone.trim(),
            customerNote: specialInstructions.trim(),
            cartItems: cartItemPayload,
            payerReference: customerPhone.trim() || table.table_number,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.bkashURL) {
          onClose();
          // Redirect immediately to bKash Payment Gateway URL
          window.location.href = data.bkashURL;
          return;
        } else {
          setErrorMessage(data.error || "Failed to launch bKash Payment Gateway.");
          setIsSubmitting(false);
          return;
        }
      } else {
        // 2. IN-PERSON CASH ORDER (SEND DIRECTLY TO KITCHEN)
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: restaurant.id,
            tableId: table.id,
            customerName: customerName.trim() || "Table Guest",
            customerPhone: customerPhone.trim(),
            customerNote: specialInstructions.trim(),
            paymentMethod: "cash",
            cartItems: cartItemPayload,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.order) {
          onOrderPlaced(data.order);
          onClose();
        } else {
          setErrorMessage(data.error || "Failed to place order.");
        }
      }
    } catch (err: any) {
      setErrorMessage("Network error placing order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-orange-50 via-pink-50/50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Direct Order • {table.table_number}
              </h2>
              <p className="text-[11px] text-orange-700 font-semibold">
                Instant kitchen order placement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* Selected Item Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xl shrink-0">
                🍔
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                {item.name}
              </h3>
              <p className="text-xs text-orange-600 font-extrabold mt-0.5">
                {formatCurrency(unitPrice, restaurant.currency)} each
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.preparation_time} min prep
                </span>
                {item.calories && (
                  <span>• {item.calories} kcal</span>
                )}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-1 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-xs text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 rounded-md text-slate-600 hover:bg-slate-100"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add-ons Section (if available) */}
          {item.add_ons && item.add_ons.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Customize with Add-ons
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.add_ons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-orange-50 border-orange-400 font-bold text-orange-950"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            isSelected ? "bg-orange-600 text-white" : "border border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-slate-500 font-semibold">
                        +{formatCurrency(addon.price, restaurant.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Kitchen Instructions */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Kitchen Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, dressing on side, no ice..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
            />
          </div>

          {/* Diner Information */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 017XXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payment Method
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* bKash Payment Gateway Option */}
              {restaurant.bkash_pgw_enabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bkash")}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    paymentMethod === "bkash"
                      ? "border-[#E2136E] bg-pink-50 ring-2 ring-[#E2136E]/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E2136E] text-white flex items-center justify-center font-black text-sm shrink-0">
                    ৳
                  </div>
                  <div>
                    <div className="text-xs font-black text-pink-900 leading-tight">
                      bKash Payment Gateway
                    </div>
                    <div className="text-[10px] text-pink-700 mt-0.5">
                      Instant online payment via bKash PGW
                    </div>
                  </div>
                </button>
              )}

              {/* In-Person Cash Option */}
              {restaurant.cash_enabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    paymentMethod === "cash"
                      ? "border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 leading-tight">
                      In-Person (Cash)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Pay at counter or to your waiter
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Pricing & Bill Summary */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Item Subtotal ({quantity}x)</span>
              <span>{formatCurrency(subtotal, restaurant.currency)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax ({restaurant.tax_percentage}%)</span>
                <span>{formatCurrency(tax, restaurant.currency)}</span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Service Charge ({restaurant.service_charge_percentage}%)</span>
                <span>{formatCurrency(serviceCharge, restaurant.currency)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Total Payable:</span>
              <span className="text-orange-600 text-base">
                {formatCurrency(total, restaurant.currency)}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>

        {/* Bottom CTA Action Button */}
        <div className="p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md">
          <button
            type="button"
            onClick={handlePlaceDirectOrder}
            disabled={isSubmitting || !item.is_available}
            className={`w-full py-3.5 px-4 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${
              paymentMethod === "bkash"
                ? "bg-[#E2136E] hover:bg-pink-700 shadow-pink-600/30"
                : "bg-orange-600 hover:bg-orange-700 shadow-orange-600/30"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {paymentMethod === "bkash"
                    ? "Connecting to bKash Gateway..."
                    : "Sending to Kitchen..."}
                </span>
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>
                  {paymentMethod === "bkash"
                    ? `Pay with bKash • ${formatCurrency(total, restaurant.currency)}`
                    : `Direct Place Order • ${formatCurrency(total, restaurant.currency)}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
