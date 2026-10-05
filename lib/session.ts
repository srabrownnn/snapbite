'use client';

import { generateToken } from "./utils";

export interface StoredCustomerSession {
  sessionId: string;
  restaurantId: string;
  tableId: string;
  qrToken: string;
  createdAt: string;
  lastActivity: string;
  customerName?: string;
}

const SESSION_PREFIX = "snapbite_session_";

export function getOrCreateCustomerSession(restaurantId: string, tableId: string, qrToken: string): StoredCustomerSession {
  if (typeof window === "undefined") {
    return {
      sessionId: `sess_ssr_${Date.now()}`,
      restaurantId,
      tableId,
      qrToken,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
  }

  const key = `${SESSION_PREFIX}${restaurantId}_${tableId}`;
  try {
    const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    if (raw) {
      const parsed: StoredCustomerSession = JSON.parse(raw);
      // Validate that session qr token matches
      if (parsed.qrToken === qrToken) {
        parsed.lastActivity = new Date().toISOString();
        window.sessionStorage.setItem(key, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (e) {
    console.error("Session reading error:", e);
  }

  const newSession: StoredCustomerSession = {
    sessionId: generateToken("sess"),
    restaurantId,
    tableId,
    qrToken,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(key, JSON.stringify(newSession));
    window.localStorage.setItem(key, JSON.stringify(newSession));
  } catch (e) {
    console.error("Session saving error:", e);
  }

  return newSession;
}

export function saveCustomerName(restaurantId: string, tableId: string, name: string): void {
  if (typeof window === "undefined") return;
  const key = `${SESSION_PREFIX}${restaurantId}_${tableId}`;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw) {
      const parsed: StoredCustomerSession = JSON.parse(raw);
      parsed.customerName = name;
      window.sessionStorage.setItem(key, JSON.stringify(parsed));
      window.localStorage.setItem(key, JSON.stringify(parsed));
    }
  } catch (e) {
    console.error("Customer name save error:", e);
  }
}
