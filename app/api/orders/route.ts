import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { CartItem } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId") || undefined;
    const orders = ServerStore.getOrders(restaurantId);
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    console.error("GET orders API error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      tableId,
      sessionId,
      customerName,
      customerPhone,
      customerNote,
      cartItems,
      paymentMethod,
    } = body;

    if (!restaurantId || !tableId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Missing required order parameters (restaurantId, tableId, cartItems)." },
        { status: 400 }
      );
    }

    // Server-side stock availability verification
    for (const cartItem of cartItems as CartItem[]) {
      const serverItem = ServerStore.getMenuItemById(cartItem.menuItem.id);
      if (serverItem && !serverItem.is_available) {
        return NextResponse.json(
          { error: `Item "${serverItem.name}" is sold out.` },
          { status: 400 }
        );
      }
    }

    // Authoritative order creation on server
    const order = ServerStore.createOrder({
      restaurantId,
      tableId,
      sessionId,
      customerName,
      customerPhone,
      customerNote,
      cartItems,
      paymentMethod: paymentMethod || "cash",
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error("POST order API error:", error);
    return NextResponse.json(
      { error: "Internal server error processing order." },
      { status: 500 }
    );
  }
}
