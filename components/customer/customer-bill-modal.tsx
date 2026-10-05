'use client';

import React from "react";
import { Order, Restaurant } from "@/types/database";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { printThermalReceipt } from "@/lib/receipt/printer";
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  Clock,
  Share2,
  Bell,
  UtensilsCrossed,
} from "lucide-react";

interface CustomerBillModalProps {
  order: Order | null;
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onRequestWaiterBill?: () => void;
}

export function CustomerBillModal({
  order,
  restaurant,
  isOpen,
  onClose,
  onRequestWaiterBill,
}: CustomerBillModalProps) {
  if (!isOpen) return null;

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="fixed inset-0" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl z-10 animate-scale">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">No Active Bill Yet</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            You haven't placed an order yet for this table. Once you add items to your cart and place an order, your itemized bill and receipt copy will appear here!
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    printThermalReceipt(order, restaurant);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `${restaurant.name} - Bill ${order.order_number}`,
        text: `Dining bill for ${order.table?.table_number || "Table"} at ${restaurant.name}. Total: ${formatCurrency(order.total, restaurant.currency)}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${restaurant.name} Bill ${order.order_number}\nTable: ${order.table?.table_number}\nTotal: ${formatCurrency(order.total, restaurant.currency)}`
      );
      alert("Bill summary copied to clipboard!");
    }
  };

  const isPaid = order.payment_status === "paid";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity p-2 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up z-10">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Customer Dining Bill</h3>
              <p className="text-[11px] text-slate-500">Order {order.order_number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 bg-slate-100">
          {/* Authentic Receipt Paper Design */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4 font-mono text-xs text-slate-800">
            {/* Restaurant Heading */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              {restaurant.logo_url && (
                <img
                  src={restaurant.logo_url}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border border-slate-200"
                />
              )}
              <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 font-sans">
                {restaurant.name}
              </h4>
              {restaurant.address && (
                <p className="text-[11px] text-slate-500 mt-0.5 font-sans leading-tight">
                  {restaurant.address}
                </p>
              )}
              {restaurant.phone && (
                <p className="text-[11px] text-slate-500 font-sans">Tel: {restaurant.phone}</p>
              )}
            </div>

            {/* Receipt Meta */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span>ORDER: {order.order_number}</span>
                <span className="font-bold text-orange-700 font-sans">
                  {order.table?.table_number || "Table N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>DATE: {formatDateTime(order.created_at)}</span>
              </div>
              {order.customer_name && (
                <div className="flex justify-between">
                  <span>GUEST: {order.customer_name}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span>PAYMENT STATUS:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-sans ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold text-[11px] text-slate-500 border-b border-slate-200 pb-1 font-sans">
                <span>QTY / ITEM</span>
                <span>AMOUNT</span>
              </div>

              {(order.items || []).map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold pr-2">
                      {item.quantity}x {item.item_name_snapshot}
                    </span>
                    <span className="font-bold shrink-0">
                      {formatCurrency(item.subtotal, restaurant.currency)}
                    </span>
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <div className="text-[10px] text-slate-500 pl-4 space-y-0.5">
                      {item.addons.map((ad, idx) => (
                        <div key={idx}>
                          + {ad.addon_name_snapshot} ({formatCurrency(ad.price, restaurant.currency)})
                        </div>
                      ))}
                    </div>
                  )}
                  {item.customer_note && (
                    <div className="text-[10px] text-amber-700 italic pl-4">
                      “{item.customer_note}”
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal, restaurant.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({restaurant.tax_percentage}%):</span>
                <span>{formatCurrency(order.tax, restaurant.currency)}</span>
              </div>
              {restaurant.service_charge_percentage > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Service Charge ({restaurant.service_charge_percentage}%):</span>
                  <span>{formatCurrency(order.service_charge, restaurant.currency)}</span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-black text-sm text-slate-900 font-sans">
                <span>TOTAL:</span>
                <span className="text-orange-600 text-base">
                  {formatCurrency(order.total, restaurant.currency)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Method:</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
            </div>

            {/* Perforated Receipt Footer */}
            <div className="text-center border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500 font-sans">
              <p>*** THANK YOU FOR YOUR VISIT ***</p>
              <p className="mt-0.5">SnapBite Digital Tabletop Service</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Receipt</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              title="Share Bill"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {onRequestWaiterBill && !isPaid && (
            <button
              onClick={() => {
                onRequestWaiterBill();
                alert("Server notified to bring physical bill and payment machine to your table!");
              }}
              className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-orange-600" />
              <span>Ask Server to Bring Bill to Table</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
