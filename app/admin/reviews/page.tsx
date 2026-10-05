'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Review, Restaurant, MenuItem } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { Star, CheckCircle, EyeOff, Trash2, MessageSquare, ThumbsUp } from "lucide-react";

export default function AdminReviewsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const loadData = () => {
    const currentRest = SnapBiteStore.getRestaurant();
    setRestaurant(currentRest);
    setReviews(SnapBiteStore.getReviews(currentRest.id));
    setMenuItems(SnapBiteStore.getMenuItems(currentRest.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener("snapbite_store_updated", loadData);
    return () => window.removeEventListener("snapbite_store_updated", loadData);
  }, []);

  const handleToggleApproval = (id: string) => {
    SnapBiteStore.toggleReviewApproval(id);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this customer review?")) {
      SnapBiteStore.deleteReview(id);
      loadData();
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Reviews & Ratings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Approve, moderate, or remove verified customer feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <div>
              <div className="text-sm font-black text-slate-900">{avgRating} / 5.0</div>
              <div className="text-[10px] text-slate-400">{reviews.length} total reviews</div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 italic">
              No customer reviews submitted yet.
            </div>
          ) : (
            reviews.map((rev) => {
              const dish = menuItems.find((m) => m.id === rev.menu_item_id);

              return (
                <div
                  key={rev.id}
                  className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
                    !rev.is_approved ? "opacity-60 border-slate-300 bg-slate-50/50" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {rev.customer_name}
                      </span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-xs text-slate-400">{formatDate(rev.created_at)}</span>

                      {dish && (
                        <span className="ml-2 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                          Dish: {dish.name}
                        </span>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating
                              ? "fill-amber-400 text-amber-500"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    {rev.review_text && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        “{rev.review_text}”
                      </p>
                    )}
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleToggleApproval(rev.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        rev.is_approved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {rev.is_approved ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
