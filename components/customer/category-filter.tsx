'use client';

import React from "react";
import { Category } from "@/types/database";
import { Sparkles, Utensils } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="sticky top-[61px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2.5 shadow-sm">
      <div className="max-w-md mx-auto px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        {/* All Pill */}
        <button
          onClick={() => onSelectCategory("all")}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedCategoryId === "all"
              ? "bg-orange-600 text-white shadow-sm shadow-orange-500/30 scale-100"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>All Items</span>
        </button>

        {/* Featured / Popular Pill */}
        <button
          onClick={() => onSelectCategory("featured")}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedCategoryId === "featured"
              ? "bg-amber-600 text-white shadow-sm shadow-amber-500/30"
              : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-600" />
          <span>Popular</span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-orange-600 text-white shadow-sm shadow-orange-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
