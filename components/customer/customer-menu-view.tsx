'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Restaurant, Table, MenuItem, AddOn, Order, WaiterRequestType } from "@/types/database";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { CustomerHeader } from "@/components/customer/customer-header";
import { RestaurantHero } from "@/components/customer/restaurant-hero";
import { CategoryFilter } from "@/components/customer/category-filter";
import { FoodCard } from "@/components/customer/food-card";
import { FoodDetailSheet } from "@/components/customer/food-detail-sheet";
import { CartSheet } from "@/components/customer/cart-sheet";
import { OrderStatusModal } from "@/components/customer/order-status-modal";
import { ReadyNotificationBanner } from "@/components/customer/ready-notification-banner";
import { WaiterCallModal } from "@/components/customer/waiter-call-modal";
import { ReviewsModal } from "@/components/customer/reviews-modal";
import { CustomerBillModal } from "@/components/customer/customer-bill-modal";
import { useCart } from "@/lib/store/cart-context";
import { playOrderReadySound } from "@/lib/audio";
import { formatCurrency } from "@/lib/utils";
import { Bell, ShoppingBag, AlertTriangle, ArrowRight } from "lucide-react";

interface CustomerMenuViewProps {
  initialRestaurant: Restaurant;
  table: Table;
}

export function CustomerMenuView({ initialRestaurant, table }: CustomerMenuViewProps) {
  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant);
  const [categories, setCategories] = useState(SnapBiteStore.getCategories(initialRestaurant.id));
  const [menuItems, setMenuItems] = useState(SnapBiteStore.getMenuItems(initialRestaurant.id));
  const [reviews, setReviews] = useState(SnapBiteStore.getReviews(initialRestaurant.id));
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modals & Sheets
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWaiterCallOpen, setIsWaiterCallOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewFocusItem, setReviewFocusItem] = useState<MenuItem | null>(null);
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [isCustomerBillOpen, setIsCustomerBillOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [readyNotificationOrder, setReadyNotificationOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const { items: cartItems, addItem, totalCount, totalWithTaxes, clearCart } = useCart();

  // Refresh reactive store data and listen for realtime sync
  const refreshData = () => {
    const currentRest = SnapBiteStore.getRestaurant(initialRestaurant.id);
    setRestaurant(currentRest);
    setCategories(SnapBiteStore.getCategories(currentRest.id));
    setMenuItems(SnapBiteStore.getMenuItems(currentRest.id));
    setReviews(SnapBiteStore.getReviews(currentRest.id));

    // Get table's active orders
    const allOrders = SnapBiteStore.getOrders(currentRest.id);
    const tableOrders = allOrders.filter(
      (o) => o.table_id === table.id && !["completed", "cancelled"].includes(o.status)
    );
    setActiveOrders(tableOrders);

    // If tracking an order, refresh it
    if (trackedOrder) {
      const refreshed = allOrders.find((o) => o.id === trackedOrder.id);
      if (refreshed) {
        setTrackedOrder(refreshed);
      }
    }
  };

  useEffect(() => {
    refreshData();

    // Listen for custom store updates & realtime order events
    const handleStoreUpdate = () => refreshData();

    const handleOrderStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ orderId: string; status: string; order: Order }>;
      refreshData();
      if (customEvent.detail && customEvent.detail.order.table_id === table.id) {
        if (customEvent.detail.status === "ready") {
          playOrderReadySound();
          setReadyNotificationOrder(customEvent.detail.order);
        }
      }
    };

    window.addEventListener("snapbite_store_updated", handleStoreUpdate);
    window.addEventListener("snapbite_order_status_change", handleOrderStatusChange);
    window.addEventListener("storage", handleStoreUpdate);

    // Cross-device cloud sync polling every 3.5 seconds
    const pollInterval = setInterval(async () => {
      if (trackedOrder) {
        try {
          const res = await fetch(`/api/orders/${trackedOrder.id}`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.order && data.order.status !== trackedOrder.status) {
              setTrackedOrder(data.order);
              if (data.order.status === "ready") {
                playOrderReadySound();
                setReadyNotificationOrder(data.order);
              }
              refreshData();
            }
          }
        } catch (e) {}
      } else {
        SnapBiteStore.syncWithCloudServer(initialRestaurant.id).then((sync) => {
          const activeForTable = sync.orders.filter(
            (o) => o.table_id === table.id && !["completed", "cancelled"].includes(o.status)
          );
          setActiveOrders(activeForTable);
        });
      }
    }, 3500);

    return () => {
      window.removeEventListener("snapbite_store_updated", handleStoreUpdate);
      window.removeEventListener("snapbite_order_status_change", handleOrderStatusChange);
      window.removeEventListener("storage", handleStoreUpdate);
      clearInterval(pollInterval);
    };
  }, [initialRestaurant.id, table.id, trackedOrder?.id, trackedOrder?.status]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    let list = menuItems;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory === "all") {
      return list;
    } else if (selectedCategory === "featured") {
      return list.filter((i) => i.is_featured);
    } else {
      return list.filter((i) => i.category_id === selectedCategory);
    }
  }, [menuItems, selectedCategory, searchQuery]);

  // Average Rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 4.9;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  // Order Submission
  const handleSubmitOrder = async (params: {
    customerName: string;
    customerPhone: string;
    customerNote: string;
    paymentMethod: any;
  }) => {
    setIsSubmittingOrder(true);
    try {
      const newOrder = await SnapBiteStore.createOrderAsync({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerNote: params.customerNote,
        paymentMethod: params.paymentMethod,
        cartItems,
      });

      clearCart();
      setIsCartOpen(false);
      setTrackedOrder(newOrder);
      setIsOrderStatusOpen(true);
      refreshData();
    } catch (e) {
      alert("There was an error submitting your order. Please try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Waiter Call
  const handleWaiterRequest = (type: WaiterRequestType) => {
    SnapBiteStore.createWaiterRequest(restaurant.id, table.id, type);
  };

  // Review Submission
  const handleSubmitReview = (params: {
    rating: number;
    reviewText: string;
    customerName: string;
    menuItemId?: string;
  }) => {
    SnapBiteStore.submitReview({
      restaurantId: restaurant.id,
      orderId: trackedOrder?.id,
      menuItemId: params.menuItemId,
      rating: params.rating,
      reviewText: params.reviewText,
      customerName: params.customerName,
    });
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Ready Alert Banner */}
      <ReadyNotificationBanner
        order={readyNotificationOrder}
        isOpen={Boolean(readyNotificationOrder)}
        onClose={() => setReadyNotificationOrder(null)}
        onViewOrder={() => {
          if (readyNotificationOrder) {
            setTrackedOrder(readyNotificationOrder);
            setIsOrderStatusOpen(true);
          }
        }}
      />

      {/* Customer Header */}
      <CustomerHeader
        restaurant={restaurant}
        table={table}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWaiterCall={() => setIsWaiterCallOpen(true)}
        onOpenBill={() => {
          if (activeOrders.length > 0 && !trackedOrder) {
            setTrackedOrder(activeOrders[0]);
          }
          setIsCustomerBillOpen(true);
        }}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenActiveOrder={() => {
          if (activeOrders.length > 0) {
            setTrackedOrder(activeOrders[0]);
            setIsOrderStatusOpen(true);
          }
        }}
        activeOrderCount={activeOrders.length}
      />

      {/* Hero Overview */}
      <RestaurantHero
        restaurant={restaurant}
        averageRating={averageRating}
        reviewCount={reviews.length}
        onOpenReviews={() => {
          setReviewFocusItem(null);
          setIsReviewsOpen(true);
        }}
      />

      {/* Category Pills Navigation */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Menu Foods Grid */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-base">No items found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try searching for something else or pick a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-3 px-4 py-2 bg-orange-100 text-orange-800 font-bold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              currency={restaurant.currency}
              onSelect={(food) => setSelectedItemForDetail(food)}
              onQuickAdd={(food) => {
                addItem(food, 1, [], "");
              }}
            />
          ))
        )}
      </main>

      {/* Floating Bottom Quick Actions */}
      <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto flex items-center gap-3">
        {/* Floating Call Waiter Button */}
        <button
          onClick={() => setIsWaiterCallOpen(true)}
          className="bg-white/95 backdrop-blur-md text-slate-800 border border-slate-300 font-bold text-xs py-3 px-4 rounded-2xl shadow-lg flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shrink-0"
        >
          <Bell className="w-4 h-4 text-amber-600" />
          <span>Call Staff</span>
        </button>

        {/* Sticky Cart CTA */}
        {totalCount > 0 ? (
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-between active:scale-[0.98] transition-all animate-bounce-subtle"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                {totalCount}
              </span>
              <span>View Cart</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>
                {formatCurrency(
                  totalWithTaxes(
                    restaurant.tax_percentage,
                    restaurant.service_charge_percentage
                  ),
                  restaurant.currency
                )}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ) : activeOrders.length > 0 ? (
          <button
            onClick={() => {
              setTrackedOrder(activeOrders[0]);
              setIsOrderStatusOpen(true);
            }}
            className="flex-1 bg-slate-900 text-white font-bold text-xs py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Track Order {activeOrders[0].order_number}</span>
            </div>
            <span className="capitalize font-semibold text-orange-400">
              {activeOrders[0].status} →
            </span>
          </button>
        ) : null}
      </div>

      {/* Modals & Drawers */}
      <FoodDetailSheet
        item={selectedItemForDetail}
        currency={restaurant.currency}
        isOpen={Boolean(selectedItemForDetail)}
        onClose={() => setSelectedItemForDetail(null)}
        onAddToCart={(item, qty, addons, note) => {
          addItem(item, qty, addons, note);
        }}
        onViewReviews={(item) => {
          setReviewFocusItem(item);
          setIsReviewsOpen(true);
        }}
      />

      <CartSheet
        restaurant={restaurant}
        table={table}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
      />

      <OrderStatusModal
        order={trackedOrder}
        restaurant={restaurant}
        isOpen={isOrderStatusOpen}
        onClose={() => setIsOrderStatusOpen(false)}
        onRequestBill={() => handleWaiterRequest("request_bill")}
        onCallWaiter={() => handleWaiterRequest("call_waiter")}
        onViewBill={() => setIsCustomerBillOpen(true)}
        onLeaveReview={() => {
          setReviewFocusItem(null);
          setIsReviewsOpen(true);
        }}
      />

      <CustomerBillModal
        order={trackedOrder || (activeOrders.length > 0 ? activeOrders[0] : null)}
        restaurant={restaurant}
        isOpen={isCustomerBillOpen}
        onClose={() => setIsCustomerBillOpen(false)}
        onRequestWaiterBill={() => handleWaiterRequest("request_bill")}
      />

      <WaiterCallModal
        table={table}
        isOpen={isWaiterCallOpen}
        onClose={() => setIsWaiterCallOpen(false)}
        onRequest={handleWaiterRequest}
      />

      <ReviewsModal
        restaurant={restaurant}
        menuItem={reviewFocusItem}
        reviews={reviews}
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}
