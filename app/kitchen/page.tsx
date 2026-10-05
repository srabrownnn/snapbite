'use client';

import React, { useState, useEffect, useRef } from "react";
import { Order, OrderStatus } from "@/types/database";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { formatTime, getMinutesAgo } from "@/lib/utils";
import { playNewKitchenOrderSound } from "@/lib/audio";
import {
  ChefHat,
  Volume2,
  VolumeX,
  Clock,
  Maximize2,
  Minimize2,
  Check,
  Flame,
  Bell,
  ArrowRight,
  XCircle,
  RefreshCw,
  UtensilsCrossed,
  Filter,
} from "lucide-react";
import Link from "next/link";

const COLUMNS: { status: OrderStatus; title: string; color: string; badgeColor: string }[] = [
  { status: "pending", title: "NEW ORDERS", color: "border-amber-400 bg-amber-50/40", badgeColor: "bg-amber-500 text-white" },
  { status: "accepted", title: "ACCEPTED", color: "border-blue-400 bg-blue-50/40", badgeColor: "bg-blue-500 text-white" },
  { status: "preparing", title: "PREPARING", color: "border-orange-500 bg-orange-50/40", badgeColor: "bg-orange-600 text-white" },
  { status: "ready", title: "READY FOR PICKUP", color: "border-emerald-500 bg-emerald-50/40", badgeColor: "bg-emerald-600 text-white" },
  { status: "served", title: "SERVED", color: "border-purple-400 bg-purple-50/40", badgeColor: "bg-purple-600 text-white" },
];

export default function KitchenDashboardPage() {
  const restaurant = SnapBiteStore.getRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>("all");

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const loadOrders = () => {
    const list = SnapBiteStore.getOrders(restaurant.id);
    setOrders(list);
    return list;
  };

  useEffect(() => {
    const initialList = loadOrders();
    setLastOrderCount(initialList.length);

    // Order update listener
    const handleUpdate = () => {
      const updated = SnapBiteStore.getOrders(restaurant.id);
      if (updated.length > lastOrderCount && soundRef.current) {
        playNewKitchenOrderSound();
      }
      setLastOrderCount(updated.length);
      setOrders(updated);
    };

    window.addEventListener("snapbite_store_updated", handleUpdate);
    window.addEventListener("snapbite_order_status_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Active cloud sync every 3 seconds for tickets arriving from customer phones across internet
    const cloudSyncInterval = setInterval(async () => {
      const syncResult = await SnapBiteStore.syncWithCloudServer(restaurant.id);
      if (syncResult.hasNewOrders && soundRef.current) {
        playNewKitchenOrderSound();
      }
      setOrders(syncResult.orders);
    }, 3000);

    // Minute timer to update elapsed timers
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
  }, [restaurant.id, lastOrderCount]);

  // Transition handler
  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;
    if (currentStatus === "pending") nextStatus = "accepted";
    else if (currentStatus === "accepted") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "served";
    else if (currentStatus === "served") nextStatus = "completed";

    SnapBiteStore.updateOrderStatus(orderId, nextStatus);
    loadOrders();
  };

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

  // Extract unique tables for filter
  const tableNumbers = Array.from(new Set(orders.map((o) => o.table?.table_number).filter(Boolean)));

  // Active orders filtered
  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const filteredActiveOrders = activeOrders.filter((o) => {
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
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                Kitchen Display
              </span>
            </div>
            <p className="text-xs text-slate-400">{restaurant.name}</p>
          </div>
        </div>

        {/* Center Quick Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-slate-400">Active Tickets:</span>
            <span className="font-extrabold text-orange-400 text-sm">{activeOrders.length}</span>
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
          {/* Sound Toggle */}
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

          {/* Back to Admin */}
          <Link
            href="/admin"
            className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Admin Panel →
          </Link>
        </div>
      </header>

      {/* Kanban Board Container */}
      <main className="flex-1 p-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-[1280px] h-[calc(100vh-80px)]">
          {COLUMNS.map((col) => {
            const columnOrders = filteredActiveOrders.filter((o) => o.status === col.status);

            return (
              <div
                key={col.status}
                className="flex-1 flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-lg"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm tracking-wide text-slate-200">
                      {col.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${col.badgeColor}`}>
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Tickets Scroll Container */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 no-scrollbar">
                  {columnOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                      <UtensilsCrossed className="w-8 h-8 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-semibold">No tickets in this stage</p>
                    </div>
                  ) : (
                    columnOrders.map((order) => {
                      const minutesAgo = getMinutesAgo(order.created_at);
                      const isUrgent = minutesAgo > 15;
                      const isCritical = minutesAgo > 25;

                      return (
                        <div
                          key={order.id}
                          className={`rounded-2xl p-4 bg-slate-900 border transition-all shadow-md flex flex-col justify-between ${
                            col.status === "pending"
                              ? "border-amber-500/60 ring-2 ring-amber-500/20 animate-pulse-subtle"
                              : isCritical
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
                              </div>

                              {/* Elapsed Urgency Timer */}
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

                            {/* Customer Kitchen Note */}
                            {order.customer_note && (
                              <div className="mb-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                                ⚠️ Note: “{order.customer_note}”
                              </div>
                            )}

                            {/* Order Items List */}
                            <div className="space-y-2 mb-4">
                              {order.items?.map((item) => (
                                <div key={item.id} className="text-xs bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
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

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                            {col.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleAdvanceStatus(order.id, order.status)}
                                  className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                  <Check className="w-5 h-5 stroke-[3]" />
                                  <span>ACCEPT ORDER</span>
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="p-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl transition-all"
                                  title="Reject/Cancel"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            ) : col.status === "accepted" ? (
                              <button
                                onClick={() => handleAdvanceStatus(order.id, order.status)}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                <Flame className="w-5 h-5" />
                                <span>START PREPARING</span>
                              </button>
                            ) : col.status === "preparing" ? (
                              <button
                                onClick={() => handleAdvanceStatus(order.id, order.status)}
                                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                <Bell className="w-5 h-5" />
                                <span>MARK AS READY 🔔</span>
                              </button>
                            ) : col.status === "ready" ? (
                              <button
                                onClick={() => handleAdvanceStatus(order.id, order.status)}
                                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                <Check className="w-5 h-5 stroke-[3]" />
                                <span>MARK AS SERVED</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAdvanceStatus(order.id, order.status)}
                                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                <span>COMPLETE TICKET</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
