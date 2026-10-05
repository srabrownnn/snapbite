-- SnapBite Demo Seed Data
-- Run this in your Supabase SQL Editor to populate sample restaurant, tables, categories, menu items, addons, orders, and reviews.

-- 1. Create Demo Restaurant
INSERT INTO restaurants (
    id, name, slug, logo_url, cover_image_url, description, address, phone, currency, tax_percentage, service_charge_percentage, opening_time, closing_time
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'SnapBite Demo Restaurant',
    'demo-restaurant',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=500&q=80',
    'Artisanal stone-baked pizzas, gourmet smash burgers, handcrafted pasta & chilled craft drinks.',
    'Gulshan-2, Avenue 4, Dhaka 1212',
    '+880 1712 345678',
    '৳',
    5.00,
    2.50,
    '11:00 AM',
    '11:30 PM'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2. Create Tables 1 to 20
INSERT INTO tables (id, restaurant_id, table_number, qr_token, capacity, status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Table 1', 'tbl_tok_01_snap', 2, 'available'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Table 2', 'tbl_tok_02_snap', 2, 'available'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Table 3', 'tbl_tok_03_snap', 4, 'occupied'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Table 4', 'tbl_tok_04_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Table 5', 'tbl_tok_05_snap', 6, 'reserved'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Table 6', 'tbl_tok_06_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Table 7', 'tbl_tok_07_snap', 4, 'occupied'),
    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Table 8', 'tbl_tok_08_snap', 2, 'available'),
    ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Table 9', 'tbl_tok_09_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Table 10', 'tbl_tok_10_snap', 6, 'available'),
    ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Table 11', 'tbl_tok_11_snap', 2, 'available'),
    ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Table 12', 'tbl_tok_12_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'Table 13', 'tbl_tok_13_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'Table 14', 'tbl_tok_14_snap', 8, 'available'),
    ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'Table 15', 'tbl_tok_15_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'Table 16', 'tbl_tok_16_snap', 2, 'available'),
    ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'Table 17', 'tbl_tok_17_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'Table 18', 'tbl_tok_18_snap', 6, 'available'),
    ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'Table 19', 'tbl_tok_19_snap', 4, 'available'),
    ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'Table 20', 'tbl_tok_20_snap', 10, 'available')
ON CONFLICT (qr_token) DO NOTHING;

-- 3. Categories
INSERT INTO categories (id, restaurant_id, name, description, image_url, display_order, is_active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Burgers', 'Juicy grilled patties, brioche buns and signature secret sauces', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', 1, true),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Pizza', 'Authentic sourdough Neapolitan thin-crust pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', 2, true),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Pasta', 'Freshly made Italian pasta tossed in creamy and herbaceous sauces', 'https://images.unsplash.com/photo-1621996346565-e3d5d628102a?auto=format&fit=crop&w=400&q=80', 3, true),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Drinks', 'Craft coolers, iced brews, fresh shakes, and mocktails', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80', 4, true),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Desserts', 'Decadent sweet endings made from scratch daily', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Add-ons
INSERT INTO add_ons (id, restaurant_id, name, price, is_available)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Extra Cheese Melt', 40.00, true),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Crispy Bacon Strips', 75.00, true),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Extra Grilled Chicken Patty', 120.00, true),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Truffle Mayo Dip', 35.00, true),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', 'Jalapeño Fire Slices', 25.00, true),
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Large Size Upgrade', 90.00, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Menu Items (16 food items)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, preparation_time, calories, is_available, is_featured, display_order)
VALUES
    -- Burgers
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Signature Smash Chicken Burger', 'Crispy buttermilk chicken thigh, aged cheddar, butterhead lettuce, pickled cucumber and house smoked paprika aioli in toasted brioche.', 320.00,
     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 15, 680, true, true, 1),

    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Double Angus Beef Cheeseburger', 'Two 100g Australian Angus smash patties, double yellow cheddar, caramelized sweet onions, dijon mustard, and brioche.', 480.00,
     'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80', 18, 850, true, true, 2),

    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Spicy BBQ Pulled Chicken', 'Slow-cooked shredded barbecue chicken breast, pickled jalapeño slaw, molten mozzarella.', 350.00,
     'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80', 12, 610, true, false, 3),

    -- Pizzas
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
     'Classic Margherita Napoletana', 'San Marzano tomato coulis, fresh buffalo mozzarella, hand-torn basil leaves, extra virgin cold-pressed olive oil.', 520.00,
     'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80', 15, 780, true, true, 4),

    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
     'Pepperoni Hot Honey Pizza', 'Italian cured beef pepperoni, creamy mozzarella, chili-infused organic raw honey drizzle, fresh oregano.', 640.00,
     'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80', 16, 920, true, true, 5),

    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
     'Quattro Formaggi Bianca', 'Rich white pizza with gorgonzola, aged parmesan, creamy fontina, fresh mozzarella, and thyme.', 690.00,
     'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=600&q=80', 15, 870, true, false, 6),

    ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
     'Smoked BBQ Chicken Pizza', 'Wood-smoked chicken strips, red onion rings, sweet barbecue glaze, cilantro sprigs, mozzarella.', 590.00,
     'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80', 16, 840, true, false, 7),

    -- Pasta
    ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003',
     'Creamy Fettuccine Alfredo', 'Velvety garlic-parmesan cream reduction tossed with house-made fettuccine ribbons and cracked black pepper.', 420.00,
     'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80', 14, 710, true, true, 8),

    ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003',
     'Spaghetti Bolognese Rustico', 'Slow-braised minced beef ragù with rosemary, vine tomatoes, and 24-month aged Parmigiano Reggiano.', 470.00,
     'https://images.unsplash.com/photo-1621996346565-e3d5d628102a?auto=format&fit=crop&w=600&q=80', 15, 650, true, false, 9),

    ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003',
     'Penne Pesto Genovese', 'Crushed sweet basil, toasted pine nuts, pecorino cheese, garlic, and extra virgin olive oil over bronze-cut penne.', 440.00,
     'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', 12, 590, true, false, 10),

    -- Drinks
    ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004',
     'Fresh Passionfruit Mint Cooler', 'Crushed passion fruit nectar, fresh garden mint, Persian lime juice, bubbly club soda over crushed ice.', 180.00,
     'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 5, 140, true, true, 11),

    ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004',
     'Belgian Iced Mocha Frappé', 'Double shot single-origin espresso, Callebaut dark chocolate, whole milk, topped with whipped vanilla cream.', 240.00,
     'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80', 6, 320, true, false, 12),

    ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004',
     'Mango Basil Craft Lemonade', 'Ripe Rajshahi mango puree, cold-pressed lemons, fresh basil infusion and sparkling mineral water.', 190.00,
     'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80', 5, 160, true, false, 13),

    -- Desserts
    ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005',
     'Molten Dark Chocolate Lava Cake', 'Warm molten center with 70% dark Valrhona cocoa, dusted with sugar and paired with Madagascar vanilla gelato.', 280.00,
     'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 10, 490, true, true, 14),

    ('e0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005',
     'Classic Italian Tiramisù', 'Espresso-soaked Savoiardi ladyfingers, creamy mascarpone sabayon, bitter Dutch cocoa dusting.', 290.00,
     'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', 5, 410, true, false, 15),

    ('e0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005',
     'New York Berry Cheesecake', 'Graham cracker crust, baked cream cheese silky custard with wild blueberry compote.', 260.00,
     'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80', 5, 460, true, false, 16)
ON CONFLICT (id) DO NOTHING;

-- 6. Link Add-ons to Menu Items
INSERT INTO menu_item_addons (menu_item_id, addon_id) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003'),
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002'),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

-- 7. Sample Reviews
INSERT INTO reviews (restaurant_id, menu_item_id, rating, review_text, customer_name, is_approved) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 5, 'Best chicken burger in the city! So juicy and crispy.', 'Farhan Ahmed', true),
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 5, 'Quick service, buns were super soft, melted cheese was incredible.', 'Nabila Islam', true),
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 5, 'The double smash patties had the perfect crust! 10/10.', 'Tanvir Hossain', true),
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 5, 'Real sourdough crust with smoky char. Reminds me of Naples.', 'Sabrina Chowdhury', true),
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000008', 4, 'Creamy, rich and warm. Great portion size.', 'Kamrul Hasan', true),
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000014', 5, 'The lava cake was hot, rich and gooey. Perfect vanilla gelato contrast.', 'Ayesha Rahman', true);

-- 8. Sample Orders in Various States
INSERT INTO orders (
    id, restaurant_id, table_id, order_number, customer_name, customer_phone, subtotal, tax, service_charge, discount, total, status, payment_status, payment_method, customer_note, estimated_prep_time, created_at
) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
     '#1041', 'Tanvir Hossain', '+8801711111111', 840.00, 42.00, 21.00, 0.00, 903.00, 'pending', 'unpaid', 'cash', 'Please make the burger extra crispy', 20, now() - INTERVAL '4 minutes'),

    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007',
     '#1042', 'Rifat Karim', '+8801822222222', 1160.00, 58.00, 29.00, 0.00, 1247.00, 'accepted', 'unpaid', 'cash', 'Less spicy, no ice in cooler', 15, now() - INTERVAL '8 minutes'),

    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012',
     '#1043', 'Amina Begum', '+8801933333333', 700.00, 35.00, 17.50, 0.00, 752.50, 'preparing', 'unpaid', 'cash', 'Table 12 family dinner', 12, now() - INTERVAL '14 minutes'),

    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004',
     '#1044', 'Sadia Jahan', '+8801644444444', 920.00, 46.00, 23.00, 0.00, 989.00, 'ready', 'paid', 'bkash', 'Allergies: no peanuts', 5, now() - INTERVAL '19 minutes'),

    ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     '#1045', 'Mahmudul Hasan', '+8801555555555', 1340.00, 67.00, 33.50, 0.00, 1440.50, 'completed', 'paid', 'card', 'Enjoyed the meal!', 0, now() - INTERVAL '45 minutes')
ON CONFLICT (id) DO NOTHING;

-- Order Items for Demo Orders
INSERT INTO order_items (id, order_id, menu_item_id, item_name_snapshot, quantity, unit_price, subtotal, customer_note) VALUES
    ('00000001-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Signature Smash Chicken Burger', 2, 320.00, 640.00, 'Extra crispy chicken'),
    ('00000001-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000011', 'Fresh Passionfruit Mint Cooler', 1, 180.00, 180.00, NULL),
    ('00000001-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000005', 'Pepperoni Hot Honey Pizza', 1, 640.00, 640.00, 'Drizzle honey generously'),
    ('00000001-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', 'Classic Margherita Napoletana', 1, 520.00, 520.00, NULL),
    ('00000001-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000008', 'Creamy Fettuccine Alfredo', 1, 420.00, 420.00, NULL),
    ('00000001-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000014', 'Molten Dark Chocolate Lava Cake', 1, 280.00, 280.00, NULL)
ON CONFLICT (id) DO NOTHING;

-- 9. Sample Waiter Requests
INSERT INTO waiter_requests (restaurant_id, table_id, type, status, created_at) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 'call_waiter', 'pending', now() - INTERVAL '2 minutes'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'request_bill', 'pending', now() - INTERVAL '5 minutes');
