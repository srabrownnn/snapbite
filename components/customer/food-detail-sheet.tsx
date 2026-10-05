'use client';

import React, { useState, useEffect } from "react";
import { MenuItem, AddOn } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { X, Star, Clock, Flame, Plus, Minus, Check, MessageSquare } from "lucide-react";

interface FoodDetailSheetProps {
  item: MenuItem | null;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    selectedAddons: AddOn[],
    specialInstructions: string
  ) => void;
  onViewReviews?: (item: MenuItem) => void;
}

export function FoodDetailSheet({
  item,
  currency,
  isOpen,
  onClose,
  onAddToCart,
  onViewReviews,
}: FoodDetailSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddons([]);
      setSpecialInstructions("");
      setActiveImageIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const images = item.images && item.images.length > 0 ? item.images : [item.image_url || ""];
  const addons = item.add_ons || [];

  const toggleAddon = (addon: AddOn) => {
    setSelectedAddons(prev => {
      const exists = prev.some(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up z-10">
        {/* Close Button Header */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto no-scrollbar flex-1 pb-24">
          {/* Food Image / Gallery */}
          <div className="relative h-64 sm:h-72 w-full bg-slate-100">
            <img
              src={images[activeImageIndex] || item.image_url || ""}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Gallery thumbnails if multiple */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-4 flex gap-2 z-10">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? "border-orange-500 scale-105" : "border-white/70 opacity-80"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5">
            {/* Title & Price */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {item.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    4.8 (24 reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.preparation_time} mins
                  </span>
                  {item.calories && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        {item.calories} kcal
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-xl font-extrabold text-orange-600 shrink-0">
                {formatCurrency(item.price, currency)}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Review Shortcut */}
            {onViewReviews && (
              <button
                onClick={() => {
                  onClose();
                  onViewReviews(item);
                }}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Read guest reviews for this dish →
              </button>
            )}

            {/* Add-ons Checklist */}
            {addons.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Customize with Add-ons
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">Optional</span>
                </div>

                <div className="space-y-2">
                  {addons.map((addon) => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-orange-500 bg-orange-50/50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-orange-600 border-orange-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          +{formatCurrency(addon.price, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-900 mb-1.5">
                Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Less spicy, dressing on the side, no raw onions..."
                rows={2}
                maxLength={200}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-50 focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex items-center gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit */}
          <button
            onClick={() => {
              onAddToCart(item, quantity, selectedAddons, specialInstructions);
              onClose();
            }}
            disabled={!item.is_available}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-between transition-all active:scale-[0.98]"
          >
            <span>Add to Cart</span>
            <span>{formatCurrency(totalPrice, currency)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
