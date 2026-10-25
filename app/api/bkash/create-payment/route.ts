import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { BkashGateway } from "@/lib/bkash/pgw";
import { CartItem } from "@/types/database";

export const dynamic = "force-dynamic";

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
      payerReference,
    } = body;

    if (!restaurantId || !tableId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Missing required order parameters." },
        { status: 400 }
      );
    }

    // Verify stock
    for (const item of cartItems as CartItem[]) {
      const serverItem = ServerStore.getMenuItemById(item.menuItem.id);
      if (serverItem && !serverItem.is_available) {
        return NextResponse.json(
          { error: `Item "${serverItem.name}" is sold out.` },
          { status: 400 }
        );
      }
    }

    // Create the order on server in pending & unpaid state
    const order = ServerStore.createOrder({
      restaurantId,
      tableId,
      sessionId,
      customerName,
      customerPhone,
      customerNote,
      cartItems,
      paymentMethod: "bkash",
    });

    const restaurant = ServerStore.getRestaurant(restaurantId);
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const callbackUrl = `${origin}/api/bkash/callback?orderId=${order.id}&restaurantId=${restaurantId}`;

    const config = {
      username: restaurant.bkash_username,
      password: restaurant.bkash_password,
      app_key: restaurant.bkash_app_key,
      app_secret: restaurant.bkash_app_secret,
      mode: restaurant.bkash_mode || "sandbox",
    };

    const paymentResponse = await BkashGateway.createPayment(config, {
      amount: order.total,
      orderNumber: order.order_number,
      orderId: order.id,
      callbackUrl,
      payerReference: payerReference || customerPhone || "Table Guest",
    });

    // Update order with payment ID
    order.bkash_payment_id = paymentResponse.paymentID;

    return NextResponse.json(
      {
        success: true,
        order,
        paymentID: paymentResponse.paymentID,
        bkashURL: paymentResponse.bkashURL,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("bKash create payment API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate bKash payment gateway." },
      { status: 500 }
    );
  }
}
