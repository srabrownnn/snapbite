'use client';

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Order, Restaurant } from "@/types/database";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { formatTime, getMinutesAgo } from "@/lib/utils";
import { playNewKitchenOrderSound } from "@/lib/audio";
import { printThermalReceipt } from "@/lib/receipt/printer";
import {
  ChefHat,
  Volume2,
  VolumeX,
  Clock,
  Maximize2,
  Minimize2,
  Check,
  XCircle,
  RefreshCw,
  UtensilsCrossed,
  Filter,
  Printer,
  Loader2,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

function KitchenDashboardInner() {
  const searchParams = useSearchParams();
  const restParam =
    searchParams.get("restaurant") ||
    searchParams.get("slug") ||
    searchParams.get("restaurantId") ||
    undefined;

  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant(restParam));
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>("all");

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const autoPrintRef = useRef(autoPrintEnabled);
  autoPrintRef.current = autoPrintEnabled;

  const printedOrderIdsRef = useRef<Set<string>>(new Set());

  // Load auto-print preference from browser storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snapbite_auto_print_bills");
      if (saved === "true") {
        setAutoPrintEnabled(true);
      }
    }
  }, []);

  const toggleAutoPrint = () => {
    const next = !autoPrintEnabled;
    setAutoPrintEnabled(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("snapbite_auto_print_bills", String(next));
    }
  };

  const loadOrders = () => {
    const freshRest = SnapBiteStore.getRestaurant(restParam);
    setRestaurant(freshRest);
    const list = SnapBiteStore.getOrders(freshRest.id);
    setOrders(list);
    return list;
  };

  const checkAndAutoPrint = (ordersList: Order[]) => {
    if (!autoPrintRef.current) return;
    ordersList.forEach((order) => {
      if (!printedOrderIdsRef.current.has(order.id) && order.status === "pending") {
        printedOrderIdsRef.current.add(order.id);
        printThermalReceipt(order, restaurant);
      }
    });
  };

  useEffect(() => {
    const initialList = loadOrders();
    setLastOrderCount(initialList.length);
    // Mark initial list as already known so page reload doesn't re-print old orders
    initialList.forEach((o) => printedOrderIdsRef.current.add(o.id));

    // Order update listener
    const handleUpdate = () => {
      const freshRest = SnapBiteStore.getRestaurant(restParam);
      setRestaurant(freshRest);
      const updated = SnapBiteStore.getOrders(freshRest.id);
      if (updated.length > lastOrderCount) {
        if (soundRef.current) playNewKitchenOrderSound();
        checkAndAutoPrint(updated);
      }
      setLastOrderCount(updated.length);
      setOrders(updated);
    };

    window.addEventListener("snapbite_store_updated", handleUpdate);
    window.addEventListener("snapbite_order_status_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Active cloud sync every 3 seconds for tickets arriving from customer phones
    const cloudSyncInterval = setInterval(async () => {
      const syncResult = await SnapBiteStore.syncWithCloudServer(restaurant.id);
      if (syncResult.hasNewOrders) {
        if (soundRef.current) playNewKitchenOrderSound();
        checkAndAutoPrint(syncResult.orders);
      }
      setOrders(syncResult.orders);
    }, 3000);

    // Timer to update elapsed time minutes
    const timerInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);

    return () => {
      window.removeEventListener("snapbite_store_updated", handleUpdate);
      window.removeEventListener("snapbite_order_status_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(timerInterval);
      clearInterval(cloudSyncInterval);
    };
  }, [restaurant.id, lastOrderCount, restParam]);

  // 1-Click Complete Order
  const handleCompleteOrder = (orderId: string) => {
    SnapBiteStore.updateOrderStatus(orderId, "completed");
    loadOrders();
  };

  // Re-open ticket
  const handleReopenOrder = (orderId: string) => {
    SnapBiteStore.updateOrderStatus(orderId, "pending");
    loadOrders();
  };

  // Cancel order
  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      SnapBiteStore.updateOrderStatus(orderId, "cancelled");
      loadOrders();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filter orders
  const tableNumbers = Array.from(new Set(orders.map((o) => o.table?.table_number).filter(Boolean)));

  const activeOrders = orders.filter((o) => !["completed", "served", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => ["completed", "served"].includes(o.status));

  const filteredActiveOrders = activeOrders.filter((o) => {
    if (selectedTableFilter === "all") return true;
    return o.table?.table_number === selectedTableFilter;
  });

  const filteredCompletedOrders = completedOrders.filter((o) => {
    if (selectedTableFilter === "all") return true;
    return o.table?.table_number === selectedTableFilter;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Kitchen Top Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                SnapBite KDS
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                1-Click Kitchen Display
              </span>
            </div>
            <p className="text-xs text-slate-400">{restaurant.name}</p>
          </div>
        </div>

        {/* Center Quick Stats & Table Filter */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-slate-400">Active Tickets:</span>
            <span className="font-extrabold text-orange-400 text-sm">{activeOrders.length}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-slate-400">Completed:</span>
            <span className="font-extrabold text-emerald-400 text-sm">{completedOrders.length}</span>
          </div>

          {/* Table filter */}
          {tableNumbers.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedTableFilter}
                onChange={(e) => setSelectedTableFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none font-semibold cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Tables</option>
                {tableNumbers.map((tbl) => (
                  <option key={tbl} value={tbl} className="bg-slate-900">
                    {tbl}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Auto-Print Bills Toggle */}
          <button
            onClick={toggleAutoPrint}
            title={
              autoPrintEnabled
                ? "Auto-print thermal bill receipt is ENABLED for incoming orders"
                : "Auto-print thermal bill receipt is DISABLED"
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              autoPrintEnabled
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{autoPrintEnabled ? "Auto-Print ON" : "Auto-Print OFF"}</span>
          </button>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playNewKitchenOrderSound();
            }}
            title={soundEnabled ? "Mute kitchen alerts" : "Unmute kitchen alerts"}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              soundEnabled
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-red-500/10 border-red-500/40 text-red-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "Sound ON" : "Sound OFF"}</span>
          </button>

          {/* Refresh manual */}
          <button
            onClick={() => loadOrders()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle fullscreen display"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Back to Restaurant Admin */}
          <Link
            href="/admin"
            className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Admin Panel →
          </Link>
        </div>
      </header>

      {/* Main 2-Column Simple 1-Click Board */}
      <main className="flex-1 p-4 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-80px)]">
          {/* ============================================================== */}
          {/* 1. ACTIVE ORDERS COLUMN */}
          {/* ============================================================== */}
          <div className="flex flex-col rounded-2xl bg-slate-950/80 border border-orange-500/30 overflow-hidden shadow-xl ring-1 ring-orange-500/10">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="font-black text-sm tracking-wide text-white">
                  ACTIVE KITCHEN ORDERS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white">
                  {filteredActiveOrders.length}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">
                1-Click "Completed" to finish
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 no-scrollbar">
              {filteredActiveOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                  <UtensilsCrossed className="w-12 h-12 mb-3 stroke-[1.5] text-slate-700" />
                  <p className="text-sm font-bold text-slate-400">All caught up!</p>
                  <p className="text-xs text-slate-600 mt-1">No active tickets waiting in kitchen</p>
                </div>
              ) : (
                filteredActiveOrders.map((order) => {
                  const minutesAgo = getMinutesAgo(order.created_at);
                  const isUrgent = minutesAgo > 15;
                  const isCritical = minutesAgo > 25;

                  return (
                    <div
                      key={order.id}
                      className={`rounded-2xl p-4 bg-slate-900 border transition-all shadow-md flex flex-col justify-between ${
                        isCritical
                          ? "border-red-500 ring-2 ring-red-500/20"
                          : isUrgent
                          ? "border-orange-500/60"
                          : "border-slate-800"
                      }`}
                    >
                      <div>
                        {/* Ticket Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
                          <div>
                            <div className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                              <span>{order.table?.table_number || "Table N/A"}</span>
                              <span className="text-sm font-bold text-orange-400">
                                {order.order_number}
                              </span>
                            </div>
                            {order.customer_name && (
                              <div className="text-xs text-slate-400 font-medium">
                                Guest: {order.customer_name}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {order.payment_method === "bkash" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#E2136E]/20 text-pink-400 border border-[#E2136E]/40 font-mono">
                                  <span>bKash</span>
                                  {order.bkash_trx_id && <span>• Trx: {order.bkash_trx_id}</span>}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  Cash / In-Person
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  order.payment_status === "paid"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {order.payment_status}
                              </span>
                            </div>
                          </div>

                          {/* Ticket Header Actions: Print Receipt & Urgency Timer */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => printThermalReceipt(order, restaurant)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white transition-all border border-slate-700/80 active:scale-95"
                              title="Print Bill Receipt / Kitchen Ticket"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <div
                              className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                                isCritical
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                  : isUrgent
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{minutesAgo}m ago</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Kitchen Note */}
                        {order.customer_note && (
                          <div className="mb-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                            ⚠️ Note: “{order.customer_note}”
                          </div>
                        )}

                        {/* Order Items List */}
                        <div className="space-y-2 mb-4">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="text-xs bg-slate-950/60 p-2 rounded-xl border border-slate-800/80"
                            >
                              <div className="flex items-start justify-between font-bold text-slate-200">
                                <span className="text-orange-400 text-sm font-black mr-2">
                                  {item.quantity}x
                                </span>
                                <span className="flex-1 text-sm">{item.item_name_snapshot}</span>
                              </div>

                              {/* Add-ons */}
                              {item.addons && item.addons.length > 0 && (
                                <div className="pl-6 mt-1 space-y-0.5 text-slate-400 text-[11px]">
                                  {item.addons.map((ad, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                      <span className="text-orange-400">+</span>
                                      <span>{ad.addon_name_snapshot}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Item specific note */}
                              {item.customer_note && (
                                <div className="pl-6 mt-1 text-[11px] text-amber-400/90 italic">
                                  “{item.customer_note}”
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 1-Click Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>MARK AS COMPLETED ✓</span>
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl transition-all"
                          title="Reject/Cancel"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. COMPLETED ORDERS COLUMN */}
          {/* ============================================================== */}
          <div className="flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-black text-sm tracking-wide text-slate-200">
                  COMPLETED ORDERS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white">
                  {filteredCompletedOrders.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                Fulfilled & Served
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 no-scrollbar">
              {filteredCompletedOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                  <Check className="w-12 h-12 mb-3 stroke-[1.5] text-slate-700" />
                  <p className="text-xs font-semibold">No completed tickets yet today</p>
                </div>
              ) : (
                filteredCompletedOrders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl p-4 bg-slate-900 border border-slate-800 opacity-80 transition-all shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                          <div>
                            <div className="text-lg font-black text-white flex items-center gap-2">
                              <span>{order.table?.table_number || "Table N/A"}</span>
                              <span className="text-xs font-bold text-slate-400">
                                {order.order_number}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Completed • {formatTime(order.updated_at || order.created_at)}
                            </span>
                          </div>

                          <button
                            onClick={() => printThermalReceipt(order, restaurant)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                            title="Print Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 text-xs text-slate-300">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between py-0.5">
                              <span>
                                <strong className="text-orange-400">{item.quantity}x</strong>{" "}
                                {item.item_name_snapshot}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reopen action */}
                      <div className="pt-2 mt-3 border-t border-slate-800">
                        <button
                          onClick={() => handleReopenOrder(order.id)}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reopen Ticket</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function KitchenDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-bold gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span>Loading Kitchen Display...</span>
        </div>
      }
    >
      <KitchenDashboardInner />
    </React.Suspense>
  );
}
