// Server-Side Authoritative Shared State Store
// Supports both in-memory cloud persistence and Supabase PostgreSQL

import {
  Restaurant,
  Table,
  Category,
  MenuItem,
  AddOn,
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  Review,
  WaiterRequest,
  WaiterRequestType,
  OrderItem,
  CartItem,
} from "@/types/database";
import {
  INITIAL_RESTAURANT,
  INITIAL_TABLES,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ADDONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_WAITER_REQUESTS,
} from "./store/demo-data";
import { generateOrderNumber, generateToken } from "./utils";

// Global cache on Node.js global to persist across API route invocations in serverless warm containers
declare global {
  // eslint-disable-next-line no-var
  var __SNAPBITE_SERVER_STORE__: {
    restaurants: Restaurant[];
    tables: Table[];
    categories: Category[];
    menuItems: MenuItem[];
    addons: AddOn[];
    orders: Order[];
    reviews: Review[];
    waiterRequests: WaiterRequest[];
  } | undefined;
}

if (!global.__SNAPBITE_SERVER_STORE__) {
  global.__SNAPBITE_SERVER_STORE__ = {
    restaurants: [INITIAL_RESTAURANT],
    tables: INITIAL_TABLES,
    categories: INITIAL_CATEGORIES,
    menuItems: INITIAL_MENU_ITEMS,
    addons: INITIAL_ADDONS,
    orders: INITIAL_ORDERS,
    reviews: INITIAL_REVIEWS,
    waiterRequests: INITIAL_WAITER_REQUESTS,
  };
}

const store = global.__SNAPBITE_SERVER_STORE__;

export class ServerStore {
  // RESTAURANTS
  static getRestaurant(idOrSlug?: string): Restaurant {
    if (!idOrSlug) return store.restaurants[0];
    const match = store.restaurants.find((r) => r.id === idOrSlug || r.slug === idOrSlug);
    return match || store.restaurants[0];
  }

  static getAllRestaurants(): Restaurant[] {
    return store.restaurants;
  }

  static updateRestaurant(updates: Partial<Restaurant>): Restaurant {
    const current = this.getRestaurant(updates.id);
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    store.restaurants = store.restaurants.map((r) => (r.id === updated.id ? updated : r));
    return updated;
  }

  static createRestaurant(data: Omit<Restaurant, "id" | "created_at" | "updated_at">): Restaurant {
    const newRest: Restaurant = {
      ...data,
      id: `rest_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.restaurants.push(newRest);
    return newRest;
  }

  // TABLES
  static getTables(restaurantId?: string): Table[] {
    if (!restaurantId) return store.tables;
    return store.tables.filter((t) => t.restaurant_id === restaurantId);
  }

  static getTableByToken(token: string): Table | undefined {
    return store.tables.find((t) => t.qr_token === token);
  }

  static getTableById(id: string): Table | undefined {
    return store.tables.find((t) => t.id === id);
  }

  static updateTable(id: string, updates: Partial<Table>): Table | undefined {
    let updated: Table | undefined;
    store.tables = store.tables.map((t) => {
      if (t.id === id) {
        updated = { ...t, ...updates };
        return updated;
      }
      return t;
    });
    return updated;
  }

  static addTable(restaurantId: string, tableNumber: string, capacity: number = 4): Table {
    const newTable: Table = {
      id: `tbl_${Date.now()}`,
      restaurant_id: restaurantId,
      table_number: tableNumber,
      qr_token: generateToken("tbl_tok"),
      capacity,
      status: "available",
      created_at: new Date().toISOString(),
    };
    store.tables.push(newTable);
    return newTable;
  }

  static deleteTable(id: string): void {
    store.tables = store.tables.filter((t) => t.id !== id);
  }

  // CATEGORIES
  static getCategories(restaurantId?: string): Category[] {
    if (!restaurantId) return store.categories;
    return store.categories.filter((c) => c.restaurant_id === restaurantId);
  }

  // MENU ITEMS
  static getMenuItems(restaurantId?: string): MenuItem[] {
    if (!restaurantId) return store.menuItems;
    return store.menuItems.filter((i) => i.restaurant_id === restaurantId);
  }

  static getMenuItemById(id: string): MenuItem | undefined {
    return store.menuItems.find((i) => i.id === id);
  }

  static updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | undefined {
    let updated: MenuItem | undefined;
    store.menuItems = store.menuItems.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return item;
    });
    return updated;
  }

  static addMenuItem(data: Omit<MenuItem, "id" | "created_at" | "updated_at">): MenuItem {
    const newItem: MenuItem = {
      ...data,
      id: `item_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.menuItems.unshift(newItem);
    return newItem;
  }

  static deleteMenuItem(id: string): void {
    store.menuItems = store.menuItems.filter((i) => i.id !== id);
  }

  // ADDONS
  static getAddons(restaurantId?: string): AddOn[] {
    if (!restaurantId) return store.addons;
    return store.addons.filter((a) => a.restaurant_id === restaurantId);
  }

  // ORDERS
  static getOrders(restaurantId?: string): Order[] {
    let list = store.orders.map((o) => ({
      ...o,
      table: o.table || store.tables.find((t) => t.id === o.table_id),
    }));
    if (restaurantId) {
      list = list.filter((o) => o.restaurant_id === restaurantId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.order_number === id);
  }

  static createOrder(params: {
    restaurantId: string;
    tableId: string;
    sessionId?: string;
    customerName?: string;
    customerPhone?: string;
    customerNote?: string;
    cartItems: CartItem[];
    paymentMethod?: PaymentMethod;
  }): Order {
    const restaurant = this.getRestaurant(params.restaurantId);
    const table = this.getTableById(params.tableId);
    const orderId = `ord_${Date.now()}`;
    const orderNumber = generateOrderNumber();

    let calculatedSubtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const cartItem of params.cartItems) {
      const serverMenuItem = this.getMenuItemById(cartItem.menuItem.id);
      const unitPrice = serverMenuItem ? serverMenuItem.price : cartItem.unitPrice;

      let addonTotal = 0;
      const orderAddons = cartItem.selectedAddons.map((addon) => {
        addonTotal += addon.price;
        return {
          addon_name_snapshot: addon.name,
          price: addon.price,
          quantity: 1,
        };
      });

      const lineTotal = (unitPrice + addonTotal) * cartItem.quantity;
      calculatedSubtotal += lineTotal;

      orderItems.push({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        order_id: orderId,
        menu_item_id: cartItem.menuItem.id,
        item_name_snapshot: serverMenuItem ? serverMenuItem.name : cartItem.menuItem.name,
        quantity: cartItem.quantity,
        unit_price: unitPrice + addonTotal,
        subtotal: lineTotal,
        customer_note: cartItem.specialInstructions || null,
        addons: orderAddons,
      });
    }

    const tax = Number(((calculatedSubtotal * (restaurant.tax_percentage || 0)) / 100).toFixed(2));
    const serviceCharge = Number(
      ((calculatedSubtotal * (restaurant.service_charge_percentage || 0)) / 100).toFixed(2)
    );
    const total = Number((calculatedSubtotal + tax + serviceCharge).toFixed(2));

    const newOrder: Order = {
      id: orderId,
      restaurant_id: params.restaurantId,
      table_id: params.tableId,
      session_id: params.sessionId || `sess_${Date.now()}`,
      order_number: orderNumber,
      customer_name: params.customerName || "Table Guest",
      customer_phone: params.customerPhone || null,
      subtotal: calculatedSubtotal,
      tax,
      service_charge: serviceCharge,
      discount: 0,
      total,
      status: "pending",
      payment_status: params.paymentMethod === "online" ? "paid" : "unpaid",
      payment_method: params.paymentMethod || "cash",
      customer_note: params.customerNote || null,
      estimated_prep_time: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderItems,
      table,
    };

    store.orders.unshift(newOrder);

    // Set table status to occupied
    if (table && table.status === "available") {
      this.updateTable(table.id, { status: "occupied" });
    }

    return newOrder;
  }

  static updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
    let updated: Order | undefined;
    store.orders = store.orders.map((o) => {
      if (o.id === orderId) {
        updated = {
          ...o,
          status,
          updated_at: new Date().toISOString(),
          payment_status: status === "completed" && o.payment_status === "unpaid" ? "paid" : o.payment_status,
        };
        return updated;
      }
      return o;
    });

    if (updated && (status === "completed" || status === "cancelled") && updated.table_id) {
      const activeForTable = store.orders.filter(
        (o) => o.table_id === updated?.table_id && !["completed", "cancelled"].includes(o.status)
      );
      if (activeForTable.length === 0) {
        this.updateTable(updated.table_id, { status: "available" });
      }
    }

    return updated;
  }

  static updateOrderPayment(orderId: string, paymentStatus: PaymentStatus, method?: PaymentMethod): Order | undefined {
    let updated: Order | undefined;
    store.orders = store.orders.map((o) => {
      if (o.id === orderId) {
        updated = {
          ...o,
          payment_status: paymentStatus,
          payment_method: method || o.payment_method,
          updated_at: new Date().toISOString(),
        };
        return updated;
      }
      return o;
    });
    return updated;
  }

  // WAITER REQUESTS
  static getWaiterRequests(restaurantId?: string): WaiterRequest[] {
    let list = store.waiterRequests.map((r) => ({
      ...r,
      table: r.table || store.tables.find((t) => t.id === r.table_id),
    }));
    if (restaurantId) {
      list = list.filter((r) => r.restaurant_id === restaurantId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static createWaiterRequest(restaurantId: string, tableId: string, type: WaiterRequestType): WaiterRequest {
    const table = this.getTableById(tableId);
    const newReq: WaiterRequest = {
      id: `wr_${Date.now()}`,
      restaurant_id: restaurantId,
      table_id: tableId,
      type,
      status: "pending",
      created_at: new Date().toISOString(),
      resolved_at: null,
      table,
    };
    store.waiterRequests.unshift(newReq);
    return newReq;
  }

  static resolveWaiterRequest(id: string): WaiterRequest | undefined {
    let updated: WaiterRequest | undefined;
    store.waiterRequests = store.waiterRequests.map((r) => {
      if (r.id === id) {
        updated = { ...r, status: "resolved", resolved_at: new Date().toISOString() };
        return updated;
      }
      return r;
    });
    return updated;
  }

  // REVIEWS
  static getReviews(restaurantId?: string, menuItemId?: string): Review[] {
    return store.reviews.filter((r) => {
      if (restaurantId && r.restaurant_id !== restaurantId) return false;
      if (menuItemId && r.menu_item_id !== menuItemId) return false;
      return true;
    });
  }

  static submitReview(params: {
    restaurantId: string;
    orderId?: string;
    menuItemId?: string;
    rating: number;
    reviewText: string;
    customerName: string;
  }): Review {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      restaurant_id: params.restaurantId,
      order_id: params.orderId || null,
      menu_item_id: params.menuItemId || null,
      rating: Math.max(1, Math.min(5, params.rating)),
      review_text: params.reviewText,
      customer_name: params.customerName || "Verified Guest",
      is_approved: true,
      created_at: new Date().toISOString(),
    };
    store.reviews.unshift(newRev);
    return newRev;
  }

  static toggleReviewApproval(id: string): Review | undefined {
    let updated: Review | undefined;
    store.reviews = store.reviews.map((r) => {
      if (r.id === id) {
        updated = { ...r, is_approved: !r.is_approved };
        return updated;
      }
      return r;
    });
    return updated;
  }

  static deleteReview(id: string): void {
    store.reviews = store.reviews.filter((r) => r.id !== id);
  }
}
