'use client';

import React, { useState } from "react";
import { Review, MenuItem, Restaurant } from "@/types/database";
import { Star, X, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";

interface ReviewsModalProps {
  restaurant: Restaurant;
  menuItem?: MenuItem | null;
  reviews: Review[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (params: {
    rating: number;
    reviewText: string;
    customerName: string;
    menuItemId?: string;
  }) => void;
}

export function ReviewsModal({
  restaurant,
  menuItem,
  reviews,
  isOpen,
  onClose,
  onSubmitReview,
}: ReviewsModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const relevantReviews = reviews.filter(r => (menuItem ? r.menu_item_id === menuItem.id : true));
  const totalCount = relevantReviews.length;
  const avgRating =
    totalCount > 0
      ? (relevantReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
      : "5.0";

  // Distribution
  const counts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: relevantReviews.filter(r => r.rating === stars).length,
    percentage: totalCount > 0 ? (relevantReviews.filter(r => r.rating === stars).length / totalCount) * 100 : 0,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    onSubmitReview({
      rating,
      reviewText: reviewText.trim(),
      customerName: customerName.trim() || "Guest",
      menuItemId: menuItem?.id,
    });

    setIsSubmitting(false);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowForm(false);
      setReviewText("");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {menuItem ? `Reviews for ${menuItem.name}` : `Ratings for ${restaurant.name}`}
            </h3>
            <p className="text-xs text-slate-500">Verified dining feedback</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
          {/* Rating Summary Card */}
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 flex items-center gap-6">
            <div className="text-center shrink-0">
              <div className="text-4xl font-black text-slate-900">{avgRating}</div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(Number(avgRating))
                        ? "fill-amber-400 text-amber-500"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                {totalCount} {totalCount === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 space-y-1">
              {counts.map(({ stars, percentage, count }) => (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold text-slate-600">{stars}★</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-5 text-right text-[11px] text-slate-400 font-medium">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Leave a review button or form */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-orange-50 border border-orange-300 text-orange-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Share Your Experience</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Write a Review
                </h4>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Star selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-500"
                            : "fill-slate-200 text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Sarah K.)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="What did you think of the food and service?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !reviewText.trim()}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {submittedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Review Published!</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Guest Feedback
            </h4>

            {relevantReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Be the first to review this dish!
              </p>
            ) : (
              relevantReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {rev.customer_name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(rev.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-500"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  {rev.review_text && (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {rev.review_text}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
