'use client';

import React from "react";
import { Restaurant } from "@/types/database";
import { Star, Clock, MapPin } from "lucide-react";

interface RestaurantHeroProps {
  restaurant: Restaurant;
  averageRating: number;
  reviewCount: number;
  onOpenReviews: () => void;
}

export function RestaurantHero({
  restaurant,
  averageRating,
  reviewCount,
  onOpenReviews,
}: RestaurantHeroProps) {
  return (
    <div className="relative bg-white border-b border-slate-200">
      {/* Cover Image */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        {restaurant.cover_image_url ? (
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-500 to-amber-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Status Pill on Cover */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Open Now • {restaurant.opening_time} – {restaurant.closing_time}</span>
        </div>
      </div>

      {/* Info Container */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {restaurant.name}
        </h2>
        {restaurant.description && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>
        )}

        {/* Rating and Info Badges */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
          <button
            onClick={onOpenReviews}
            className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{averageRating > 0 ? averageRating.toFixed(1) : "4.9"}</span>
            <span className="text-slate-400 font-normal">({reviewCount || 6} reviews)</span>
          </button>

          {restaurant.address && (
            <div className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[170px]">{restaurant.address}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Tax: {restaurant.tax_percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
