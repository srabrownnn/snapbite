'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Order, Table, Restaurant } from "@/types/database";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  ChefHat,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant());
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  const refreshData = () => {
    const currentRest = SnapBiteStore.getRestaurant();
    setRestaurant(currentRest);
    setOrders(SnapBiteStore.getOrders(currentRest.id));
    setTables(SnapBiteStore.getTables(currentRest.id));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("snapbite_store_updated", refreshData);
    window.addEventListener("snapbite_order_status_change", refreshData);
    return () => {
      window.removeEventListener("snapbite_store_updated", refreshData);
      window.removeEventListener("snapbite_order_status_change", refreshData);
    };
  }, []);

  // Compute metrics
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const readyOrders = orders.filter((o) => o.status === "ready").length;
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "served").length;

  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const tableUtilization = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0;

  // Hourly counts distribution for chart
  const hours = [
    { label: "12 PM", count: 4, revenue: 1680 },
    { label: "1 PM", count: 8, revenue: 3420 },
    { label: "2 PM", count: 6, revenue: 2540 },
    { label: "5 PM", count: 3, revenue: 1200 },
    { label: "7 PM", count: 12, revenue: 5490 },
    { label: "8 PM", count: 15, revenue: 6890 },
    { label: "9 PM", count: 9, revenue: 3800 },
  ];
  const maxHourlyCount = Math.max(...hours.map((h) => h.count));

  // Popular food items count from order items
  const popularItemCounts: { [name: string]: number } = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      popularItemCounts[item.item_name_snapshot] =
        (popularItemCounts[item.item_name_snapshot] || 0) + item.quantity;
    });
  });

  const popularItems = Object.entries(popularItemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live restaurant performance, sales analytics, and operational metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/kitchen"
              target="_blank"
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>Launch Kitchen Display (KDS)</span>
            </Link>
          </div>
        </div>

        {/* Primary Metrics 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(totalRevenue, restaurant.currency)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.2% vs yesterday</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Orders Count */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 mt-2">
                <span>{pendingOrders} awaiting acceptance</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avg Order Value
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(averageOrderValue, restaurant.currency)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-2">
                <span>Across {validOrders.length} settled tickets</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Table Utilization */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Table Occupancy
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {occupiedTables} / {tables.length}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-2">
                <span>{tableUtilization}% dining occupancy</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Live Operational Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-amber-800">Pending</span>
              <div className="text-xl font-black text-amber-950 mt-0.5">{pendingOrders}</div>
            </div>
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-orange-800">Preparing</span>
              <div className="text-xl font-black text-orange-950 mt-0.5">{preparingOrders}</div>
            </div>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-800">Ready</span>
              <div className="text-xl font-black text-emerald-950 mt-0.5">{readyOrders}</div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-700">Completed</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">{completedOrders}</div>
            </div>
            <CheckCircle className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Charts & Popular Foods 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders by Peak Hour Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Peak Ordering Hours & Traffic
                </h3>
                <p className="text-xs text-slate-500">Hourly guest order frequency</p>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                Peak: 8:00 PM
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 border-b border-slate-100 pb-2">
                {hours.map((h) => {
                  const barHeight = Math.round((h.count / maxHourlyCount) * 100);
                  return (
                    <div key={h.label} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[10px] font-bold text-slate-400 group-hover:text-orange-600">
                        {h.count}
                      </div>
                      <div
                        className="w-full max-w-[42px] bg-slate-200 group-hover:bg-orange-500 rounded-t-lg transition-all duration-300 relative"
                        style={{ height: `${barHeight}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 transition-opacity">
                          {formatCurrency(h.revenue, restaurant.currency)}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 mt-1">
                        {h.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Popular Dishes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Top Selling Foods
              </h3>
              <Link href="/admin/menu" className="text-xs font-bold text-orange-600 hover:underline">
                View Menu →
              </Link>
            </div>

            <div className="space-y-3">
              {popularItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Order items will appear here
                </p>
              ) : (
                popularItems.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <span className="font-black text-slate-900 shrink-0 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.count} sold
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders List Preview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Recent Table Orders</h3>
              <p className="text-xs text-slate-500">Live feed from QR sessions</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Manage all orders</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Table</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-bold text-orange-600">{order.order_number}</td>
                    <td className="py-3 font-bold text-slate-900">
                      {order.table?.table_number || "Table N/A"}
                    </td>
                    <td className="py-3 text-slate-700">{order.customer_name || "Guest"}</td>
                    <td className="py-3 text-slate-400">{formatDateTime(order.created_at)}</td>
                    <td className="py-3 font-black text-slate-900">
                      {formatCurrency(order.total, restaurant.currency)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          order.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : order.status === "preparing"
                            ? "bg-orange-100 text-orange-800"
                            : order.status === "ready"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.status === "completed" || order.status === "served"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
