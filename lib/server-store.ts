// Server-Side Authoritative Shared State Store
// Supports both in-memory cloud persistence and Supabase PostgreSQL

import fs from "fs";
import path from "path";
import os from "os";
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
  User,
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
  INITIAL_USERS,
} from "./store/demo-data";
import { generateOrderNumber, generateToken } from "./utils";
import { UniversalDB } from "./db/universal-adapter";

const PERSISTENCE_FILE = path.join(os.tmpdir(), "snapbite_server_store.json");

function loadPersistedState() {
  try {
    if (fs.existsSync(PERSISTENCE_FILE)) {
      const content = fs.readFileSync(PERSISTENCE_FILE, "utf-8");
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (e) {
    // Ignore read errors
  }
  return null;
}

export function savePersistedState() {
  try {
    if (global.__SNAPBITE_SERVER_STORE__) {
      UniversalDB.saveState(global.__SNAPBITE_SERVER_STORE__).catch(() => {});
    }
  } catch (e) {
    // Ignore write errors
  }
}

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
    users: User[];
  } | undefined;
}

if (!global.__SNAPBITE_SERVER_STORE__) {
  const persisted = loadPersistedState();
  if (persisted && Array.isArray(persisted.tables) && persisted.tables.length > 0) {
    if (!persisted.users) persisted.users = INITIAL_USERS;
    global.__SNAPBITE_SERVER_STORE__ = persisted;
  } else {
    global.__SNAPBITE_SERVER_STORE__ = {
      restaurants: [INITIAL_RESTAURANT],
      tables: INITIAL_TABLES,
      categories: INITIAL_CATEGORIES,
      menuItems: INITIAL_MENU_ITEMS,
      addons: INITIAL_ADDONS,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      waiterRequests: INITIAL_WAITER_REQUESTS,
      users: INITIAL_USERS,
    };
  }
}

// Background cloud database hydration if PostgreSQL or MongoDB is configured in environment
if (typeof window === "undefined") {
  UniversalDB.loadState()
    .then((cloudState) => {
      if (cloudState && Array.isArray(cloudState.tables) && cloudState.tables.length > 0) {
        if (!cloudState.users) cloudState.users = INITIAL_USERS;
        global.__SNAPBITE_SERVER_STORE__ = cloudState;
      }
    })
    .catch(() => {});
}

const store = global.__SNAPBITE_SERVER_STORE__!;

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
    savePersistedState();
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
    savePersistedState();
    return newRest;
  }

  // TABLES
  static getTables(restaurantId?: string): Table[] {
    if (!restaurantId) return store.tables;
    return store.tables.filter((t) => t.restaurant_id === restaurantId);
  }

  static getTableByToken(token: string, autoRegisterFallback: boolean = true): Table | undefined {
    let match = store.tables.find((t) => t.qr_token === token);
    if (!match && autoRegisterFallback && token && token.startsWith("tbl_tok_")) {
      const num = store.tables.length + 1;
      match = {
        id: `tbl_${Date.now()}`,
        restaurant_id: store.restaurants[0]?.id || "a0000000-0000-0000-0000-000000000001",
        table_number: `Table ${num}`,
        qr_token: token,
        capacity: 4,
        status: "available",
        created_at: new Date().toISOString(),
      };
      store.tables.push(match);
      savePersistedState();
    }
    return match;
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
    savePersistedState();
    return updated;
  }

  static addTable(tableData: Partial<Table> & { restaurant_id: string; table_number: string }): Table {
    const newTable: Table = {
      id: tableData.id || `tbl_${Date.now()}`,
      restaurant_id: tableData.restaurant_id,
      table_number: tableData.table_number,
      qr_token: tableData.qr_token || generateToken("tbl_tok"),
      capacity: tableData.capacity || 4,
      status: tableData.status || "available",
      created_at: tableData.created_at || new Date().toISOString(),
    };
    const existingIndex = store.tables.findIndex(
      (t) => t.id === newTable.id || t.qr_token === newTable.qr_token
    );
    if (existingIndex >= 0) {
      store.tables[existingIndex] = { ...store.tables[existingIndex], ...newTable };
    } else {
      store.tables.push(newTable);
    }
    savePersistedState();
    return newTable;
  }

  static syncTables(incomingTables: Table[]): Table[] {
    const map = new Map<string, Table>();
    store.tables.forEach((t) => map.set(t.id, t));
    incomingTables.forEach((t) => {
      map.set(t.id, { ...(map.get(t.id) || {}), ...t });
    });
    store.tables = Array.from(map.values());
    savePersistedState();
    return store.tables;
  }

  static deleteTable(id: string): void {
    store.tables = store.tables.filter((t) => t.id !== id);
    savePersistedState();
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
    savePersistedState();
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
    savePersistedState();
    return newItem;
  }

  static deleteMenuItem(id: string): void {
    store.menuItems = store.menuItems.filter((i) => i.id !== id);
    savePersistedState();
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
    bkashTrxId?: string;
    bkashSenderNumber?: string;
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
      bkash_trx_id: params.bkashTrxId || null,
      bkash_sender_number: params.bkashSenderNumber || null,
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

    savePersistedState();
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

    savePersistedState();
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
    savePersistedState();
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
    savePersistedState();
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
    savePersistedState();
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
    savePersistedState();
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
    savePersistedState();
    return updated;
  }

  static deleteReview(id: string): void {
    store.reviews = store.reviews.filter((r) => r.id !== id);
    savePersistedState();
  }

  // USERS & AUTH
  static getUsers(): User[] {
    if (!store.users) store.users = [...INITIAL_USERS];
    return store.users;
  }

  static getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static createUser(userData: Omit<User, "id" | "created_at">): User {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: userData.email.toLowerCase().trim(),
      created_at: new Date().toISOString(),
    };
    if (!store.users) store.users = [];
    store.users.push(newUser);
    savePersistedState();
    return newUser;
  }

  static createRestaurantWithOwner(params: {
    fullName: string;
    email: string;
    password?: string;
    restaurantName: string;
    phone?: string;
    slug?: string;
  }): { user: User; restaurant: Restaurant } {
    const cleanEmail = params.email.toLowerCase().trim();
    const existing = this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    let baseSlug = (params.slug || params.restaurantName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!baseSlug) baseSlug = `restaurant-${Date.now()}`;

    let finalSlug = baseSlug;
    let counter = 1;
    while (store.restaurants.some((r) => r.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const restId = `rest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRestaurant: Restaurant = {
      id: restId,
      name: params.restaurantName.trim(),
      slug: finalSlug,
      logo_url: null,
      cover_image_url: null,
      description: `Welcome to ${params.restaurantName.trim()}! Scan QR code at your table to order.`,
      address: null,
      phone: params.phone?.trim() || null,
      currency: "৳",
      tax_percentage: 5,
      service_charge_percentage: 0,
      opening_time: "10:00 AM",
      closing_time: "11:00 PM",
      is_active: true,
      bkash_number: params.phone?.trim() || "01712345678",
      bkash_type: "merchant",
      bkash_instructions: "Make payment to our bKash number with your table number as reference.",
      bkash_enabled: true,
      bkash_mode: "sandbox",
      bkash_pgw_enabled: true,
      cash_enabled: true,
      order_tracking_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.restaurants.push(newRestaurant);

    const newUser = this.createUser({
      email: cleanEmail,
      password: params.password || "admin",
      full_name: params.fullName.trim(),
      phone: params.phone?.trim() || null,
      restaurant_id: restId,
      role: "owner",
    });

    // Initialize 5 starter tables for this new restaurant
    for (let i = 1; i <= 5; i++) {
      const pad = i.toString().padStart(2, "0");
      store.tables.push({
        id: `tbl_${restId}_${pad}`,
        restaurant_id: restId,
        table_number: `Table ${i}`,
        qr_token: `tbl_tok_${finalSlug}_${pad}`,
        capacity: i % 2 === 0 ? 4 : 2,
        status: "available",
        created_at: new Date().toISOString(),
      });
    }

    // Initialize starter categories
    const catMainsId = `cat_${restId}_mains`;
    const catBeveragesId = `cat_${restId}_drinks`;
    store.categories.push(
      {
        id: catMainsId,
        restaurant_id: restId,
        name: "Main Dishes",
        description: "Chef's signature main courses",
        image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: catBeveragesId,
        restaurant_id: restId,
        name: "Beverages",
        description: "Refreshing drinks and coolers",
        image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
        display_order: 2,
        is_active: true,
        created_at: new Date().toISOString(),
      }
    );

    // Initialize starter menu items
    store.menuItems.push(
      {
        id: `item_${restId}_1`,
        restaurant_id: restId,
        category_id: catMainsId,
        name: "House Special Platter",
        description: "Chef's special savory dish served with house sauce and fresh sides",
        price: 350,
        image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
        preparation_time: 15,
        calories: 520,
        is_available: true,
        is_featured: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `item_${restId}_2`,
        restaurant_id: restId,
        category_id: catBeveragesId,
        name: "Fresh Mint Lemonade",
        description: "Chilled fresh lemon juice infused with crushed garden mint",
        price: 90,
        image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
        preparation_time: 5,
        calories: 120,
        is_available: true,
        is_featured: false,
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    savePersistedState();
    return { user: newUser, restaurant: newRestaurant };
  }
}
