'use client';

import React, { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { SnapBiteStore } from "@/lib/store/demo-store";
import Link from "next/link";
import { QrCode, ArrowRight } from "lucide-react";

export default function MenuCompatibilityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const restaurantSlug = (params?.restaurantSlug as string) || "demo-restaurant";
  const tableParam = searchParams.get("table");

  const restaurant = SnapBiteStore.getRestaurant(restaurantSlug);
  const tables = SnapBiteStore.getTables(restaurant.id);

  useEffect(() => {
    if (tableParam) {
      router.replace(`/r/${restaurantSlug}/t/${tableParam}`);
    }
  }, [tableParam, restaurantSlug, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center">
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900">{restaurant.name}</h2>
        <p className="text-xs text-slate-500 mt-1">
          Please select your table or scan the physical QR code on your table to place orders.
        </p>

        <div className="mt-6 text-left space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Dining Table:
          </h3>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
            {tables.map((tbl) => (
              <Link
                key={tbl.id}
                href={`/r/${restaurant.slug}/t/${tbl.qr_token}`}
                className="p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
              >
                <span>{tbl.table_number}</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
