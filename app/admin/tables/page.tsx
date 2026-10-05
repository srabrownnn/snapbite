'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { Table, Restaurant, TableStatus } from "@/types/database";
import {
  generateTableQrDataUrl,
  generateTableQrSvg,
  downloadQrDataUrl,
  downloadSvgString,
  printTableCard,
  getTableScanUrl,
} from "@/lib/qr/generator";
import {
  QrCode,
  Plus,
  Printer,
  Download,
  RefreshCw,
  ExternalLink,
  Users,
  X,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function AdminTablesPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant());
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [origin, setOrigin] = useState("");

  const loadTables = () => {
    const currentRest = SnapBiteStore.getRestaurant();
    setRestaurant(currentRest);
    const list = SnapBiteStore.getTables(currentRest.id);
    setTables(list);
    return list;
  };

  useEffect(() => {
    loadTables();
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const openQrModal = async (tbl: Table) => {
    setSelectedTable(tbl);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://snapbite.local";
    const fullUrl = getTableScanUrl(baseUrl, restaurant.slug, tbl.qr_token);

    try {
      const dataUrl = await generateTableQrDataUrl(fullUrl, { width: 450 });
      const svg = await generateTableQrSvg(fullUrl);
      setQrDataUrl(dataUrl);
      setQrSvgString(svg);
    } catch (e) {
      console.error("QR Generation error:", e);
    }
  };

  const handleDownloadPng = () => {
    if (!selectedTable || !qrDataUrl) return;
    const filename = `${restaurant.slug}-${selectedTable.table_number.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    downloadQrDataUrl(qrDataUrl, filename);
  };

  const handleDownloadSvg = () => {
    if (!selectedTable || !qrSvgString) return;
    const filename = `${restaurant.slug}-${selectedTable.table_number.toLowerCase().replace(/\s+/g, "-")}-qr.svg`;
    downloadSvgString(qrSvgString, filename);
  };

  const handlePrintCard = () => {
    if (!selectedTable || !qrDataUrl) return;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://snapbite.local";
    const fullUrl = getTableScanUrl(baseUrl, restaurant.slug, selectedTable.qr_token);

    printTableCard({
      restaurantName: restaurant.name,
      tableNumber: selectedTable.table_number,
      qrDataUrl,
      scanUrl: fullUrl,
      logoUrl: restaurant.logo_url,
    });
  };

  const handleRegenerateToken = async (tbl: Table) => {
    if (confirm(`Regenerate QR token for ${tbl.table_number}? Existing printed QR codes will stop working.`)) {
      const updated = SnapBiteStore.regenerateQRToken(tbl.id);
      loadTables();
      if (updated && selectedTable?.id === tbl.id) {
        openQrModal(updated);
      }
    }
  };

  const handleStatusChange = (tbl: Table, status: TableStatus) => {
    SnapBiteStore.updateTable(tbl.id, { status });
    loadTables();
  };

  const handleDeleteTable = (tbl: Table) => {
    if (confirm(`Delete ${tbl.table_number}?`)) {
      SnapBiteStore.deleteTable(tbl.id);
      loadTables();
    }
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    SnapBiteStore.addTable(restaurant.id, newTableNumber.trim(), Number(newTableCapacity));
    setNewTableNumber("");
    setNewTableCapacity(4);
    setIsAddTableOpen(false);
    loadTables();
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Table & QR Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generate unique QR codes, print tabletop acrylic cards, and track table occupancy.
            </p>
          </div>

          <button
            onClick={() => setIsAddTableOpen(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Table</span>
          </button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map((tbl) => (
            <div
              key={tbl.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                      {tbl.table_number}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Capacity: {tbl.capacity} guests</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={tbl.status}
                    onChange={(e) => handleStatusChange(tbl, e.target.value as TableStatus)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                      tbl.status === "available"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : tbl.status === "occupied"
                        ? "bg-orange-50 text-orange-700 border-orange-300"
                        : tbl.status === "reserved"
                        ? "bg-purple-50 text-purple-700 border-purple-300"
                        : "bg-slate-100 text-slate-500 border-slate-300"
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-500 truncate">
                  Token: {tbl.qr_token}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => openQrModal(tbl)}
                  className="flex-1 py-2 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl border border-orange-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Get QR Code</span>
                </button>

                <Link
                  href={`/r/${restaurant.slug}/t/${tbl.qr_token}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Open live customer menu for this table"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleDeleteTable(tbl)}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  title="Delete table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* QR Code Presentation Modal */}
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="text-left">
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedTable.table_number} QR Code
                  </h3>
                  <p className="text-xs text-slate-500">{restaurant.name}</p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Image Display */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${selectedTable.table_number}`}
                    className="w-56 h-56 rounded-xl shadow-sm bg-white p-2"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                    Generating high-res QR...
                  </div>
                )}
              </div>

              {/* Target Scan URL */}
              <div className="text-left">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
                  Scan Destination URL
                </span>
                <input
                  type="text"
                  readOnly
                  value={getTableScanUrl(origin, restaurant.slug, selectedTable.qr_token)}
                  className="w-full px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 border border-slate-200"
                />
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={handleDownloadPng}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>PNG</span>
                </button>

                <button
                  onClick={handleDownloadSvg}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>SVG</span>
                </button>

                <button
                  onClick={handlePrintCard}
                  className="py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Card</span>
                </button>
              </div>

              {/* Regenerate Token */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleRegenerateToken(selectedTable)}
                  className="text-xs text-slate-500 hover:text-orange-600 font-semibold flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate QR Security Token</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Table Modal */}
        {isAddTableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">Add Dining Table</h3>
                <button
                  onClick={() => setIsAddTableOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTable} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Table Name/Number</label>
                  <input
                    type="text"
                    required
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="e.g. Table 21 or Rooftop 4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Guest Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTableOpen(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                  >
                    Create Table
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
