// SnapBite TypeScript Schema Definitions

export type RestaurantRole = 'owner' | 'manager' | 'kitchen' | 'waiter' | 'super_admin';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'inactive';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'bkash' | 'nagad' | 'online' | 'unpaid';

export type WaiterRequestType = 'call_waiter' | 'request_bill' | 'assistance';

export type WaiterRequestStatus = 'pending' | 'in_progress' | 'resolved';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  currency: string;
  tax_percentage: number;
  service_charge_percentage: number;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantUser {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: RestaurantRole;
  created_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_token: string;
  capacity: number;
  status: TableStatus;
  created_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AddOn {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  is_available: boolean;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  preparation_time: number;
  calories: number | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  add_ons?: AddOn[];
  images?: string[];
  category?: Category;
}

export interface OrderItemAddon {
  id?: string;
  order_item_id?: string;
  addon_id?: string;
  addon_name_snapshot: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name_snapshot: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  customer_note: string | null;
  addons?: OrderItemAddon[];
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  session_id: string | null;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  subtotal: number;
  tax: number;
  service_charge: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  customer_note: string | null;
  estimated_prep_time: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  table?: Table;
  restaurant?: Restaurant;
}

export interface Review {
  id: string;
  restaurant_id: string;
  order_id: string | null;
  menu_item_id: string | null;
  rating: number;
  review_text: string | null;
  customer_name: string;
  is_approved: boolean;
  created_at: string;
}

export interface WaiterRequest {
  id: string;
  restaurant_id: string;
  table_id: string;
  type: WaiterRequestType;
  status: WaiterRequestStatus;
  created_at: string;
  resolved_at: string | null;
  table?: Table;
}

export interface Notification {
  id: string;
  restaurant_id: string;
  order_id: string | null;
  table_id: string | null;
  recipient_type: 'customer' | 'kitchen' | 'waiter' | 'admin';
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CustomerSession {
  id: string;
  restaurant_id: string;
  table_id: string;
  session_id: string;
  created_at: string;
  last_activity: string;
}

// Cart Item in Customer State
export interface CartItem {
  cartItemId: string; // unique UUID per cart line
  menuItem: MenuItem;
  quantity: number;
  selectedAddons: AddOn[];
  specialInstructions: string;
  unitPrice: number;
  lineTotal: number;
}
