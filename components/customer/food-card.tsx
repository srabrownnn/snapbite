'use client';

import React from "react";
import { MenuItem } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { Star, Clock, Flame, Plus } from "lucide-react";

interface FoodCardProps {
  item: MenuItem;
  currency: string;
  onSelect: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export function FoodCard({ item, currency, onSelect, onQuickAdd }: FoodCardProps) {
  const hasAddons = item.add_ons && item.add_ons.length > 0;

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group relative bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex gap-3 cursor-pointer overflow-hidden ${
        !item.is_available ? "opacity-60 grayscale-[40%]" : "hover:border-orange-300"
      }`}
    >
      {/* Left: Food Image */}
      <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-400 font-bold text-xl">
            🍔
          </div>
        )}

        {/* Featured Tag */}
        {item.is_featured && (
          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
            Popular
          </span>
        )}

        {/* Unavailable Overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-1 text-center">
            <span className="text-white text-[11px] font-extrabold uppercase tracking-wide leading-tight">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Right: Info & Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>

          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Meta specs */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-0.5 font-bold text-amber-500">
              <Star className="w-3 h-3 fill-amber-400" />
              4.8
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              {item.preparation_time}m
            </span>
            {item.calories && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {item.calories} kcal
                </span>
              </>
            )}
          </div>
        </div>

        {/* Price & Add Action */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-100">
          <div className="font-extrabold text-slate-900 text-base">
            {formatCurrency(item.price, currency)}
          </div>

          {item.is_available ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasAddons) {
                  onSelect(item);
                } else {
                  onQuickAdd(item);
                }
              }}
              className="inline-flex items-center gap-1 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-orange-200 hover:border-orange-600 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasAddons ? "Customize" : "Add"}</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
