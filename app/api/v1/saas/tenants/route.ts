import { NextRequest, NextResponse } from "next/server";
import { validateSaaSRequest } from "@/lib/saas-hub";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/saas/tenants
 * Lists all registered restaurant tenants with full detail and owner accounts.
 * Protected by 'x-saas-api-key' or 'Authorization: Bearer <key>'.
 */
export async function GET(req: NextRequest) {
  const auth = validateSaaSRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
  }

  try {
    const restaurants = ServerStore.getAllRestaurants();
    const users = ServerStore.getUsers();
    const tables = ServerStore.getTables();
    const orders = ServerStore.getOrders();

    const data = restaurants.map((r) => {
      const tenantUsers = users
        .filter((u) => u.restaurant_id === r.id)
        .map((u) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          phone: u.phone,
          role: u.role,
          created_at: u.created_at,
        }));

      const tenantTables = tables.filter((t) => t.restaurant_id === r.id);
      const tenantOrders = orders.filter((o) => o.restaurant_id === r.id);
      const tenantValidOrders = tenantOrders.filter((o) => o.status !== "cancelled");
      const revenue = tenantValidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        phone: r.phone,
        address: r.address,
        is_active: r.is_active !== false,
        created_at: r.created_at,
        updated_at: r.updated_at,
        users_count: tenantUsers.length,
        users: tenantUsers,
        tables_count: tenantTables.length,
        orders_count: tenantOrders.length,
        total_revenue: revenue,
      };
    });

    return NextResponse.json({
      product: "SnapBite",
      total: data.length,
      tenants: data,
    });
  } catch (error: any) {
    console.error("[SaaS Tenants Endpoint Error]:", error);
    return NextResponse.json(
      { error: "Failed to list SaaS tenants", details: error.message },
      { status: 500 }
    );
  }
}
