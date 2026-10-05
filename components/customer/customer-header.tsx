'use client';

import React from "react";
import { Restaurant, Table } from "@/types/database";
import { ShoppingBag, Bell, Search, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";

interface CustomerHeaderProps {
  restaurant: Restaurant;
  table: Table;
  onOpenCart: () => void;
  onOpenWaiterCall: () => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenActiveOrder?: () => void;
  activeOrderCount?: number;
}

export function CustomerHeader({
  restaurant,
  table,
  onOpenCart,
  onOpenWaiterCall,
  onToggleSearch,
  isSearchOpen,
  searchQuery,
  setSearchQuery,
  onOpenActiveOrder,
  activeOrderCount = 0,
}: CustomerHeaderProps) {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Restaurant Logo & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-9 h-9 rounded-full object-cover border border-orange-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 truncate leading-tight">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                {table.table_number}
              </span>
              {activeOrderCount > 0 && (
                <button
                  onClick={onOpenActiveOrder}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 animate-pulse"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search Toggle */}
          <button
            onClick={onToggleSearch}
            aria-label="Search food"
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Waiter Call Button */}
          <button
            onClick={onOpenWaiterCall}
            aria-label="Call waiter or request bill"
            className="p-2 rounded-full text-amber-600 hover:bg-amber-50 active:scale-95 transition-all relative"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="View Cart"
            className="relative p-2 rounded-full bg-orange-600 text-white shadow-sm hover:bg-orange-700 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white animate-scale">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="px-4 pb-3 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, burgers, pasta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-8 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-slate-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
