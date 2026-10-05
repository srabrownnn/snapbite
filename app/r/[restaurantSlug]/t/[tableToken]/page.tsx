'use client';

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { CartProvider } from "@/lib/store/cart-context";
import { CustomerMenuView } from "@/components/customer/customer-menu-view";
import { QrCode, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CustomerTablePage() {
  const params = useParams();
  const restaurantSlug = (params?.restaurantSlug as string) || "demo-restaurant";
  const tableToken = (params?.tableToken as string) || "";

  // Lookup restaurant & table
  const restaurant = useMemo(() => {
    return SnapBiteStore.getRestaurant(restaurantSlug);
  }, [restaurantSlug]);

  const table = useMemo(() => {
    return SnapBiteStore.getTableByToken(tableToken);
  }, [tableToken]);

  // If table token not found, display friendly recovery screen
  if (!table) {
    const allTables = SnapBiteStore.getTables(restaurant.id);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Table Not Recognized</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The QR code token (<code className="bg-slate-100 px-1 py-0.5 rounded text-orange-600">{tableToken}</code>) is invalid or has expired. Please re-scan your tabletop code or select a test table below.
          </p>

          <div className="mt-6 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Available Demo Tables:
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {allTables.slice(0, 8).map((tbl) => (
                <Link
                  key={tbl.id}
                  href={`/r/${restaurant.slug}/t/${tbl.qr_token}`}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
                >
                  <span>{tbl.table_number}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <QrCode className="w-4 h-4" />
            <span>SnapBite QR Engine</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CartProvider tableId={table.id}>
      <CustomerMenuView initialRestaurant={restaurant} table={table} />
    </CartProvider>
  );
}
