'use client';

import React from "react";
import { Order } from "@/types/database";
import { Bell, X, Eye } from "lucide-react";

interface ReadyNotificationBannerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOrder: () => void;
}

export function ReadyNotificationBanner({
  order,
  isOpen,
  onClose,
  onViewOrder,
}: ReadyNotificationBannerProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-bounce-subtle">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-4 shadow-2xl border-2 border-white/30 flex items-start gap-3 backdrop-blur-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-white animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">
              🔔 Instant Alert
            </span>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-extrabold leading-snug mt-0.5">
            YOUR ORDER IS READY!
          </h3>

          <p className="text-xs text-white/90 mt-1">
            Order <strong>{order.order_number}</strong> is prepared. Please collect your order or your server will bring it to your table.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewOrder();
              }}
              className="px-3.5 py-1.5 bg-white text-orange-700 font-bold text-xs rounded-xl shadow-sm hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Order Details</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white font-medium text-xs rounded-xl transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
