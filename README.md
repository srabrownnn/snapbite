# SnapBite - Smart Restaurant QR-Code Ordering & Kitchen Management SaaS

SnapBite is a multi-tenant restaurant software platform that replaces physical paper menus and manual order taking with mobile-first tabletop QR scanning, real-time kitchen displays (KDS), and a restaurant operations dashboard.

---

## 🌟 Highlights & Key Features

- **📱 Zero App Download for Customers**: Customers scan the QR code located on their dining table using any smartphone camera. The system automatically detects their restaurant and table number (e.g. Table 12).
- **🍽️ Mobile-First Digital Menu**: High-resolution dish photos, descriptions, calorie counts, preparation times, dietary tags, multi-image galleries, and verified guest reviews.
- **✨ Custom Add-ons & Notes**: Extra cheese, patties, sauces, or custom dietary instructions (*"Less spicy"*, *"No raw onions"*).
- **🔒 Server-Side Order Validation**: Item prices, stock availability, tax calculations, and service charges are validated and verified server-side.
- **⚡ Real-Time Kitchen Display System (KDS)**:
  - 5-stage Kanban workflow: `NEW ORDERS (Pending)` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED`.
  - Elapsed urgency timers with visual color alerts (Green ➔ Amber ➔ Red).
  - High-attention audible double chime on incoming orders with a Sound ON/OFF switch.
  - Fullscreen display mode for tablet and kitchen wall mounts.
- **🔔 Live Customer Ready Notification**: When kitchen staff marks an order as `READY`, customer browsers receive an instant audio chime, a floating notification banner, and an order pickup prompt.
- **🛎️ Tabletop Service & Bill Request**: Floating *"Call Waiter"* and *"Request Bill"* buttons that instantly dispatch alerts to the restaurant dashboard.
- **🖨️ Printable Tabletop Acrylic Cards & QR Generator**: Generate high-res QR codes for Tables 1–20, download PNG / SVG formats, and print pre-formatted tabletop acrylic cards.
- **🏢 Multi-Tenant SaaS Architecture**: Built from the ground up to support multiple restaurants with separate menus, tables, orders, reviews, and currencies (`/super-admin`).
- **💳 Payment Abstraction Layer**: Pluggable provider architecture supporting Pay at Counter, Pay at Table, bKash, Nagad, and Card gateways.

---

## 🏗️ System Architecture

```
                                  [ Tabletop QR Code ]
                                            │
                                            ▼
                           /r/[restaurantSlug]/t/[tableToken]
                               (Customer Mobile Experience)
                                 │                      ▲
                 Orders & Calls  │                      │ Order Status
                 (WebSockets)    ▼                      │ & Alerts
                              ┌─────────────────────────────┐
                              │     Supabase / Postgres     │
                              │       Realtime Engine       │
                              └─────────────────────────────┘
                                 ▲                      │
                   Status Action │                      │ Realtime Tickets
                                 │                      ▼
                           /admin & /kitchen (Tablet / Desktop KDS)
```

---

## 📁 Project Directory Structure

```
d:/snapbite/
├── app/
│   ├── layout.tsx                   # Global Root Layout with PWA meta & viewport
│   ├── page.tsx                     # Landing page & tabletop QR simulator
│   ├── globals.css                  # Tailwind styles, color tokens & glassmorphism
│   ├── r/[restaurantSlug]/t/[tableToken]/ # Canonical customer mobile table view
│   ├── menu/[restaurantSlug]/       # Compatibility menu route
│   ├── kitchen/                     # Dedicated Kitchen Display System (KDS)
│   ├── admin/
│   │   ├── page.tsx                 # Overview KPI metrics & hourly sales analytics
│   │   ├── orders/                  # Orders filter, details drawer, payment status
│   │   ├── menu/                    # Food item CRUD, availability & add-ons
│   │   ├── tables/                  # Tables 1-20, QR generation & printable card
│   │   ├── waiter-requests/         # Live waiter calls & bill requests
│   │   ├── reviews/                 # Customer review moderation
│   │   └── settings/                # Business branding, currency, tax & hours
│   ├── super-admin/                 # Multi-tenant SaaS root admin
│   └── api/orders/                  # Server-side order verification API
├── components/
│   ├── customer/                    # Mobile-first customer UI components
│   └── admin/                       # Dashboard layouts, sidebars & navigation
├── lib/
│   ├── store/demo-store.ts          # Reactive data-store with multi-tab sync
│   ├── store/demo-data.ts           # Demo restaurant, items & orders
│   ├── store/cart-context.tsx       # Customer shopping cart & tax calculations
│   ├── qr/generator.ts              # QR PNG/SVG generator & table card printer
│   ├── audio.ts                     # Web Audio API synthesizers for kitchen/customer
│   ├── session.ts                   # Anonymous table session manager
│   ├── payments/                    # Payment provider abstraction (bKash/Cash/Card)
│   ├── supabase/                    # Supabase browser & server clients
│   └── utils.ts                     # Currency, date & time formatters
├── supabase/
│   ├── migrations/20261005_init.sql # PostgreSQL schema, RLS policies & Realtime
│   └── seed.sql                     # Seed data (Demo restaurant, 20 tables, 16 dishes)
├── public/manifest.json             # Progressive Web App manifest
├── package.json
└── tsconfig.json
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** v18+ or v20+ / v24+
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone or navigate to the directory
cd d:/snapbite

# Install packages
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup & Database Migration

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project** and name it `snapbite`.
3. Note your database password and project region.

### 2. Apply Schema Migration
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Open [`supabase/migrations/20261005_init.sql`](file:///d:/snapbite/supabase/migrations/20261005_init.sql).
3. Paste the contents and click **Run**.
4. This creates all 15 relational tables, indexes, Row Level Security (RLS) policies, and registers Realtime publications.

### 3. Load Seed / Demo Data
1. In the SQL Editor, open [`supabase/seed.sql`](file:///d:/snapbite/supabase/seed.sql).
2. Paste and click **Run**.
3. This creates:
   - Restaurant: `SnapBite Demo Restaurant` (slug: `demo-restaurant`)
   - Tables: `Table 1` to `Table 20` with unique QR tokens
   - Categories: Burgers, Pizza, Pasta, Drinks, Desserts
   - 16 artisanal dishes with high-res photos, allergens, calories, and add-ons
   - Sample orders across multiple statuses (Pending, Accepted, Preparing, Ready)
   - Sample verified customer reviews

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the values from **Supabase Dashboard ➔ Project Settings ➔ API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Even without Supabase credentials configured initially, SnapBite includes an interactive in-memory and LocalStorage reactive mock store so you can immediately demo, test orders, and print QR codes out of the box!

---

## 🚢 Vercel Deployment Instructions

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and click **Add New ➔ Project**.
3. Import the repository.
4. Set the Framework Preset to **Next.js**.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (Set to your Vercel deployment URL, e.g. `https://snapbite.vercel.app`)
6. Click **Deploy**.

---

## 🖨️ How to Generate & Print Table QR Codes

1. Navigate to `/admin/tables`.
2. Locate any table (e.g., **Table 12**).
3. Click **Get QR Code**.
4. You can:
   - **Download PNG**: High-resolution raster image for graphic designers.
   - **Download SVG**: Vector graphic for large vinyl stickers or signage.
   - **Print Card**: Opens a printable A5 table tent layout containing:
     - Restaurant Logo
     - Restaurant Name
     - Table Number pill
     - QR Code
     - *"Scan to Browse & Order"* instructions
     - *"Powered by SnapBite"* footer
5. Place the printed card or acrylic stand on the dining table.

---

## 👨‍🍳 How Kitchen Staff Use the System

1. Open `/kitchen` on an iPad, Android tablet, or kitchen monitor.
2. Click the **Fullscreen** icon in the top right.
3. Turn **Sound ON** to hear audio chimes when new tickets arrive.
4. Workflow:
   - **NEW ORDERS**: Review table number, items, add-ons, and customer notes. Click **[ ACCEPT ORDER ]**.
   - **ACCEPTED**: Click **[ START PREPARING ]** when the cook starts cooking.
   - **PREPARING**: Ticket timer turns Amber after 10 mins and Red after 20 mins. When plated, click **[ MARK AS READY 🔔 ]**.
   - **READY**: A notification with sound is sent to the customer. When picked up by the server, click **[ MARK AS SERVED ]**.
   - **SERVED**: Click **[ COMPLETE TICKET ]**.

---

## 📱 How Customers Use the System

1. Scan the tabletop QR code with a phone camera.
2. The browser opens `/r/demo-restaurant/t/[tableToken]` (Table 12).
3. Browse food categories (Burgers, Pizzas, Pastas, Drinks, Desserts).
4. Tap any dish to open the bottom sheet, customize add-ons, and add instructions (*"Less spicy"*).
5. Open the Cart, review bill calculations (Subtotal + Tax + Service Charge), select a payment method, and tap **Place Order**.
6. Follow the live status tracker: *Order Received ➔ Accepted ➔ Preparing ➔ Ready*.
7. When food is ready, the phone plays a chime and shows a *"Your Order is Ready!"* banner.
8. If needed, the customer can tap **Call Waiter** or **Request Bill** at any time.
9. After the meal, the customer can submit a 1–5 star review with feedback.

---

## 🏢 How to Add a New Restaurant (Multi-Tenant)

1. Open `/super-admin`.
2. Click **Provision New Restaurant Tenant**.
3. Enter:
   - **Restaurant Name**: (e.g. *Bella Italia Bistro*)
   - **URL Slug**: (e.g. *bella-italia*)
   - **Currency**: (e.g. *৳* or *$*)
4. Click **Provision Tenant**.
5. The new restaurant receives its own independent tables, menu categories, orders, reviews, and analytics.

---

## 🔒 Production Security Checklist

- [x] **Row Level Security (RLS)**: Public users can only read active restaurant menus and insert their own orders/waiter requests.
- [x] **Service Role Key Protection**: Service keys are never exposed to browser bundles.
- [x] **Server-Side Price Validation**: Customer cannot modify item prices or add-on costs in the browser; all calculations are executed authoritatively on the backend.
- [x] **Tamper-Proof Table Tokens**: Orders cannot be placed for arbitrary table numbers without a valid QR token.
- [x] **Payment Card Safety**: Zero credit card numbers or CVVs are stored directly in the database.
- [x] **Input Sanitization**: Special instructions, names, and reviews are trimmed and validated.
