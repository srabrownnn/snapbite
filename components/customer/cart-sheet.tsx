'use client';

import React, { useState } from "react";
import { Restaurant, Table, PaymentMethod } from "@/types/database";
import { useCart } from "@/lib/store/cart-context";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ArrowLeft, Send, Sparkles, CreditCard, Wallet, Store } from "lucide-react";

interface CartSheetProps {
  restaurant: Restaurant;
  table: Table;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (params: {
    customerName: string;
    customerPhone: string;
    customerNote: string;
    paymentMethod: PaymentMethod;
  }) => void;
  isSubmitting?: boolean;
}

export function CartSheet({
  restaurant,
  table,
  isOpen,
  onClose,
  onSubmitOrder,
  isSubmitting = false,
}: CartSheetProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    taxAmount,
    serviceChargeAmount,
    totalWithTaxes,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  if (!isOpen) return null;

  const tax = taxAmount(restaurant.tax_percentage);
  const serviceCharge = serviceChargeAmount(restaurant.service_charge_percentage);
  const total = totalWithTaxes(restaurant.tax_percentage, restaurant.service_charge_percentage);

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    onSubmitOrder({
      customerName: customerName.trim() || "Table Guest",
      customerPhone: customerPhone.trim(),
      customerNote: orderNote.trim(),
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Your Order Cart</h2>
              <p className="text-xs text-orange-700 font-semibold">
                Placing for <span className="underline">{table.table_number}</span>
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Your cart is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Discover mouth-watering dishes from the menu and add them to order.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Items Card List */}
              <div className="space-y-3">
                {items.map((cartItem) => (
                  <div
                    key={cartItem.cartItemId}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {cartItem.menuItem.name}
                      </h4>

                      {/* Add-ons snapshot */}
                      {cartItem.selectedAddons.length > 0 && (
                        <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                          {cartItem.selectedAddons.map((addon) => (
                            <div key={addon.id} className="flex items-center gap-1">
                              <span className="text-orange-600 font-bold">+</span>
                              <span>{addon.name}</span>
                              <span className="text-slate-400">
                                ({formatCurrency(addon.price, restaurant.currency)})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Special instructions */}
                      {cartItem.specialInstructions && (
                        <p className="text-[11px] italic text-amber-700 bg-amber-50 p-1.5 rounded-md mt-1.5 border border-amber-200/60">
                          “{cartItem.specialInstructions}”
                        </p>
                      )}

                      <div className="text-xs font-bold text-orange-600 mt-1.5">
                        {formatCurrency(cartItem.lineTotal, restaurant.currency)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)}
                        className="p-1 rounded-md text-slate-600 hover:bg-slate-100"
                      >
                        {cartItem.quantity === 1 ? (
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-slate-900">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                        className="p-1 rounded-md text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Details & Special Instructions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Guest & Order Notes
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 017..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Kitchen Note
                  </label>
                  <input
                    type="text"
                    placeholder="Allergies, table preferences..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Payment Method
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === "cash"
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Store className="w-4 h-4 text-orange-600" />
                    <span className="text-[11px] leading-tight">Pay at Counter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === "card"
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-orange-600" />
                    <span className="text-[11px] leading-tight">Pay at Table</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === "online"
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <span className="text-[11px] leading-tight">bKash / Card</span>
                  </button>
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal, restaurant.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({restaurant.tax_percentage}%)</span>
                  <span className="font-semibold">{formatCurrency(tax, restaurant.currency)}</span>
                </div>
                {restaurant.service_charge_percentage > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Service Charge ({restaurant.service_charge_percentage}%)</span>
                    <span className="font-semibold">{formatCurrency(serviceCharge, restaurant.currency)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-orange-600 text-base">{formatCurrency(total, restaurant.currency)}</span>
                </div>
              </div>

              {/* Confirmation Notice */}
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-center">
                <p className="text-xs font-semibold text-orange-900">
                  📢 Your order will be sent to the kitchen for{" "}
                  <strong className="underline">{table.table_number}</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Add More
            </button>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span>Sending to Kitchen...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Place Order • {formatCurrency(total, restaurant.currency)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
