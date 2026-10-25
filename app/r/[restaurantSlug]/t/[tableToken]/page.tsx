'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Table, Restaurant } from "@/types/database";
import { CartProvider } from "@/lib/store/cart-context";
import { CustomerMenuView } from "@/components/customer/customer-menu-view";
import { QrCode, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CustomerTablePage() {
  const params = useParams();
  const restaurantSlug = (params?.restaurantSlug as string) || "restaurant";
  const tableToken = (params?.tableToken as string) || "";

  // Lookup restaurant
  const restaurant = useMemo(() => {
    return SnapBiteStore.getRestaurant(restaurantSlug);
  }, [restaurantSlug]);

  // Lookup table from local storage or cloud server
  const [table, setTable] = useState<Table | null>(() => {
    return SnapBiteStore.getTableByToken(tableToken) || null;
  });
  const [isLoading, setIsLoading] = useState(!table);
  const [availableTables, setAvailableTables] = useState<Table[]>(() => {
    return SnapBiteStore.getTables(restaurant.id);
  });

  useEffect(() => {
    let isMounted = true;

    async function resolveTable() {
      // Sync restaurant details from server
      fetch(`/api/restaurant?slug=${encodeURIComponent(restaurantSlug)}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d.restaurant) {
            SnapBiteStore.updateRestaurant(d.restaurant);
          }
        })
        .catch(() => {});

      // If table is already found locally, sync fresh tables in background
      if (table) {
        SnapBiteStore.syncTablesWithServer(restaurant.id).then((fresh) => {
          if (isMounted && fresh && fresh.length > 0) setAvailableTables(fresh);
        });
        return;
      }

      setIsLoading(true);
      try {
        // Query cloud server for this specific table token
        const res = await fetch(`/api/tables?token=${encodeURIComponent(tableToken)}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.table) {
            SnapBiteStore.saveTable(data.table);
            if (isMounted) {
              setTable(data.table);
              setIsLoading(false);
            }
            return;
          }
        }

        // If not found directly, sync all tables from server
        const allRes = await fetch(`/api/tables?restaurantId=${restaurant.id}`, {
          cache: "no-store",
        });
        if (allRes.ok) {
          const allData = await allRes.json();
          if (Array.isArray(allData.tables)) {
            const match = allData.tables.find((t: Table) => t.qr_token === tableToken);
            if (isMounted) {
              setAvailableTables(allData.tables);
              if (match) {
                SnapBiteStore.saveTable(match);
                setTable(match);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching table from cloud server:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    resolveTable();

    return () => {
      isMounted = false;
    };
  }, [tableToken, restaurant.id, table]);

  // Loading state while verifying token with server
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 selection:bg-orange-500">
        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-orange-600/30 animate-pulse">
          <QrCode className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
          <h2 className="text-base font-extrabold tracking-tight">Connecting to Table...</h2>
        </div>
        <p className="text-xs text-slate-400">Loading {restaurant.name} digital menu</p>
      </div>
    );
  }

  // If table token not recognized anywhere
  if (!table) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Table Not Recognized</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The QR code token (<code className="bg-slate-100 px-1 py-0.5 rounded text-orange-600 font-mono text-[11px]">{tableToken}</code>) is invalid or has expired. Please re-scan your tabletop code or select a table below.
          </p>

          <div className="mt-6 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Available Tables:
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {availableTables.slice(0, 8).map((tbl) => (
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
