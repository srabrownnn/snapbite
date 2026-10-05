'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Restaurant } from "@/types/database";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  ClipboardList,
  ChefHat,
  Bell,
  Star,
  Settings,
  ShieldCheck,
  ExternalLink,
  Menu as MenuIcon,
  X,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingWaiterCount, setPendingWaiterCount] = useState(0);

  const refreshCounts = () => {
    const currentRest = SnapBiteStore.getRestaurant();
    setRestaurant(currentRest);
    const orders = SnapBiteStore.getOrders(currentRest.id);
    const pOrders = orders.filter((o) => o.status === "pending").length;
    setPendingOrdersCount(pOrders);

    const waiter = SnapBiteStore.getWaiterRequests(currentRest.id);
    const pWaiter = waiter.filter((w) => w.status === "pending").length;
    setPendingWaiterCount(pWaiter);
  };

  useEffect(() => {
    refreshCounts();

    const handleUpdate = () => refreshCounts();
    window.addEventListener("snapbite_store_updated", handleUpdate);
    window.addEventListener("snapbite_order_status_change", handleUpdate);
    window.addEventListener("snapbite_waiter_call", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("snapbite_store_updated", handleUpdate);
      window.removeEventListener("snapbite_order_status_change", handleUpdate);
      window.removeEventListener("snapbite_waiter_call", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const navLinks = [
    { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
    {
      href: "/admin/orders",
      label: "Orders Management",
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: "bg-orange-600 text-white",
    },
    { href: "/kitchen", label: "Kitchen Display (KDS)", icon: ChefHat, isExternalTab: true },
    { href: "/admin/menu", label: "Menu & Add-ons", icon: UtensilsCrossed },
    { href: "/admin/tables", label: "Tables & QR Codes", icon: QrCode },
    {
      href: "/admin/waiter-requests",
      label: "Waiter Calls",
      icon: Bell,
      badge: pendingWaiterCount > 0 ? pendingWaiterCount : null,
      badgeColor: "bg-amber-500 text-white",
    },
    { href: "/admin/reviews", label: "Guest Reviews", icon: Star },
    { href: "/admin/settings", label: "Restaurant Settings", icon: Settings },
    { href: "/super-admin", label: "SaaS Super Admin", icon: ShieldCheck },
  ];

  const firstTable = SnapBiteStore.getTables(restaurant.id)[0];
  const previewMenuUrl = firstTable
    ? `/r/${restaurant.slug}/t/${firstTable.qr_token}`
    : `/r/${restaurant.slug}/t/tbl_tok_01_snap`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white text-sm">
            SB
          </div>
          <span className="font-extrabold text-base tracking-tight">{restaurant.name}</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-slate-950 text-slate-300 p-4 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } shadow-xl md:shadow-none h-screen`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800/80">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-9 h-9 rounded-xl object-cover border border-orange-500/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-sm">
                SB
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-extrabold text-white text-sm truncate leading-tight">
                {restaurant.name}
              </h2>
              <span className="text-[11px] font-semibold text-orange-400">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.isExternalTab ? "_blank" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                  {link.isExternalTab && (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          {/* Customer Menu Live Preview */}
          <Link
            href={previewMenuUrl}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all"
          >
            <span>Preview Customer Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-2 py-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>SnapBite v1.0 SaaS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Online"></span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col max-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
