import { NextRequest, NextResponse } from "next/server";
import { validateSaaSRequest } from "@/lib/saas-hub";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/saas/tenants/[id]
 * Fetch single tenant details
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = validateSaaSRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const restaurant = ServerStore.getRestaurant(id);
  if (!restaurant || (restaurant.id !== id && restaurant.slug !== id)) {
    return NextResponse.json({ error: "Tenant restaurant not found" }, { status: 404 });
  }

  const users = ServerStore.getUsers()
    .filter((u) => u.restaurant_id === restaurant.id)
    .map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      role: u.role,
      created_at: u.created_at,
    }));

  const tables = ServerStore.getTables(restaurant.id);
  const orders = ServerStore.getOrders(restaurant.id);
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const revenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return NextResponse.json({
    restaurant,
    users,
    tables_count: tables.length,
    orders_count: orders.length,
    total_revenue: revenue,
  });
}

/**
 * PATCH /api/v1/saas/tenants/[id]
 * Remote control: Suspend or activate a tenant from the Central SaaS Dashboard
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = validateSaaSRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const restaurant = ServerStore.getRestaurant(id);
  if (!restaurant || (restaurant.id !== id && restaurant.slug !== id)) {
    return NextResponse.json({ error: "Tenant restaurant not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const updates: any = { id: restaurant.id };

    if (typeof body.is_active === "boolean") {
      updates.is_active = body.is_active;
    }
    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }

    const updated = ServerStore.updateRestaurant(updates);

    return NextResponse.json({
      success: true,
      message: `Tenant ${updated.name} updated successfully.`,
      tenant: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update tenant" }, { status: 500 });
  }
}
