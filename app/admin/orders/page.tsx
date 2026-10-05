'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Order, OrderStatus, PaymentStatus } from "@/types/database";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { printThermalReceipt } from "@/lib/receipt/printer";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  CreditCard,
  User,
  Phone,
  MessageSquare,
  Printer,
} from "lucide-react";

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Served / Done", value: "served" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const restaurant = SnapBiteStore.getRestaurant();

  const loadOrders = () => {
    const list = SnapBiteStore.getOrders(restaurant.id);
    setOrders(list);
    if (selectedOrder) {
      const refreshed = list.find((o) => o.id === selectedOrder.id);
      if (refreshed) setSelectedOrder(refreshed);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener("snapbite_store_updated", handleUpdate);
    window.addEventListener("snapbite_order_status_change", handleUpdate);

    const syncInterval = setInterval(async () => {
      const result = await SnapBiteStore.syncWithCloudServer(restaurant.id);
      setOrders(result.orders);
    }, 3500);

    return () => {
      window.removeEventListener("snapbite_store_updated", handleUpdate);
      window.removeEventListener("snapbite_order_status_change", handleUpdate);
      clearInterval(syncInterval);
    };
  }, [restaurant.id]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    SnapBiteStore.updateOrderStatus(orderId, newStatus);
    loadOrders();
  };

  const handlePaymentStatusChange = (orderId: string, newStatus: PaymentStatus) => {
    SnapBiteStore.updateOrderPaymentStatus(orderId, newStatus);
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      selectedFilter === "all"
        ? true
        : selectedFilter === "served"
        ? o.status === "served" || o.status === "completed"
        : o.status === selectedFilter;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.table?.table_number &&
            o.table.table_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (o.customer_name &&
            o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live status tracking, order modification, and payment reconciliations.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Horizontal Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {FILTER_TABS.map((tab) => {
                const isSelected = selectedFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-orange-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order #, table, guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Table</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-black text-orange-600 text-sm">
                        {order.order_number}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {order.table?.table_number || "Table N/A"}
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(order.created_at)}
                      </td>
                      <td className="p-4 text-slate-700">
                        {order.customer_name || "Table Guest"}
                      </td>
                      <td className="p-4 text-slate-600 max-w-[200px] truncate">
                        {order.items
                          ?.map((i) => `${i.quantity}x ${i.item_name_snapshot}`)
                          .join(", ")}
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        {formatCurrency(order.total, restaurant.currency)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            order.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : order.status === "accepted"
                              ? "bg-blue-100 text-blue-800"
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
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            order.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              printThermalReceipt(order, restaurant);
                            }}
                            title="Print Thermal Bill Receipt"
                            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-lg font-bold text-xs transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Drawer / Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Order {selectedOrder.order_number}
                  </h3>
                  <p className="text-xs text-orange-600 font-bold">
                    {selectedOrder.table?.table_number || "Table N/A"} •{" "}
                    {formatDateTime(selectedOrder.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printThermalReceipt(selectedOrder, restaurant)}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-orange-200 transition-colors"
                    title="Print Thermal Bill Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Bill</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Guest Info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">Guest:</span>{" "}
                  <span>{selectedOrder.customer_name || "Anonymous Guest"}</span>
                </div>
                {selectedOrder.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold">Phone:</span>{" "}
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                )}
                {selectedOrder.customer_note && (
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200 text-amber-800">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>“{selectedOrder.customer_note}”</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ordered Items
                </h4>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-start justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.quantity}x {item.item_name_snapshot}
                        </div>
                        {item.addons && item.addons.length > 0 && (
                          <div className="text-[11px] text-slate-500 pl-4 space-y-0.5">
                            {item.addons.map((ad, i) => (
                              <div key={i}>
                                + {ad.addon_name_snapshot} ({formatCurrency(ad.price, restaurant.currency)})
                              </div>
                            ))}
                          </div>
                        )}
                        {item.customer_note && (
                          <div className="text-[11px] text-amber-700 italic pl-4">
                            “{item.customer_note}”
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.subtotal, restaurant.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal, restaurant.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedOrder.tax, restaurant.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service Charge:</span>
                    <span>{formatCurrency(selectedOrder.service_charge, restaurant.currency)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-orange-600">
                      {formatCurrency(selectedOrder.total, restaurant.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Update Order Status
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(["pending", "accepted", "preparing", "ready", "served", "completed"] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedOrder.id, st)}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                          selectedOrder.status === st
                            ? "bg-orange-600 text-white shadow-md"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Payment Status Action */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payment Status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, "unpaid")}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedOrder.payment_status === "unpaid"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Mark Unpaid
                  </button>
                  <button
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, "paid")}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedOrder.payment_status === "paid"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    Mark Paid ✓
                  </button>
                </div>
              </div>

              {/* Print Thermal Receipt Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => printThermalReceipt(selectedOrder, restaurant)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <Printer className="w-4 h-4 text-orange-400" />
                  <span>Print Thermal Bill / Receipt (80mm / 58mm)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
