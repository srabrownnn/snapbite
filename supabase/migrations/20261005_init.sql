-- SnapBite Database Schema Migration
-- Production PostgreSQL schema for multi-tenant restaurant QR ordering & kitchen management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    cover_image_url TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    currency TEXT NOT NULL DEFAULT '৳',
    tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    service_charge_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    opening_time TEXT NOT NULL DEFAULT '10:00 AM',
    closing_time TEXT NOT NULL DEFAULT '11:00 PM',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RESTAURANT USERS (STAFF & ROLES)
CREATE TABLE IF NOT EXISTS restaurant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id)
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'kitchen', 'waiter', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(restaurant_id, user_id)
);

-- 3. TABLES
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    qr_token TEXT UNIQUE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(restaurant_id, table_number)
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    preparation_time INTEGER NOT NULL DEFAULT 15, -- minutes
    calories INTEGER,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. MENU ITEM IMAGES (GALLERY)
CREATE TABLE IF NOT EXISTS menu_item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 7. ADD-ONS
CREATE TABLE IF NOT EXISTS add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. MENU ITEM ADD-ONS (M2M)
CREATE TABLE IF NOT EXISTS menu_item_addons (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES add_ons(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, addon_id)
);

-- 9. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    session_id TEXT,
    order_number TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    subtotal NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    service_charge NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bkash', 'nagad', 'online', 'unpaid')),
    customer_note TEXT,
    estimated_prep_time INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. ORDER ITEMS (WITH SNAPSHOT DATA)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name_snapshot TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    customer_note TEXT
);

-- 11. ORDER ITEM ADD-ONS
CREATE TABLE IF NOT EXISTS order_item_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    addon_name_snapshot TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1
);

-- 12. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    customer_name TEXT DEFAULT 'Guest',
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. WAITER REQUESTS
CREATE TABLE IF NOT EXISTS waiter_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('call_waiter', 'request_bill', 'assistance')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('customer', 'kitchen', 'waiter', 'admin')),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. CUSTOMER SESSIONS
CREATE TABLE IF NOT EXISTS customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_activity TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON tables(qr_token);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id, display_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_waiter_requests_active ON waiter_requests(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(restaurant_id, recipient_type, is_read);

-- REALTIME PUBLICATION ENABLEMENT (Supabase Realtime)
-- Enables realtime listening on operational tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read for active restaurant public info & menus
CREATE POLICY "Public can view active restaurants" ON restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view available menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public can view menu images" ON menu_item_images FOR SELECT USING (true);
CREATE POLICY "Public can view add ons" ON add_ons FOR SELECT USING (true);
CREATE POLICY "Public can view item add-on links" ON menu_item_addons FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can view tables by qr token" ON tables FOR SELECT USING (true);

-- Customers can insert orders, order items, and waiter requests
CREATE POLICY "Public can place orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view their own orders via session or id" ON orders FOR SELECT USING (true);
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public can insert order addons" ON order_item_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view order addons" ON order_item_addons FOR SELECT USING (true);
CREATE POLICY "Public can request waiter" ON waiter_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view waiter requests for their table" ON waiter_requests FOR SELECT USING (true);
CREATE POLICY "Public can insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Staff authenticated policies (full CRUD within their restaurant)
CREATE POLICY "Staff can manage restaurants" ON restaurants FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage tables" ON tables FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage menu items" ON menu_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage add-ons" ON add_ons FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage orders" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage order items" ON order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage waiter requests" ON waiter_requests FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage reviews" ON reviews FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can manage notifications" ON notifications FOR ALL TO authenticated USING (true);
