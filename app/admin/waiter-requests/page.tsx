'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { WaiterRequest, Restaurant } from "@/types/database";
import { formatTime, getMinutesAgo } from "@/lib/utils";
import { playWaiterCallAlertSound } from "@/lib/audio";
import { Bell, Receipt, HelpCircle, CheckCircle, Clock, Volume2, RefreshCw } from "lucide-react";

export default function AdminWaiterRequestsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant());
  const [requests, setRequests] = useState<WaiterRequest[]>([]);

  const loadRequests = () => {
    const currentRest = SnapBiteStore.getRestaurant();
    setRestaurant(currentRest);
    const list = SnapBiteStore.getWaiterRequests(currentRest.id);
    setRequests(list);
    return list;
  };

  useEffect(() => {
    loadRequests();
    const handleUpdate = () => loadRequests();
    const handleCall = () => {
      playWaiterCallAlertSound();
      loadRequests();
    };

    window.addEventListener("snapbite_store_updated", handleUpdate);
    window.addEventListener("snapbite_waiter_call", handleCall);

    let prevCount = requests.length;
    const syncInterval = setInterval(async () => {
      const syncResult = await SnapBiteStore.syncWithCloudServer(restaurant.id);
      const pendingCount = syncResult.waiterRequests.filter((r) => r.status === "pending").length;
      if (pendingCount > prevCount) {
        playWaiterCallAlertSound();
      }
      prevCount = pendingCount;
      setRequests(syncResult.waiterRequests);
    }, 3000);

    return () => {
      window.removeEventListener("snapbite_store_updated", handleUpdate);
      window.removeEventListener("snapbite_waiter_call", handleCall);
      clearInterval(syncInterval);
    };
  }, [restaurant.id, requests.length]);

  const handleResolve = (id: string) => {
    SnapBiteStore.resolveWaiterRequest(id);
    loadRequests();
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status === "resolved");

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Waiter & Bill Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live customer table service alerts and bill dispatch queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playWaiterCallAlertSound()}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Test Chime</span>
            </button>
            <button
              onClick={() => loadRequests()}
              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Pending Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Active Service Calls</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white">
                {pendingRequests.length}
              </span>
            </h2>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2 stroke-[1.5]" />
              <h3 className="font-bold text-slate-700 text-base">All clear!</h3>
              <p className="text-xs text-slate-400 mt-1">No pending table service calls right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((req) => {
                const minutesAgo = getMinutesAgo(req.created_at);
                const isBill = req.type === "request_bill";
                const isAssistance = req.type === "assistance";

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border bg-white shadow-md flex flex-col justify-between transition-all ${
                      isBill
                        ? "border-emerald-300 ring-2 ring-emerald-500/10"
                        : "border-amber-300 ring-2 ring-amber-500/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isBill
                                ? "bg-emerald-100 text-emerald-700"
                                : isAssistance
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {isBill ? (
                              <Receipt className="w-5 h-5" />
                            ) : isAssistance ? (
                              <HelpCircle className="w-5 h-5" />
                            ) : (
                              <Bell className="w-5 h-5 animate-bounce" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 text-lg leading-tight">
                              {req.table?.table_number || "Table N/A"}
                            </h3>
                            <span className="text-xs font-bold text-slate-500 capitalize">
                              {req.type.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{minutesAgo}m ago</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                        {isBill
                          ? "Guest is requesting physical/digital bill receipt to complete payment."
                          : isAssistance
                          ? "Customer needs special assistance or recommendations."
                          : "Customer called waiter to their dining table."}
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolve(req.id)}
                      className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Attended / Resolved</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolved History */}
        {resolvedRequests.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Resolved Service Calls ({resolvedRequests.length})
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {resolvedRequests.slice(0, 10).map((req) => (
                <div key={req.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">
                      {req.table?.table_number || "Table N/A"}
                    </span>
                    <span className="text-slate-500 capitalize">{req.type.replace("_", " ")}</span>
                    <span className="text-[11px] text-slate-400">
                      Requested {formatTime(req.created_at)}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
