'use client';

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
} from "./demo-data";
import { generateOrderNumber, generateToken } from "@/lib/utils";

// Local storage keys
const STORAGE_KEYS = {
  RESTAURANTS: "snapbite_restaurants_v1",
  TABLES: "snapbite_tables_v1",
  CATEGORIES: "snapbite_categories_v1",
  MENU_ITEMS: "snapbite_menu_items_v1",
  ADDONS: "snapbite_addons_v1",
  ORDERS: "snapbite_orders_v1",
  REVIEWS: "snapbite_reviews_v1",
  WAITER_REQUESTS: "snapbite_waiter_requests_v1",
  CURRENT_RESTAURANT_ID: "snapbite_curr_rest_id",
};

// Safe localStorage access
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Broadcast event for multi-tab sync
    window.dispatchEvent(new CustomEvent("snapbite_store_updated", { detail: { key } }));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export class SnapBiteStore {
  // RESTAURANTS
  static getRestaurant(slugOrId?: string): Restaurant {
    const restaurants = getStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, [INITIAL_RESTAURANT]);
    if (!slugOrId) return restaurants[0] || INITIAL_RESTAURANT;
    const match = restaurants.find(r => r.slug === slugOrId || r.id === slugOrId);
    return match || restaurants[0] || INITIAL_RESTAURANT;
  }

  static getAllRestaurants(): Restaurant[] {
    return getStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, [INITIAL_RESTAURANT]);
  }

  static updateRestaurant(updated: Partial<Restaurant>): Restaurant {
    const current = this.getRestaurant(updated.id);
    const merged = { ...current, ...updated, updated_at: new Date().toISOString() };
    const list = this.getAllRestaurants().map(r => r.id === merged.id ? merged : r);
    setStorage(STORAGE_KEYS.RESTAURANTS, list);
    return merged;
  }

  static createRestaurant(restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Restaurant {
    const newRest: Restaurant = {
      ...restaurant,
      id: `rest_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const list = [...this.getAllRestaurants(), newRest];
    setStorage(STORAGE_KEYS.RESTAURANTS, list);
    return newRest;
  }

  // TABLES
  static getTables(restaurantId?: string): Table[] {
    const tables = getStorage<Table[]>(STORAGE_KEYS.TABLES, INITIAL_TABLES);
    if (!restaurantId) return tables;
    return tables.filter(t => t.restaurant_id === restaurantId);
  }

  static getTableByToken(token: string): Table | undefined {
    const tables = this.getTables();
    return tables.find(t => t.qr_token === token);
  }

  static getTableById(id: string): Table | undefined {
    const tables = this.getTables();
    return tables.find(t => t.id === id);
  }

  static addTable(restaurantId: string, tableNumber: string, capacity: number = 4): Table {
    const tables = this.getTables();
    const newTable: Table = {
      id: `tbl_${Date.now()}`,
      restaurant_id: restaurantId,
      table_number: tableNumber,
      qr_token: generateToken("tbl_tok"),
      capacity,
      status: "available",
      created_at: new Date().toISOString(),
    };
    const updated = [...tables, newTable];
    setStorage(STORAGE_KEYS.TABLES, updated);
    return newTable;
  }

  static updateTable(id: string, updates: Partial<Table>): Table | undefined {
    const tables = this.getTables();
    let updatedTable: Table | undefined;
    const updated = tables.map(t => {
      if (t.id === id) {
        updatedTable = { ...t, ...updates };
        return updatedTable;
      }
      return t;
    });
    setStorage(STORAGE_KEYS.TABLES, updated);
    return updatedTable;
  }

  static regenerateQRToken(id: string): Table | undefined {
    return this.updateTable(id, { qr_token: generateToken("tbl_tok") });
  }

  static deleteTable(id: string): void {
    const tables = this.getTables().filter(t => t.id !== id);
    setStorage(STORAGE_KEYS.TABLES, tables);
  }

  // CATEGORIES
  static getCategories(restaurantId?: string): Category[] {
    const categories = getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    if (!restaurantId) return categories;
    return categories.filter(c => c.restaurant_id === restaurantId).sort((a, b) => a.display_order - b.display_order);
  }

  static addCategory(restaurantId: string, name: string, description: string = "", image_url: string = ""): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      restaurant_id: restaurantId,
      name,
      description,
      image_url,
      display_order: categories.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.CATEGORIES, [...categories, newCategory]);
    return newCategory;
  }

  static updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const categories = this.getCategories();
    let updatedCategory: Category | undefined;
    const updated = categories.map(c => {
      if (c.id === id) {
        updatedCategory = { ...c, ...updates };
        return updatedCategory;
      }
      return c;
    });
    setStorage(STORAGE_KEYS.CATEGORIES, updated);
    return updatedCategory;
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories().filter(c => c.id !== id);
    setStorage(STORAGE_KEYS.CATEGORIES, categories);
  }

  // ADD-ONS
  static getAddons(restaurantId?: string): AddOn[] {
    const addons = getStorage<AddOn[]>(STORAGE_KEYS.ADDONS, INITIAL_ADDONS);
    if (!restaurantId) return addons;
    return addons.filter(a => a.restaurant_id === restaurantId);
  }

  static addAddon(restaurantId: string, name: string, price: number): AddOn {
    const addons = this.getAddons();
    const newAddon: AddOn = {
      id: `addon_${Date.now()}`,
      restaurant_id: restaurantId,
      name,
      price,
      is_available: true,
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.ADDONS, [...addons, newAddon]);
    return newAddon;
  }

  static updateAddon(id: string, updates: Partial<AddOn>): AddOn | undefined {
    const addons = this.getAddons();
    let updatedAddon: AddOn | undefined;
    const updated = addons.map(a => {
      if (a.id === id) {
        updatedAddon = { ...a, ...updates };
        return updatedAddon;
      }
      return a;
    });
    setStorage(STORAGE_KEYS.ADDONS, updated);
    return updatedAddon;
  }

  static deleteAddon(id: string): void {
    const addons = this.getAddons().filter(a => a.id !== id);
    setStorage(STORAGE_KEYS.ADDONS, addons);
  }

  // MENU ITEMS
  static getMenuItems(restaurantId?: string): MenuItem[] {
    const items = getStorage<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
    if (!restaurantId) return items;
    return items.filter(i => i.restaurant_id === restaurantId);
  }

  static getMenuItemById(id: string): MenuItem | undefined {
    return this.getMenuItems().find(i => i.id === id);
  }

  static addMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): MenuItem {
    const items = this.getMenuItems();
    const newItem: MenuItem = {
      ...item,
      id: `item_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.MENU_ITEMS, [newItem, ...items]);
    return newItem;
  }

  static updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | undefined {
    const items = this.getMenuItems();
    let updatedItem: MenuItem | undefined;
    const updated = items.map(i => {
      if (i.id === id) {
        updatedItem = { ...i, ...updates, updated_at: new Date().toISOString() };
        return updatedItem;
      }
      return i;
    });
    setStorage(STORAGE_KEYS.MENU_ITEMS, updated);
    return updatedItem;
  }

  static deleteMenuItem(id: string): void {
    const items = this.getMenuItems().filter(i => i.id !== id);
    setStorage(STORAGE_KEYS.MENU_ITEMS, items);
  }

  // ORDERS
  static getOrders(restaurantId?: string): Order[] {
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const tables = this.getTables();
    // Rehydrate table reference if missing
    const enriched = orders.map(o => ({
      ...o,
      table: o.table || tables.find(t => t.id === o.table_id),
    }));
    if (!restaurantId) return enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return enriched.filter(o => o.restaurant_id === restaurantId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id || o.order_number === id);
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

    // SERVER-SIDE PRICE VALIDATION
    // Calculate subtotal from authoritative menu item prices and add-on prices
    let calculatedSubtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const cartItem of params.cartItems) {
      const serverMenuItem = this.getMenuItemById(cartItem.menuItem.id);
      const unitPrice = serverMenuItem ? serverMenuItem.price : cartItem.unitPrice;
      
      let addonTotal = 0;
      const orderAddons = cartItem.selectedAddons.map(addon => {
        addonTotal += addon.price;
        return {
          addon_name_snapshot: addon.name,
          price: addon.price,
          quantity: 1,
        };
      });

      const itemLineTotal = (unitPrice + addonTotal) * cartItem.quantity;
      calculatedSubtotal += itemLineTotal;

      orderItems.push({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        order_id: orderId,
        menu_item_id: cartItem.menuItem.id,
        item_name_snapshot: serverMenuItem ? serverMenuItem.name : cartItem.menuItem.name,
        quantity: cartItem.quantity,
        unit_price: unitPrice + addonTotal,
        subtotal: itemLineTotal,
        customer_note: cartItem.specialInstructions || null,
        addons: orderAddons,
      });
    }

    const tax = Number(((calculatedSubtotal * (restaurant.tax_percentage || 0)) / 100).toFixed(2));
    const serviceCharge = Number(((calculatedSubtotal * (restaurant.service_charge_percentage || 0)) / 100).toFixed(2));
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
      table: table,
    };

    const currentOrders = this.getOrders();
    setStorage(STORAGE_KEYS.ORDERS, [newOrder, ...currentOrders]);

    // Mark table as occupied
    if (table && table.status === "available") {
      this.updateTable(table.id, { status: "occupied" });
    }

    return newOrder;
  }

  // STATE MACHINE STATUS PROGRESSION
  // PENDING -> ACCEPTED -> PREPARING -> READY -> SERVED -> COMPLETED (or CANCELLED)
  static updateOrderStatus(orderId: string, newStatus: OrderStatus): Order | undefined {
    const orders = this.getOrders();
    let updatedOrder: Order | undefined;

    const updated = orders.map(o => {
      if (o.id === orderId) {
        // Validation check for status transition
        updatedOrder = {
          ...o,
          status: newStatus,
          updated_at: new Date().toISOString(),
          // If status is completed and payment is cash, mark as paid if completed
          payment_status: newStatus === "completed" && o.payment_status === "unpaid" ? "paid" : o.payment_status,
        };
        return updatedOrder;
      }
      return o;
    });

    setStorage(STORAGE_KEYS.ORDERS, updated);

    // If order is completed or cancelled, check if table has any other active orders
    if (updatedOrder && (newStatus === "completed" || newStatus === "cancelled") && updatedOrder.table_id) {
      const activeForTable = updated.filter(
        o => o.table_id === updatedOrder?.table_id &&
        !["completed", "cancelled"].includes(o.status)
      );
      if (activeForTable.length === 0) {
        this.updateTable(updatedOrder.table_id, { status: "available" });
      }
    }

    // Trigger notification event for customers/kitchen
    if (typeof window !== "undefined" && updatedOrder) {
      window.dispatchEvent(
        new CustomEvent("snapbite_order_status_change", {
          detail: { orderId, status: newStatus, order: updatedOrder },
        })
      );
    }

    return updatedOrder;
  }

  static updateOrderPaymentStatus(orderId: string, status: PaymentStatus, method?: PaymentMethod): Order | undefined {
    const orders = this.getOrders();
    let updatedOrder: Order | undefined;

    const updated = orders.map(o => {
      if (o.id === orderId) {
        updatedOrder = {
          ...o,
          payment_status: status,
          payment_method: method || o.payment_method,
          updated_at: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return o;
    });

    setStorage(STORAGE_KEYS.ORDERS, updated);
    return updatedOrder;
  }

  // WAITER REQUESTS
  static getWaiterRequests(restaurantId?: string): WaiterRequest[] {
    const requests = getStorage<WaiterRequest[]>(STORAGE_KEYS.WAITER_REQUESTS, INITIAL_WAITER_REQUESTS);
    const tables = this.getTables();
    const enriched = requests.map(r => ({
      ...r,
      table: r.table || tables.find(t => t.id === r.table_id),
    }));
    if (!restaurantId) return enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return enriched.filter(r => r.restaurant_id === restaurantId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static createWaiterRequest(restaurantId: string, tableId: string, type: WaiterRequestType): WaiterRequest {
    const table = this.getTableById(tableId);
    const newRequest: WaiterRequest = {
      id: `wr_${Date.now()}`,
      restaurant_id: restaurantId,
      table_id: tableId,
      type,
      status: "pending",
      created_at: new Date().toISOString(),
      resolved_at: null,
      table,
    };
    const current = this.getWaiterRequests();
    setStorage(STORAGE_KEYS.WAITER_REQUESTS, [newRequest, ...current]);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("snapbite_waiter_call", { detail: { request: newRequest } })
      );
    }
    return newRequest;
  }

  static resolveWaiterRequest(id: string): void {
    const current = this.getWaiterRequests();
    const updated = current.map(r => {
      if (r.id === id) {
        return { ...r, status: "resolved" as const, resolved_at: new Date().toISOString() };
      }
      return r;
    });
    setStorage(STORAGE_KEYS.WAITER_REQUESTS, updated);
  }

  // REVIEWS
  static getReviews(restaurantId?: string, menuItemId?: string): Review[] {
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    return reviews.filter(r => {
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
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      restaurant_id: params.restaurantId,
      order_id: params.orderId || null,
      menu_item_id: params.menuItemId || null,
      rating: Math.max(1, Math.min(5, params.rating)),
      review_text: params.reviewText,
      customer_name: params.customerName || "Verified Guest",
      is_approved: true, // Auto-approved by default in demo
      created_at: new Date().toISOString(),
    };
    const reviews = this.getReviews();
    setStorage(STORAGE_KEYS.REVIEWS, [newReview, ...reviews]);
    return newReview;
  }

  static toggleReviewApproval(id: string): Review | undefined {
    const reviews = this.getReviews();
    let updatedReview: Review | undefined;
    const updated = reviews.map(r => {
      if (r.id === id) {
        updatedReview = { ...r, is_approved: !r.is_approved };
        return updatedReview;
      }
      return r;
    });
    setStorage(STORAGE_KEYS.REVIEWS, updated);
    return updatedReview;
  }

  static deleteReview(id: string): void {
    const reviews = this.getReviews().filter(r => r.id !== id);
    setStorage(STORAGE_KEYS.REVIEWS, reviews);
  }

  // RESET TO DEMO DATA
  static resetToDemoData(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEYS.RESTAURANTS);
    window.localStorage.removeItem(STORAGE_KEYS.TABLES);
    window.localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    window.localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
    window.localStorage.removeItem(STORAGE_KEYS.ADDONS);
    window.localStorage.removeItem(STORAGE_KEYS.ORDERS);
    window.localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    window.localStorage.removeItem(STORAGE_KEYS.WAITER_REQUESTS);
    window.dispatchEvent(new CustomEvent("snapbite_store_updated", { detail: { key: "all" } }));
  }
}
