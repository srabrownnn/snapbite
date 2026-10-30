import { ServerStore } from "./server-store";
import { Order, Restaurant, User, Table } from "@/types/database";

// Fallback key for development if environment variable is not configured
const DEFAULT_DEV_KEY = "snapbite_master_key";

/**
 * Validates whether the incoming request contains a valid SaaS Master Management API key.
 * Accepts header: 'x-saas-api-key' or 'Authorization: Bearer <key>'
 */
export function validateSaaSRequest(req: Request): { authorized: boolean; error?: string } {
  const configuredKey = process.env.SAAS_MANAGEMENT_API_KEY || DEFAULT_DEV_KEY;

  const headerApiKey = req.headers.get("x-saas-api-key");
  const authHeader = req.headers.get("authorization");

  let providedKey: string | null = null;
  if (headerApiKey) {
    providedKey = headerApiKey.trim();
  } else if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    providedKey = authHeader.substring(7).trim();
  }

  if (!providedKey) {
    return {
      authorized: false,
      error: "Missing SaaS API Key. Please provide 'x-saas-api-key' header or 'Authorization: Bearer <key>'.",
    };
  }

  if (providedKey !== configuredKey) {
    return {
      authorized: false,
      error: "Unauthorized: Invalid SaaS API Key.",
    };
  }

  return { authorized: true };
}

export interface SaaSProductMetrics {
  product: {
    id: string;
    name: string;
    slug: string;
    version: string;
    environment: string;
    status: "operational" | "degraded" | "maintenance";
    uptime_seconds: number;
    timestamp: string;
  };
  summary: {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    owner_users: number;
    staff_users: number;
    total_tables: number;
    occupied_tables: number;
    total_orders: number;
    active_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_gmv: number;
    currency: string;
    average_order_value: number;
  };
  payments: {
    bkash_volume: number;
    cash_volume: number;
    bkash_transactions_count: number;
    cash_transactions_count: number;
  };
  tenants: Array<{
    id: string;
    name: string;
    slug: string;
    owner_name: string | null;
    owner_email: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    tables_count: number;
    orders_count: number;
    revenue: number;
  }>;
}

/**
 * Aggregates live system metrics across all tenants in SnapBite
 */
export function getSaaSMetrics(): SaaSProductMetrics {
  const restaurants: Restaurant[] = ServerStore.getAllRestaurants();
  const users: User[] = ServerStore.getUsers();
  const tables: Table[] = ServerStore.getTables();
  const orders: Order[] = ServerStore.getOrders();

  const activeRestaurants = restaurants.filter((r) => r.is_active !== false);

  const ownerUsers = users.filter((u) => u.role === "owner");
  const staffUsers = users.filter((u) => u.role !== "owner");

  const occupiedTables = tables.filter((t) => t.status === "occupied");

  // Order stats
  const activeStatuses = new Set(["pending", "accepted", "preparing", "ready"]);
  const activeOrders = orders.filter((o) => activeStatuses.has(o.status));
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "served");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  // GMV / Financials (excluding cancelled orders)
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalGmv = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const bkashOrders = validOrders.filter((o) => o.payment_method === "bkash");
  const cashOrders = validOrders.filter((o) => o.payment_method === "cash");

  const bkashVolume = bkashOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const cashVolume = cashOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const aov = validOrders.length > 0 ? Math.round(totalGmv / validOrders.length) : 0;

  // Tenant summaries
  const tenantSummaries = restaurants.map((r) => {
    const rUsers = users.filter((u) => u.restaurant_id === r.id);
    const owner = rUsers.find((u) => u.role === "owner") || rUsers[0];
    const rTables = tables.filter((t) => t.restaurant_id === r.id);
    const rOrders = validOrders.filter((o) => o.restaurant_id === r.id);
    const rRevenue = rOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      owner_name: owner ? owner.full_name : null,
      owner_email: owner ? owner.email : null,
      phone: r.phone || owner?.phone || null,
      is_active: r.is_active !== false,
      created_at: r.created_at,
      tables_count: rTables.length,
      orders_count: rOrders.length,
      revenue: rRevenue,
    };
  });

  return {
    product: {
      id: "snapbite-qr-saas",
      name: "SnapBite QR Restaurant OS",
      slug: "snapbite",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      status: "operational",
      uptime_seconds: Math.floor(process.uptime ? process.uptime() : 0),
      timestamp: new Date().toISOString(),
    },
    summary: {
      total_tenants: restaurants.length,
      active_tenants: activeRestaurants.length,
      total_users: users.length,
      owner_users: ownerUsers.length,
      staff_users: staffUsers.length,
      total_tables: tables.length,
      occupied_tables: occupiedTables.length,
      total_orders: orders.length,
      active_orders: activeOrders.length,
      completed_orders: completedOrders.length,
      cancelled_orders: cancelledOrders.length,
      total_gmv: totalGmv,
      currency: "৳",
      average_order_value: aov,
    },
    payments: {
      bkash_volume: bkashVolume,
      cash_volume: cashVolume,
      bkash_transactions_count: bkashOrders.length,
      cash_transactions_count: cashOrders.length,
    },
    tenants: tenantSummaries,
  };
}

/**
 * Dispatches an event payload to a central SaaS Management Hub webhook URL (if configured)
 */
export async function dispatchSaaSEvent(eventType: string, eventData: any): Promise<void> {
  const webhookUrl = process.env.SAAS_HUB_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      event: eventType,
      product: "snapbite",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      data: eventData,
    };

    // Non-blocking fire-and-forget fetch
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-saas-source": "snapbite",
        "x-saas-event": eventType,
        ...(process.env.SAAS_MANAGEMENT_API_KEY
          ? { "x-saas-api-key": process.env.SAAS_MANAGEMENT_API_KEY }
          : {}),
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn("[SaaS Hub Webhook Dispatch Failed]:", err.message);
    });
  } catch (e: any) {
    console.warn("[SaaS Hub Webhook Error]:", e.message);
  }
}
