import { NextRequest, NextResponse } from "next/server";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { CartItem } from "@/types/database";

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

    // SERVER-SIDE VALIDATION:
    // 1. Check if any items are currently unavailable
    for (const cartItem of cartItems as CartItem[]) {
      const serverItem = SnapBiteStore.getMenuItemById(cartItem.menuItem.id);
      if (serverItem && !serverItem.is_available) {
        return NextResponse.json(
          { error: `Item "${serverItem.name}" is currently sold out and unavailable.` },
          { status: 400 }
        );
      }
    }

    // 2. Authoritative price recalculation is performed in SnapBiteStore.createOrder
    const order = SnapBiteStore.createOrder({
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
    console.error("Order creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error processing order." },
      { status: 500 }
    );
  }
}
