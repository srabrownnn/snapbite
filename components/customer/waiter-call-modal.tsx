'use client';

import React, { useState } from "react";
import { Table, WaiterRequestType } from "@/types/database";
import { Bell, Receipt, HelpCircle, X, CheckCircle2 } from "lucide-react";

interface WaiterCallModalProps {
  table: Table;
  isOpen: boolean;
  onClose: () => void;
  onRequest: (type: WaiterRequestType) => void;
}

export function WaiterCallModal({
  table,
  isOpen,
  onClose,
  onRequest,
}: WaiterCallModalProps) {
  const [submittedType, setSubmittedType] = useState<WaiterRequestType | null>(null);

  if (!isOpen) return null;

  const handleSelect = (type: WaiterRequestType) => {
    onRequest(type);
    setSubmittedType(type);
    setTimeout(() => {
      setSubmittedType(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-slide-up z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Service Request</h3>
            <p className="text-xs text-orange-600 font-semibold">{table.table_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedType ? (
          <div className="py-8 text-center animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-lg">Staff Alerted!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              A server has received your request and is walking over to {table.table_number}.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-2.5">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              How can we assist you right now?
            </p>

            <button
              onClick={() => handleSelect("call_waiter")}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 flex items-center gap-3 transition-all text-left group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Call Waiter</h5>
                <p className="text-xs text-slate-500">Need table service, napkins, or cutlery</p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("request_bill")}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 flex items-center gap-3 transition-all text-left group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Request Bill</h5>
                <p className="text-xs text-slate-500">Ready to pay cash or card at table</p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("assistance")}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 flex items-center gap-3 transition-all text-left group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Need Assistance</h5>
                <p className="text-xs text-slate-500">Dietary query or special table request</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
