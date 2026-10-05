'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, MenuItem, AddOn } from "@/types/database";

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, selectedAddons: AddOn[], specialInstructions: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  taxAmount: (taxPercentage: number) => number;
  serviceChargeAmount: (servicePercentage: number) => number;
  totalWithTaxes: (taxPercentage: number, servicePercentage: number) => number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  tableId,
}: {
  children: React.ReactNode;
  tableId: string;
}) {
  const storageKey = `snapbite_cart_${tableId}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart:", e);
    } finally {
      setIsInitialized(true);
    }
  }, [storageKey]);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [items, isInitialized, storageKey]);

  const addItem = (
    menuItem: MenuItem,
    quantity: number,
    selectedAddons: AddOn[],
    specialInstructions: string
  ) => {
    const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = menuItem.price + addonTotal;
    const lineTotal = unitPrice * quantity;

    // Check if identical item (same addons, same special instructions) exists
    const addonIds = selectedAddons.map(a => a.id).sort().join(",");
    const existingIndex = items.findIndex(
      i =>
        i.menuItem.id === menuItem.id &&
        i.specialInstructions.trim() === specialInstructions.trim() &&
        i.selectedAddons.map(a => a.id).sort().join(",") === addonIds
    );

    if (existingIndex > -1) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].lineTotal = updated[existingIndex].unitPrice * newQty;
      setItems(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        menuItem,
        quantity,
        selectedAddons,
        specialInstructions,
        unitPrice,
        lineTotal,
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.cartItemId === cartItemId
          ? { ...i, quantity: newQuantity, lineTotal: i.unitPrice * newQuantity }
          : i
      )
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const taxAmount = (taxPercentage: number) => {
    return Number(((subtotal * (taxPercentage || 0)) / 100).toFixed(2));
  };

  const serviceChargeAmount = (servicePercentage: number) => {
    return Number(((subtotal * (servicePercentage || 0)) / 100).toFixed(2));
  };

  const totalWithTaxes = (taxPercentage: number, servicePercentage: number) => {
    return Number((subtotal + taxAmount(taxPercentage) + serviceChargeAmount(servicePercentage)).toFixed(2));
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        taxAmount,
        serviceChargeAmount,
        totalWithTaxes,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
