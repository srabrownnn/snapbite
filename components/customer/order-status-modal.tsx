'use client';

import React from "react";
import { Order, Restaurant, OrderStatus } from "@/types/database";
import { formatCurrency, formatTime } from "@/lib/utils";
import { CheckCircle2, Clock, Utensils, Bell, Receipt, Check, X, Star } from "lucide-react";

interface OrderStatusModalProps {
  order: Order | null;
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onRequestBill: () => void;
  onCallWaiter: () => void;
  onLeaveReview: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "pending", label: "Order Received", desc: "Sent to kitchen staff" },
  { status: "accepted", label: "Accepted", desc: "Kitchen acknowledged order" },
  { status: "preparing", label: "Preparing", desc: "Chef is crafting your meal" },
  { status: "ready", label: "Ready", desc: "Hot & ready to be served" },
  { status: "served", label: "Served", desc: "Delivered to your table" },
];

export function OrderStatusModal({
  order,
  restaurant,
  isOpen,
  onClose,
  onRequestBill,
  onCallWaiter,
  onLeaveReview,
}: OrderStatusModalProps) {
  if (!isOpen || !order) return null;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order.status);
  const isCompleted = order.status === "completed" || order.status === "served";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Order Tracking</h2>
              <p className="text-xs text-slate-500">
                Order {order.order_number} • {formatTime(order.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
          {/* Status Hero Card */}
          <div className={`p-5 rounded-2xl border text-center transition-all ${
            order.status === "ready"
              ? "bg-amber-500/10 border-amber-300 ring-4 ring-amber-400/20"
              : isCompleted
              ? "bg-emerald-50 border-emerald-300"
              : isCancelled
              ? "bg-red-50 border-red-300"
              : "bg-orange-50 border-orange-200"
          }`}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md mb-2">
              {order.status === "ready" ? (
                <Bell className="w-7 h-7 text-amber-600 animate-bounce" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              ) : isCancelled ? (
                <X className="w-7 h-7 text-red-600" />
              ) : (
                <Clock className="w-7 h-7 text-orange-600 animate-spin" />
              )}
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              {order.status === "ready"
                ? "🔔 Your Order is Ready!"
                : order.status === "preparing"
                ? "Chef is Preparing Your Food"
                : order.status === "accepted"
                ? "Order Accepted by Kitchen"
                : isCompleted
                ? "Order Completed & Served"
                : isCancelled
                ? "Order Cancelled"
                : "Order Received by Kitchen"}
            </h3>

            <p className="text-xs text-slate-600 mt-1">
              Table: <strong>{order.table?.table_number || "Your Table"}</strong> • Est. Prep:{" "}
              <strong>{order.estimated_prep_time || 15}–20 mins</strong>
            </p>
          </div>

          {/* Stepper Timeline */}
          {!isCancelled && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Real-time Status Progress
              </h4>

              <div className="space-y-4 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex > idx || isCompleted;
                  const isCurrent = currentStepIndex === idx && !isCompleted;

                  return (
                    <div key={step.status} className="flex items-start gap-3 relative">
                      {/* Connecting Line */}
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`absolute left-[13px] top-6 bottom-[-16px] w-0.5 transition-colors ${
                            isDone ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                      )}

                      {/* Step Dot */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all z-10 ${
                          isDone
                            ? "bg-emerald-500 text-white shadow-sm"
                            : isCurrent
                            ? "bg-orange-600 text-white ring-4 ring-orange-200 shadow-md animate-pulse"
                            : "bg-white text-slate-400 border-2 border-slate-300"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <div className="pt-0.5">
                        <div className={`text-sm font-bold ${isCurrent ? "text-orange-700" : isDone ? "text-slate-900" : "text-slate-400"}`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-slate-500">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items Summary */}
          {order.items && order.items.length > 0 && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Items in this Order
              </h4>

              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.quantity}x </span>
                      <span className="text-slate-700">{item.item_name_snapshot}</span>
                      {item.customer_note && (
                        <div className="text-[11px] text-amber-700 italic">“{item.customer_note}”</div>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(item.subtotal, restaurant.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total</span>
                <span className="text-orange-600">{formatCurrency(order.total, restaurant.currency)}</span>
              </div>
            </div>
          )}

          {/* If completed, prompt for review */}
          {isCompleted && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-center">
              <h4 className="font-extrabold text-amber-950 text-sm">How was your dining experience?</h4>
              <p className="text-xs text-amber-800 mt-1">Leave a quick review for the chefs and service.</p>
              <button
                onClick={() => {
                  onClose();
                  onLeaveReview();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                Write Review
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
          <button
            onClick={onCallWaiter}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Call Waiter</span>
          </button>

          <button
            onClick={onRequestBill}
            className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Request Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
